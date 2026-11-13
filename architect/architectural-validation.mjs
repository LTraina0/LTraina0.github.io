import {key} from './model.mjs';
import {kitVolume,surfaceContact} from './v2/kit-shapes.mjs';

export function coversFace(boxes,normal){
  const axis=normal.findIndex(n=>n),edge=normal[axis]>0?16:0,tangents=[0,1,2].filter(i=>i!==axis);
  for(let a=.5;a<16;a++)for(let b=.5;b<16;b++){
    if(!boxes.some(box=>box[axis]<=edge&&box[axis+3]>=edge&&box[tangents[0]]<=a&&box[tangents[0]+3]>=a&&box[tangents[1]]<=b&&box[tangents[1]+3]>=b))return false;
  }
  return true;
}
export function auditArchitecture(model,catalog){
  const map=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b])),issues=[],cache=new Map();
  const volume=b=>{
    const signature=b.id+JSON.stringify(b.states);
    if(!cache.has(signature))cache.set(signature,kitVolume(catalog[b.id].shape,b.states));
    return cache.get(signature);
  };
  const p=model.params.roof??model.params;
  const basis=model.architecture?.designBasis??{x:[1,0,0],z:[0,0,1]};
  const local=b=>[b.x*basis.x[0]+b.z*basis.x[2],b.y,b.x*basis.z[0]+b.z*basis.z[2]];
  const canonical=new Map(model.blocks.map(b=>[key(...local(b)),b]));
  if(p.family==='irimoya'){
    const w=(p.width-1)/2,l=(p.length-1)/2,setback=Math.max(2,Math.min(w-2,Math.round(w*(1-p.gableFraction))));
    for(const sign of [-1,1]){
      const z=sign*(l-setback);
      for(let x=-w;x<=w;x++){
        const gables=model.blocks.filter(b=>b.module==='gables'&&local(b)[0]===x&&local(b)[2]===z).sort((a,b)=>a.y-b.y);
        const first=gables[0];if(!first)continue;
        const ahead=model.blocks.filter(b=>b.module==='skin'&&local(b)[0]===x&&local(b)[2]===z+sign).sort((a,b)=>b.y-a.y)[0];
        if(!ahead)continue;
        const top=ahead.y+Math.max(...volume(ahead).map(v=>v[4]))/16;
        if(first.structuralRole==='gable-apron'){
          const above=canonical.get(key(x,first.y+1,z));
          if(!above||!surfaceContact(volume(first),volume(above),[0,1,0])||!surfaceContact(volume(first),volume(ahead),basis.z.map(n=>n*sign)))
            issues.push({code:'gable-gap',at:[x,first.y,z],gap:0.5});
        }
        if(top<first.y){
          const apron=canonical.get(key(x,first.y-1,z));
          if(!apron||!surfaceContact(volume(apron),volume(first),[0,1,0])||!surfaceContact(volume(apron),volume(ahead),basis.z.map(n=>n*sign)))
            issues.push({code:'gable-gap',at:[x,first.y,z],gap:first.y-top});
        }
      }
    }
  }
  const architecture=model.architecture;
  if(!architecture)return issues;
  for(const joint of architecture.gableJoints??[]){
    const apron=map.get(key(...joint.apron)),gable=map.get(key(...joint.gable)),roof=map.get(key(...joint.roof));
    if(!apron||!gable||!roof||!surfaceContact(volume(apron),volume(gable),[0,1,0])||
      !surfaceContact(volume(apron),volume(roof),joint.normal))
      issues.push({code:'gable-gap',at:joint.apron});
  }
  for(const section of architecture.sections){
    for(let y=section.from;y<section.to;y++){
      const b=map.get(key(section.x,y,section.z));
      if(b&&!['upperEnvelope','beams','brackets','cornice'].includes(b.module))
        issues.push({code:'module-incompatible',at:[section.x,y,section.z],module:b.module});
      if(!b||!coversFace(volume(b),section.normal))
        issues.push({code:'envelope-gap',at:[section.x,y,section.z],module:b?.module??null});
    }
  }
  for(const b of model.blocks){
    for(const box of volume(b)){
      if(box.some((n,i)=>!Number.isFinite(n)||n<0||n>16)||[0,1,2].some(i=>box[i]>=box[i+3]))
        issues.push({code:'invalid-block-volume',at:[b.x,b.y,b.z]});
      for(const opening of architecture.clearance){
        const min=[b.x,b.y,b.z].map((n,i)=>n+box[i]/16),max=[b.x,b.y,b.z].map((n,i)=>n+box[i+3]/16);
        if([0,1,2].every(i=>Math.min(max[i],opening.max[i])>Math.max(min[i],opening.min[i])))
          issues.push({code:'circulation-obstructed',at:[b.x,b.y,b.z],opening:opening.id});
      }
    }
  }
  return issues;
}
export function assertArchitecture(model,catalog){
  const issues=auditArchitecture(model,catalog);
  if(issues.length)throw Error('Encontro arquitetônico inválido: '+JSON.stringify(issues.slice(0,3)));
  return {sections:model.architecture?.sections.length??0,clearance:model.architecture?.clearance.length??0};
}
export function transformArchitecture(architecture,vector){
  if(!architecture)return architecture;
  return {...architecture,designBasis:{x:vector(architecture.designBasis?.x??[1,0,0]),z:vector(architecture.designBasis?.z??[0,0,1])},
    gableJoints:architecture.gableJoints?.map(j=>({...j,apron:vector(j.apron),gable:vector(j.gable),roof:vector(j.roof),normal:vector(j.normal)})),sections:architecture.sections.map(s=>{
    const [x,,z]=vector([s.x,0,s.z]);return {...s,x,z,normal:vector(s.normal)};
  }),clearance:architecture.clearance.map(c=>{
    // Continuous boxes transform around block-cell boundaries, whose origin is half a cell.
    const points=[];
    for(const x of [c.min[0],c.max[0]])for(const z of [c.min[2],c.max[2]]){
      const p=vector([x-.5,0,z-.5]);points.push([p[0]+.5,0,p[2]+.5]);
    }
    return {...c,min:[Math.min(...points.map(p=>p[0])),c.min[1],Math.min(...points.map(p=>p[2]))],
      max:[Math.max(...points.map(p=>p[0])),c.max[1],Math.max(...points.map(p=>p[2]))]};
  })};
}
