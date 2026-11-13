import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Vector3} from 'three';
import {catalog,makeStudy,validateModel} from '../architect/v2/laboratory.mjs';
import {navalRegistry} from '../architect/v3/naval-blocks.mjs';
import evidence from '../architect/v3/bedrock-evidence.json' with {type:'json'};
import frozen from './fixtures/release-022.json' with {type:'json'};
import {packModel} from '../architect/v2/transport.mjs';
import {studies,studyKey} from '../architect/v2/studies.mjs';
import {transformKitBlock,kitRegistry} from '../architect/v2/kit.mjs';
import {transformBlock,boundsOf,inventory,key} from '../architect/model.mjs';
import {kitVolume} from '../architect/v2/kit-shapes.mjs';
import {roofGeometry} from '../src/scripts/roof-assets.js';
import {auditNaval,transformNaval} from '../architect/v3/validation.mjs';
import {hullSection} from '../architect/v2/naval-geometry.mjs';
import {applyNavalPalette} from '../architect/v3/naval-palette.mjs';
const generate=(composition='haven',condition='weathered')=>makeStudy({study:'shipwreck',composition,condition});
test('Exposição naval considera o recobrimento real de lajes e folhas parciais',()=>{
 const below={x:0,y:1,z:0,id:'minecraft:spruce_planks',states:{},module:'deck',role:'deck'};
 const measure=cover=>applyNavalPalette({blocks:[below,cover],naval:{origin:[0,0,0]}},{finish:'weathered'}).blocks[0].appearance.context.exposure;
 assert.equal(measure({x:0,y:3,z:0,id:'minecraft:spruce_slab',states:{'minecraft:vertical_half':'top'},module:'deck',role:'deck'}),0);
 assert.equal(measure({x:0,y:3,z:0,id:'minecraft:spruce_trapdoor',states:{direction:0,open_bit:true,upside_down_bit:false},module:'cabin',role:'window'}),1);
});
test('Os 202 estudos anteriores permanecem idênticos à publicação 14',()=>{
 const legacy=studies().filter(p=>Object.hasOwn(frozen.models,studyKey(p)));
 assert.equal(legacy.length,Object.keys(frozen.models).length);
 for(const p of legacy)assert.equal(createHash('sha256').update(JSON.stringify(packModel(makeStudy(p)))).digest('hex'),frozen.models[studyKey(p)]);
});
test('Três implantações e dois acabamentos têm apoio por etapa, cabine e três percursos livres',()=>{
 const sizes=[];
 for(const composition of ['haven','rift','drift'])for(const condition of ['weathered','repaired']){
  const m=generate(composition,condition);assert.ok(m.bounds.size[2]>=65&&m.bounds.size[2]<=95);assert.equal(m.naval.cabin.storageCount,6);assert.equal(Object.keys(m.naval.routes).length,3);assert.deepEqual(auditNaval(m,catalog),[]);assert.ok(m.blocks.filter(b=>b.module==='context').length<m.blocks.length*.5);sizes.push(m.bounds.size.join(','));
 }
 assert.equal(new Set(sizes).size,3);
});
test('Perfis de casco compartilham cotas e abrem progressivamente do fundo ao bojo',()=>{
 const stations=[[-20,5],[0,12],[20,3]];
 for(let z=-20;z<=20;z++)for(let y=2;y<=8;y++)assert.ok(hullSection(stations,z,y)>=hullSection(stations,z,y-1));
 assert.ok(hullSection(stations,0,8)>hullSection(stations,-20,8));
});
test('Validador detecta rota bloqueada, piso removido, porta incoerente e razão material adulterada',()=>{
 const original=generate(),broken=structuredClone(original);
 broken.blocks.push({x:-4,y:11,z:-25,id:'minecraft:spruce_planks',states:{},module:'cabin',role:'cabin'});
 assert.ok(auditNaval(broken,catalog).some(i=>i.code==='route-obstructed'));
 const floor=structuredClone(original);floor.blocks=floor.blocks.filter(b=>key(b.x,b.y,b.z)!=='-4,9,-27');assert.ok(auditNaval(floor,catalog).some(i=>i.code==='route-unsupported'));
 const roof=structuredClone(original);roof.blocks=roof.blocks.filter(b=>key(b.x,b.y,b.z)!=='-4,15,-27');assert.ok(auditNaval(roof,catalog).some(i=>i.code==='cabin-roof-gap'));
 const door=structuredClone(original);door.blocks.find(b=>b.id==='minecraft:spruce_door'&&b.states.upper_block_bit).states.open_bit=false;assert.ok(auditNaval(door,catalog).some(i=>i.code==='door-pair'));
 const reason=structuredClone(original);reason.blocks.find(b=>b.role==='deck').appearance.rule='aleatório';assert.ok(auditNaval(reason,catalog).some(i=>i.code==='material-reason'));
});
test('Acabamento muda IDs mantendo coordenadas, estados, módulos e formas reais',()=>{
 const a=generate(),b=generate('haven','repaired');assert.equal(a.blocks.length,b.blocks.length);let changes=0;
 a.blocks.forEach((v,i)=>{const w=b.blocks[i];assert.deepEqual([v.x,v.y,v.z,v.states,v.module],[w.x,w.y,w.z,w.states,w.module]);assert.equal(catalog[v.id].shape,catalog[w.id].shape);changes+=v.id!==w.id;});assert.ok(changes>10);
});
test('Rotações e espelhos transportam formas, estados, portas e os percursos do navio',()=>{
 const m=generate();
 for(const turns of [0,1,2,3])for(const mirrorX of [false,true]){
  const t={turns,mirrorX},move=b=>navalRegistry[b.id]||kitRegistry[b.id]?transformKitBlock(b,t):transformBlock(b,t,catalog),vector=v=>{const b=transformBlock({x:v[0],y:v[1],z:v[2],id:'minecraft:mangrove_planks',states:{}},t,catalog);return[b.x,b.y,b.z];};
  const blocks=m.blocks.map(move),next={...m,blocks,bounds:boundsOf(blocks),materials:inventory(blocks),naval:transformNaval(m.naval,vector)};validateModel(next);
 }
 const fence={id:'minecraft:spruce_fence',x:0,y:0,z:0,states:{'minecraft:connection_north':true,'minecraft:connection_south':false,'minecraft:connection_east':false,'minecraft:connection_west':false}};
 assert.equal(transformKitBlock(fence,{turns:1}).states['minecraft:connection_east'],true);
 const door=m.blocks.find(b=>b.id==='minecraft:spruce_door');assert.equal(transformKitBlock(door,{mirrorX:true}).states.door_hinge_bit,!door.states.door_hinge_bit);
});
test('IDs, domínios e texturas navais têm curadoria oficial seletiva sem Preview',()=>{
 for(const[id,spec]of Object.entries(navalRegistry)){const e=evidence.entries[id];assert.ok(e);assert.deepEqual(e.textures,spec.texture);assert.equal(e.inGameChecked,false);for(const[k,v]of Object.entries(spec.states))assert.deepEqual(new Set(v),new Set(e.officialStates[k]));assert.ok(!/icicle|ice_crystal|brittle|ice_brick|snow_brick|polished_calcite/.test(id));}
});
test('Tampo de barril acompanha as seis orientações e as UVs das peças especiais ficam no sprite',()=>{
 const vectors=[[0,-1,0],[0,1,0],[0,0,-1],[0,0,1],[-1,0,0],[1,0,0]];
 for(let d=0;d<6;d++){
  const g=roofGeometry(navalRegistry['minecraft:barrel'],{facing_direction:d,open_bit:false},(tile,u,v)=>[u/16+(tile.includes('barrel_top')?2:0),v/16]);
  const uv=g.getAttribute('uv'),normal=g.getAttribute('normal');let seen=0;
  for(let i=0;i<uv.count;i++)if(uv.getX(i)>=2){assert.deepEqual(new Vector3().fromBufferAttribute(normal,i).toArray().map(n=>Math.round(n)||0),vectors[d]);seen++;}assert.equal(seen,4);g.dispose();
 }
 for(const id of ['minecraft:lantern','minecraft:iron_chain','minecraft:spruce_door','minecraft:snow_layer'])for(const s of [false,true]){
  const spec=navalRegistry[id],states=Object.fromEntries(Object.entries(spec.states).map(([k,v])=>[k,v[0]]));if(id.endsWith('lantern'))states.hanging=s;if(id.endsWith('door'))states.open_bit=s;
  const g=roofGeometry(spec,states,(_tile,u,v)=>[u/16,v/16]),uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)assert.ok(uv.getX(i)>=0&&uv.getX(i)<=1&&uv.getY(i)>=0&&uv.getY(i)<=1);assert.ok(g.boundingBox.min.toArray().every(n=>n>=0));assert.ok(g.boundingBox.max.toArray().every(n=>n<=1));g.dispose();
 }
 const g=roofGeometry(navalRegistry['minecraft:iron_chain'],{pillar_axis:'y'},(_t,u,v)=>[u/16,v/16]);assert.equal(g.index.count,24);assert.equal(g.boundingBox.max.y,1);assert.ok(g.boundingBox.max.x-g.boundingBox.min.x<3/16);g.dispose();
 assert.equal(kitVolume('naval-snow',{height:0,covered_bit:false})[0][4],2);
});
