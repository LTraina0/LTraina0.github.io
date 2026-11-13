import {readFile} from 'node:fs/promises';
import {assembleRoof,validateModel,catalog} from './laboratory.mjs';
import {recommend,composeGradient,generatePaletteStudy,groupMaterials,applyPalette} from './palette.mjs';
import {generateKitStudy,transformKitBlock,kitRegistry} from './kit.mjs';
import {transformBlock,boundsOf} from '../model.mjs';
import {discretizationStudy} from './geometry.mjs';
import {discover} from './discovery.mjs';
import {generateFacade} from '../v21/facade.mjs';
import {generateRefinedFacade} from '../v22/facade.mjs';
import {transformArchitecture} from '../architectural-validation.mjs';
import {navalRegistry} from '../v3/naval-blocks.mjs';
import {generateStern} from '../v3/stern.mjs';
import {generateShipwreck} from '../v3/shipwreck.mjs';
import {transformNaval} from '../v3/validation.mjs';

async function input(argument){
  if(argument==='-'){let content='';for await(const chunk of process.stdin)content+=chunk;return JSON.parse(content);}
  if(argument?.startsWith('@'))return JSON.parse((await readFile(argument.slice(1),'utf8')).replace(/^\uFEFF/,''));
  return JSON.parse(argument??'{}');
}
function transformed(model,t){
  const move=b=>Object.hasOwn(kitRegistry,b.id)||Object.hasOwn(navalRegistry,b.id)?transformKitBlock(b,t):transformBlock(b,t,catalog);
  const vector=v=>{
    const b=move({id:'minecraft:mangrove_planks',states:{},x:v[0],y:v[1],z:v[2]});
    return [b.x,b.y,b.z];
  };
  const blocks=model.blocks.map(move),next={...model,blocks,bounds:boundsOf(blocks),transforms:[...(model.transforms??[]),t]};
  if(model.kitSockets)next.kitSockets=model.kitSockets.map(s=>{const [x,y,z]=vector([s.x,s.y,s.z]);return {...s,x,y,z};});
  if(model.anchors)next.anchors=Object.fromEntries(Object.entries(model.anchors).map(([k,v])=>[k,vector(v)]));
  if(model.components)next.components=model.components.map(c=>({...c,origin:vector(c.origin)}));
  if(model.architecture)next.architecture=transformArchitecture(model.architecture,vector);
  if(model.stern){
    const [lo,hi]=model.stern.frame;
    const corners=[];
    for(const x of [lo[0],hi[0]])for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]]){
      const [px,py,pz]=vector([x,y,z]);corners.push({x:px,y:py,z:pz});
    }
    const box=boundsOf(corners);
    next.stern={...model.stern,frame:[box.min,box.max],worldTransforms:[...(model.stern.worldTransforms??[]),t]};
  }
  if(model.naval)next.naval=transformNaval(model.naval,vector);
  if(model.attachments)next.attachments=Object.fromEntries(Object.entries(model.attachments).map(([k,a])=>[k,{...a,origin:vector(a.origin),normal:vector(a.normal)}]));
  return next;
}
try{
  const [cmd,arg,...extra]=process.argv.slice(2);
  if(extra.length)throw Error('Forneça um único objeto JSON, @arquivo ou - para stdin');
  const p=await input(arg);
  let result;
  switch(cmd){
    case 'discover': result=discover(p);break;
    case 'facade': result=generateFacade(p);break;
    case 'refine': result=generateRefinedFacade(p);break;
    case 'stern': result=generateStern(p);break;
    case 'wreck': result=generateShipwreck(p);break;
    case 'roof': {const {finish,pattern,...options}=p;result=assembleRoof(options,finish,pattern);break;}
    case 'kit': result=generateKitStudy(p);break;
    case 'panel': result=generatePaletteStudy(p);break;
    case 'recommend': {const {seed,...context}=p;result=recommend(seed,context);break;}
    case 'gradient': {const {from,to,...options}=p;result=composeGradient(from,to,options);break;}
    case 'group': {const {ids,...options}=p;result=groupMaterials(ids,options);break;}
    case 'recolor': result=applyPalette(p.model,p.options);break;
    case 'transform': result=transformed(p.model,p.transform);break;
    case 'resolution': result=discretizationStudy(p);break;
    case 'validate': result=validateModel(p);break;
    default: throw Error('Comandos: discover, roof, facade, refine, wreck, stern, kit, panel, recommend, gradient, group, recolor, transform, resolution, validate');
  }
  if(result?.blocks)validateModel(result);
  console.log(JSON.stringify(result));
}catch(error){console.error(error.message);process.exitCode=1;}

