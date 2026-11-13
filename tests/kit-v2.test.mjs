import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKitStudy,kitRegistry,kitComponents,placeKit,transformKitBlock,validateKit,validateKitPlacement} from '../architect/v2/kit.mjs';
import {kitVolume,surfaceContact} from '../architect/v2/kit-shapes.mjs';
import {boundsOf,inventory,key} from '../architect/model.mjs';
import {roofGeometry} from '../src/scripts/roof-assets.js';

const block=(short,states,x=0,y=0,z=0)=>({id:'minecraft:'+short,states,x,y,z,module:'kit'});
test('Kits têm volume, pontos de conexão, estados válidos e materiais derivados em cada transformação',()=>{
  for(const [component,meta] of Object.entries(kitComponents)) for(const variation of meta.variations)
    for(const turns of [0,1,2,3]) for(const mirrorX of [false,true]){
      const model=generateKitStudy({component,variation,turns,mirrorX,origin:[4,7,12]});
      assert.deepEqual(model.materials,inventory(model.blocks));
      assert.deepEqual(model.bounds,boundsOf(model.blocks));
      const [w,h,d]=meta.size;
      assert.deepEqual(model.bounds.size,turns%2?[d,h,w]:meta.size);
      for(const anchor of Object.values(model.anchors)) assert.ok(model.blocks.some(b=>key(b.x,b.y,b.z)===anchor.join(',')));
      assert.equal(validateKit(model),model);
    }
});
test('Vãos maiores aumentam o espaço útil sem esticar a bigorna',()=>{
  const two=placeKit('colonnade',{span:5,bays:2}), four=placeKit('colonnade',{span:8,bays:4});
  assert.equal(two.bounds.size[0],13);assert.equal(four.bounds.size[0],35);
  assert.equal(four.blocks.filter(b=>b.id==='minecraft:anvil').length,5);
  assert.ok(four.blocks.every(b=>Number.isInteger(b.x)));
  assert.throws(()=>placeKit('colonnade',{span:1}));
  assert.throws(()=>placeKit('crest',{origin:[0,.5,0]}));
});
test('Estados direcionais novos e ligações do muro acompanham rotação e espelho',()=>{
  const wall=block('polished_blackstone_brick_wall',{wall_post_bit:true,wall_connection_type_east:'short',
    wall_connection_type_west:'none',wall_connection_type_north:'tall',wall_connection_type_south:'none'});
  const hopper=block('hopper',{facing_direction:4,toggle_bit:true},2,3,7);
  assert.equal(transformKitBlock(hopper,{turns:1}).states.facing_direction,2);
  assert.equal(transformKitBlock(wall,{mirrorX:true}).states.wall_connection_type_west,'short');
  for(const b of [wall,hopper,block('anvil',{'minecraft:cardinal_direction':'west'}),block('end_rod',{facing_direction:5})]){
    let q=b;for(let n=0;n<4;n++)q=transformKitBlock(q,{turns:1});assert.deepEqual(q,b);
    for(const axis of ['mirrorX','mirrorZ']) assert.deepEqual(transformKitBlock(transformKitBlock(b,{[axis]:true}),{[axis]:true}),b);
  }
});
test('Posições inválidas falham sem simular colisão, transferência de itens ou iluminação',()=>{
  const finial=placeKit('finial');finial.blocks=finial.blocks.filter(b=>b.y>0);
  assert.throws(()=>validateKit(finial),/base estável/);
  const lamp=placeKit('lantern');lamp.blocks.find(b=>b.id==='minecraft:bamboo_trapdoor').states.direction^=1;
  assert.throws(()=>validateKit(lamp),/dobradiça/);
  const c=placeKit('crest');c.blocks.find(b=>b.id==='minecraft:cauldron').states.fill_level=5;
  assert.throws(()=>validateKit(c),/vazio/);
  assert.throws(()=>validateKitPlacement(block('hopper',{facing_direction:1,toggle_bit:false}),new Map()),/inválido/);
  const dup=placeKit('colonnade');dup.blocks.push(dup.blocks[0]);assert.throws(()=>validateKit(dup),/conflitante/);
});
test('Aro do funil e do caldeirão deixam espaço vazio; luz usa UV da haste e bigorna tem topo orientado',()=>{
  const solid=(parts,x,y,z)=>parts.some(p=>x>p[0]&&y>p[1]&&z>p[2]&&x<p[3]&&y<p[4]&&z<p[5]);
  const cauldron=kitVolume('cauldron',{cauldron_liquid:'water',fill_level:0});
  const hopper=kitVolume('hopper',{facing_direction:0,toggle_bit:false});
  for(const parts of [cauldron,hopper]){
    assert.ok(!solid(parts,8,15.9,8));assert.ok(solid(parts,1,15.9,8));
  }
  assert.ok(!surfaceContact(cauldron,kitVolume('end_rod',{facing_direction:1}),[0,1,0]));
  const anvil=kitVolume('anvil',{'minecraft:cardinal_direction':'east'});
  assert.deepEqual(anvil.at(-1),[0,10,3,16,16,13]);
  assert.ok(surfaceContact(anvil,kitVolume('end_rod',{facing_direction:1}),[0,1,0]));
  const spec=kitRegistry['minecraft:end_rod'], uvValues=[];
  for(const f of [0,1,2,3,4,5]){
    const g=roofGeometry(spec,{facing_direction:f},(path,u,v)=>{uvValues.push([u,v]);return [u/16,v/16];});
    assert.ok(g.index.count>0);assert.ok(g.boundingBox.max.toArray().every(n=>n<=1));g.dispose();
  }
  assert.ok(uvValues.every(([u,v])=>u>=0&&u<=6&&v>=1&&v<=16));
});
