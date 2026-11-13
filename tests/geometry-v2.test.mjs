import test from 'node:test';
import assert from 'node:assert/strict';
import {generateGeometry,validateGeometry,discretizationStudy,families} from '../architect/v2/geometry.mjs';
import {boundsOf,inventory,key,transformBlock} from '../architect/model.mjs';

test('0.2 · todas as combinações do estúdio mantêm cobertura e contato físico em cada etapa',()=>{
  for(const family of families) for(const curve of [.05,.75]) for(const layers of [1,2]) for(const ornament of ['carved','plain']){
    const m=generateGeometry({family,curve,lift:curve===.05?0:2,bracketLayers:layers,bracketDepth:layers,ornament});
    const result=validateGeometry(m);
    assert.equal(result.blocks,new Set(m.blocks.map(b=>key(b.x,b.y,b.z))).size);
    assert.ok(m.blocks.some(b=>b.id.endsWith('_slab')));
    assert.ok(m.blocks.some(b=>b.module==='skin'&&b.id.endsWith('_stairs')));
  }
});

test('0.2 · tipologias têm topologias distintas, cumeeiras contínuas e isolamento dos dois níveis',()=>{
  const ridge=m=>m.blocks.filter(b=>['ridge','upperRidge'].includes(b.module));
  const roofs=Object.fromEntries(families.map(family=>[family,generateGeometry({family})]));
  assert.equal(ridge(roofs.gable).length,29);
  assert.equal(ridge(roofs.hip).length,9);
  assert.equal(ridge(roofs.irimoya).length,21);
  for(const m of Object.values(roofs)){
    const zs=ridge(m).map(b=>b.z).sort((a,b)=>a-b);
    assert.ok(zs.every((v,i)=>!i||v===zs[i-1]+1));
    for(const socket of m.kitSockets){
      const support=ridge(m).find(b=>b.x===socket.x&&b.z===socket.z&&b.y===socket.y-1);
      assert.ok(support);
    }
  }
  assert.equal(roofs.hip.blocks.some(b=>b.module==='gables'),false);
  for(const family of ['gable','irimoya']){
    const faces=roofs[family].blocks.filter(b=>b.module==='gables'&&b.z>0);
    assert.equal(new Set(faces.map(b=>b.z)).size,3);
    assert.ok(faces.some(b=>b.id==='minecraft:bamboo_trapdoor'));
  }
  const tiered=roofs.tiered;
  assert.equal(tiered.blocks.some(b=>b.module==='skin'&&b.x===0&&b.z===0),false);
  assert.ok(tiered.blocks.some(b=>b.module==='upperSkin'&&b.x===0&&b.z===0));
  assert.ok(tiered.blocks.some(b=>b.module==='drum'));
  assert.equal(generateGeometry({family:'hip',width:21,length:21}).kitSockets.length,1);
});

test('0.2 · rotação e espelhamento conservam a geometria e os estados das duas fachadas e quatro cantos',()=>{
  for(const family of families){
    const model=generateGeometry({family}), cells=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b]));
    for(const b of model.blocks){
      for(const transform of [{mirrorX:true},{mirrorZ:true}]){
        const other=transformBlock(b,transform);assert.deepEqual(cells.get(key(other.x,other.y,other.z)),other);
      }
      const quarter=transformBlock(b,{turns:1});
      assert.deepEqual(transformBlock(quarter,{turns:-1}),b);
    }
  }
});

test('0.2 · resolução de meio bloco reduz erro médio e máximo nas duas escalas testadas',()=>{
  for(const family of families) for(const width of [21,33]){
    const {whole,half}=discretizationStudy({family,width,length:width+8,pitch:.7});
    assert.equal(whole.samples,half.samples);assert.ok(half.meanError<whole.meanError);
    assert.ok(half.maxError<=.251&&whole.maxError<=.501);
  }
});

test('0.2 · parâmetros alteram o objeto físico e validam a interação entre estações, seção e frente',()=>{
  const count=(m,name)=>m.blocks.filter(b=>b.module===name).length;
  const base=generateGeometry();
  assert.equal(count(generateGeometry({supports:4}),'posts'),base.params.supports*8+8);
  const asymmetric=generateGeometry({stations:[-9,0,6,11],bracketWidth:1});
  validateGeometry(asymmetric);
  assert.ok(asymmetric.blocks.some(b=>b.module==='posts'&&b.z===6));
  assert.ok(count(generateGeometry({thickness:2}),'skin')>count(base,'skin'));
  assert.ok(count(generateGeometry({bracketDepth:3,bracketWidth:2}),'brackets')>count(base,'brackets'));
  assert.ok(count(generateGeometry({ornament:'plain'}),'gables')<count(base,'gables'));
  assert.notEqual(generateGeometry({gableFraction:.8}).kitSockets[0].z,base.kitSockets[0].z);
  assert.equal(generateGeometry({pitch:.9}).kitSockets[0].y-base.kitSockets[0].y,2);
  for(const bad of [{width:18},{stations:[-1,1]},{pitch:.9,rise:8},{family:'other'},{bracketDepth:4,overhang:2},
    {family:'irimoya',rise:2,thickness:3},{unknown:2}]) assert.throws(()=>generateGeometry(bad));
});

test('0.2 · validador rejeita interseções, furos, orientação, volumes e peças sem apoio',()=>{
  for(const corrupt of [
    m=>m.blocks.push({...m.blocks[0]}),
    m=>{m.blocks=m.blocks.filter(b=>!(b.module==='ridge'&&b.z===0));},
    m=>{m.blocks.find(b=>b.module==='skin'&&b.id.endsWith('_stairs')).states.weirdo_direction^=1;},
    m=>{m.blocks.find(b=>b.module==='skin'&&b.id.endsWith('_slab')).states['minecraft:vertical_half']='top';},
    m=>m.blocks.push({x:0,y:50,z:0,id:'minecraft:bamboo_planks',states:{},module:'gables'}),
    m=>{m.blocks[0].states.pillar_axis='diagonal';}
  ]){
    const m=generateGeometry();corrupt(m);m.bounds=boundsOf(m.blocks);m.materials=inventory(m.blocks);
    assert.throws(()=>validateGeometry(m));
  }
});

