import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateRoof} from '../architect/roof.mjs';
import {transformBlock,transformModel,inventory,boundsOf} from '../architect/model.mjs';
import {validate} from '../architect/validate.mjs';
import {registry} from '../architect/registry.mjs';

test('Todos os 18 modelos do estúdio têm juntas, frente, cobertura e inventário válidos',()=>{
  for(const pitch of [.5,.75,1]) for(const lift of [0,1,2]) for(const palette of ['slate','basalt']){
    const model=generateRoof({pitch,lift,palette});assert.equal(validate(model).modules,6);
    assert.deepEqual(model,generateRoof({pitch,lift,palette}));
  }
});
test('Escala e parâmetros válidos nos limites e em um perfil intermediário',()=>{
  for(const p of [{halfWidth:8,halfLength:8,pitch:.5,lift:0},{halfWidth:20,halfLength:32,pitch:1,lift:2},
    {halfWidth:13,halfLength:17,pitch:.84,lift:.65}]) validate(generateRoof(p));
  for(const p of [{halfWidth:7},{halfLength:4},{halfWidth:8.25},{pitch:NaN},{lift:3},{palette:'constructor'},{seed:42}])
    assert.throws(()=>generateRoof(p));
});
test('Variações têm consequências mensuráveis no cume, nos cantos e na paleta',()=>{
  const roofTop=(m,x,z)=>Math.max(...m.blocks.filter(b=>b.x===x&&b.z===z).map(b=>b.y));
  const a=generateRoof({pitch:.5,lift:0}),b=generateRoof({pitch:1,lift:2});
  assert.equal(roofTop(b,10,14)-roofTop(a,10,14),2);
  assert.equal(roofTop(b,0,0)-roofTop(a,0,0),5);
  const black=generateRoof({palette:'basalt'});
  assert.equal(black.materials['minecraft:deepslate_bricks'],undefined);
  assert.ok(black.materials['minecraft:polished_blackstone_bricks']>0);
});
test('Transformações do módulo assimétrico e dos 15 blocos restauram coordenadas e estados',()=>{
  for(const [id,spec] of Object.entries(registry)){
    let variants=[{}];for(const [k,domain] of Object.entries(spec.states)) variants=variants.flatMap(s=>domain.map(v=>({...s,[k]:v})));
    for(const states of variants){
      const b={x:2,y:3,z:7,id,states,module:'test'};
      for(const [t,n] of [[{turns:1},4],[{mirrorX:true},2],[{mirrorZ:true},2],[{turns:1,mirrorX:true},2]]){
        let actual=b;for(let i=0;i<n;i++) actual=transformBlock(actual,t);assert.deepEqual(actual,b);
      }
    }
  }
  const roof=transformModel(generateRoof(),{turns:1,mirrorZ:true});
  assert.deepEqual(roof.bounds.size,[29,17,21]);validate(roof);
  const b={x:2,y:0,z:4,id:'minecraft:mangrove_stairs',states:{weirdo_direction:0,upside_down_bit:true,'minecraft:corner':'inner_left'}};
  const rotated=transformBlock(b,{turns:1});assert.deepEqual([rotated.x,rotated.z,rotated.states.weirdo_direction],[-4,2,2]);
  const mirrored=transformBlock(b,{mirrorX:true});assert.equal(mirrored.states.weirdo_direction,1);assert.equal(mirrored.states['minecraft:corner'],'inner_right');
});
test('Fixtures corrompidas são rejeitadas mesmo com totais e limites recalculados',()=>{
  for(const mutate of [
    m=>m.blocks.push({...m.blocks[0]}),
    m=>{m.blocks[0].x+=100;},
    m=>{m.blocks[0].states.pillar_axis='invalid';},
    m=>{m.blocks[0].id='minecraft:unknown';},
    m=>{m.blocks[0].module='unknown';},
    m=>{m.blocks.find(b=>b.id==='minecraft:bamboo_trapdoor').states.direction^=1;},
    m=>{for(const b of m.blocks.filter(b=>b.id.endsWith('brick_stairs'))) b.states.weirdo_direction^=1;},
    m=>{m.blocks=m.blocks.filter(b=>!(b.module==='posts' && b.y===2));},
    m=>{m.blocks=m.blocks.filter(b=>!(b.x===0 && b.y===15 && b.z===0));},
    m=>{m.blocks.find(b=>b.id==='minecraft:deepslate_bricks').id='minecraft:polished_blackstone_bricks';}
  ]){
    const model=generateRoof();mutate(model);model.materials=inventory(model.blocks);model.bounds=boundsOf(model.blocks);
    assert.throws(()=>validate(model));
  }
  const model=generateRoof();model.materials[model.blocks[0].id]++;assert.throws(()=>validate(model),/Inventário/);
});
