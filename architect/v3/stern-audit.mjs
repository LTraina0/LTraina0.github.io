import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {kitVolume,surfaceContact} from '../v2/kit-shapes.mjs';
import {sternCatalog} from './stern-catalog.mjs';
import {generateStern,pos} from './stern.mjs';

const edge=(a,b)=>[a,b].sort().join('|');
const directions=[[1,0,0],[0,1,0],[0,0,1]];
const address=p=>p.join(',');
function graph(blocks){
  const at=new Map(blocks.map(b=>[address(pos(b)),b])),neighbors=new Map(),edges=new Set(),cuts=new Set(),volumes=new Map();
  assert.equal(at.size,blocks.length,'Colisão na cena');
  const volume=b=>{
    const sig=b.id+JSON.stringify(b.states);
    if(!volumes.has(sig))volumes.set(sig,kitVolume(sternCatalog[b.id].shape,b.states));
    return volumes.get(sig);
  };
  for(const b of blocks)neighbors.set(b,[]);
  for(const b of blocks)for(const [dx,dy,dz] of directions){
    const c=at.get(address([b.x+dx,b.y+dy,b.z+dz]));
    if(!c||!surfaceContact(volume(b),volume(c),[dx,dy,dz]))continue;
    const e=edge(address(b.origin),address(c.origin));
    edges.add(e);if(b.piece!==c.piece)cuts.add(e);
    neighbors.get(b).push(c);neighbors.get(c).push(b);
  }
  const visited=new Set(),islands=[];
  for(const b of blocks)if(!visited.has(b)){
    const queue=[b];visited.add(b);
    for(let i=0;i<queue.length;i++)for(const c of neighbors.get(queue[i]))if(!visited.has(c)){visited.add(c);queue.push(c);}
    islands.push(queue.length);
  }
  return {edges,cuts,islands:islands.sort((a,b)=>b-a)};
}
// Independent inverse for the specified half turn. End-face orientation and all metadata are checked separately.
function restore(b,phase,translation){
  if(phase!=='displaced'||b.piece!=='panel')return {...b};
  const states={...b.states};
  if(Object.hasOwn(states,'weirdo_direction'))states.weirdo_direction=[1,0,3,2][states.weirdo_direction];
  if(Object.hasOwn(states,'direction'))states.direction=[1,0,3,2][states.direction];
  const [dx,dy,dz]=translation;
  return {...b,x:dx-b.x,y:b.y-dy,z:dz-b.z,states};
}
function signature(blocks){
  const entries=blocks.map(b=>JSON.stringify([pos(b),b.component,b.module,b.id,b.states,b.appearance,b.piece])).sort();
  return createHash('sha256').update(entries.join('\n')).digest('hex');
}
export function auditStern(models=['intact','broken','displaced'].map(phase=>generateStern({phase}))){
  const [original,broken,moved]=models,byOrigin=new Map(original.blocks.map(b=>[b.sourceCell,b]));
  const count=original.blocks.length,panel=original.blocks.filter(b=>b.piece==='panel'),body=count-panel.length;
  const graphs=models.map(m=>graph(m.blocks)),[g0,g1,g2]=graphs;
  assert.deepEqual(g0.islands,[count]);assert.deepEqual(g1.islands,[body]);assert.deepEqual(g2.islands,[body,panel.length].sort((a,b)=>b-a));
  assert.equal(byOrigin.size,count);assert.equal(moved.blocks.length,count);assert.equal(broken.blocks.length,body);
  const bodySources=new Set(original.blocks.filter(b=>b.piece==='body').map(b=>b.sourceCell));
  assert.deepEqual(new Set(broken.blocks.map(b=>b.sourceCell)),bodySources);
  assert.deepEqual(new Set(moved.blocks.map(b=>b.sourceCell)),new Set(byOrigin.keys()));
  for(const m of models)for(const b of m.blocks){
    const ancestor=byOrigin.get(b.sourceCell),restored=restore(b,m.params.phase,m.stern.panelTransform.translation);
    assert.ok(ancestor);assert.deepEqual(b.origin,pos(ancestor));assert.deepEqual(restored,ancestor);
  }
  const seams=original.stern.joints.filter(g=>g.interface==='cut');
  const enumerated=seams.flatMap(g=>g.contacts.map(([a,b])=>edge(address(a),address(b))));
  assert.equal(new Set(enumerated).size,enumerated.length);assert.deepEqual(new Set(enumerated),g0.cuts);
  const preserved=new Set([...g0.edges].filter(e=>!g0.cuts.has(e)));
  assert.deepEqual(g2.edges,preserved);assert.equal(g1.cuts.size,0);assert.equal(g2.cuts.size,0);
  for(let i=0;i<models.length;i++)for(const joint of models[i].stern.joints){
    for(const [a,b] of joint.contacts)assert.equal(graphs[i].edges.has(edge(address(a),address(b))),joint.status==='preserved');
  }
  const restored=moved.blocks.map(b=>restore(b,'displaced',moved.stern.panelTransform.translation));
  const before=signature(original.blocks),after=signature(restored);assert.equal(after,before);
  return {source:original.stern.canonicalId,phases:models.map((m,i)=>({phase:m.params.phase,cells:m.blocks.length,
    connectedBodies:graphs[i].islands,contacts:graphs[i].edges.size})),body,panel:panel.length,brokenFaceContacts:enumerated.length,
    preservedFaceContacts:preserved.size,originalSHA256:before,reassembledSHA256:after,transform:moved.stern.panelTransform,
    joints:original.stern.joints.map(g=>({id:g.id,label:g.label,type:g.interface,contacts:g.contacts.length,example:g.contacts[0]})),
    materialCounts:original.materials,scope:'Conectividade por superfícies ocupadas na prévia. Sem cálculo de carga ou ensaio dentro do jogo.'};
}

