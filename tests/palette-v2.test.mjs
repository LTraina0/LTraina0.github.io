import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generateRoof} from '../architect/roof.mjs';
import {boundsOf,inventory} from '../architect/model.mjs';
import {registry} from '../architect/registry.mjs';
import {paletteFamilies,palettePatterns,paletteRegistry,measuredTextures,faceFeatures,
  gradientIndex,composeGradient,groupMaterials,recommend,generatePaletteStudy,applyPalette,
  exposedFeatures,paletteMetrics} from '../architect/v2/palette.mjs';

test('IDs e domínios compatíveis com o 0.1; estatísticas por face contêm tons e granulação',()=>{
  for(const [id,base] of Object.entries(registry)){
    const spec=paletteRegistry[id];
    assert.equal(spec.shape,base.shape);
    for(const [k,domain] of Object.entries(base.states)) assert.deepEqual(new Set(spec.states[k]),new Set(domain));
    assert.deepEqual(spec.texture,base.texture);
  }
  for(const [id,spec] of Object.entries(paletteRegistry)){
    assert.match(id,/^minecraft:/);
    for(const path of Object.values(spec.texture)){
      const f=measuredTextures[path];assert.match(f.sha256,/^[0-9a-f]{64}$/);assert.ok(f.coverage>0 && f.coverage<=1);
      assert.ok(f.shade[0]<=f.lab[0] && f.lab[0]<=f.highlight[0]);assert.ok(f.grain.every(v=>v>=0));
    }
  }
  assert.notDeepEqual(faceFeatures('stripped_mangrove_log','up'),faceFeatures('stripped_mangrove_log','side'));
  const beam={id:'minecraft:stripped_mangrove_log',states:{pillar_axis:'x'}};
  assert.equal(exposedFeatures(beam,'east'),faceFeatures(beam.id,'up'));
  assert.equal(exposedFeatures(beam,'up'),faceFeatures(beam.id,'side'));
  assert.ok(faceFeatures('bamboo_trapdoor').coverage<1);
  assert.ok(faceFeatures('chiseled_tuff_bricks').highlight[0]-faceFeatures('chiseled_tuff_bricks').shade[0]>.02);
});

test('Métricas de painel separam contraste global e repetição local',()=>{
  const stats=pattern=>paletteMetrics(generatePaletteStudy({family:'ember',pattern}).blocks.filter(b=>b.module==='field'));
  const bands=stats('linear'),dither=stats('density');
  assert.equal(bands.contacts,598);assert.equal(dither.contacts,598);
  assert.equal(bands.globalLRange,dither.globalLRange);assert.ok(bands.meanLocalDeltaL<dither.meanLocalDeltaL);
  assert.equal(bands.transitions,102);assert.equal(dither.transitions,313);
  assert.ok(bands.dominantShare>.1 && bands.dominantShare<.5);
});

test('Quatro rampas têm luminância crescente; os cinco padrões distintos só intercalam paradas vizinhas',()=>{
  for(const [family,f] of Object.entries(paletteFamilies)){
    const ls=f.ramp.map(id=>faceFeatures(id).lab[0]);
    assert.deepEqual([...ls].sort((a,b)=>a-b),ls);
    const hashes=new Set();
    for(const pattern of palettePatterns){
      const model=generatePaletteStudy({family,pattern});
      assert.deepEqual(model.bounds,boundsOf(model.blocks));assert.deepEqual(model.materials,inventory(model.blocks));
      assert.equal(new Set(model.blocks.map(b=>[b.x,b.y,b.z].join(','))).size,model.blocks.length);
      const field=model.blocks.filter(b=>b.module==='field');
      assert.equal(field[0].id,'minecraft:'+f.ramp[0]);assert.equal(field.at(-1).id,'minecraft:'+f.ramp.at(-1));
      hashes.add(createHash('sha256').update(JSON.stringify(field)).digest('hex'));
      for(let i=0;i<100;i++){
        const idx=gradientIndex(i/99,6,i%10,Math.floor(i/10),pattern);
        assert.ok(idx===Math.floor(i/99*5)||idx===Math.ceil(i/99*5));
      }
    }
    assert.equal(hashes.size,5);
  }
  // A 4×4 density tile at the midpoint must use both materials in equal proportion.
  const matrix=Array.from({length:16},(_,i)=>gradientIndex(.5,2,i%4,i>>2));
  assert.equal(matrix.reduce((a,b)=>a+b),8);
  assert.deepEqual(generatePaletteStudy({pattern:'clusters',seed:81}),generatePaletteStudy({pattern:'clusters',seed:81}));
  assert.notDeepEqual(generatePaletteStudy({pattern:'clusters',seed:81}).blocks,generatePaletteStudy({pattern:'clusters',seed:91}).blocks);
});

test('Gradiente novo liga extremos de entrada, respeita a lista elegível e aceita trocas de textura',()=>{
  const candidates=['polished_tuff','deepslate_bricks','stone_bricks','mangrove_planks'];
  const ramp=composeGradient('polished_blackstone_bricks','calcite',{stops:5,candidates});
  assert.equal(ramp.length,5);assert.equal(new Set(ramp).size,5);
  assert.equal(ramp[0],'minecraft:polished_blackstone_bricks');assert.equal(ramp.at(-1),'minecraft:calcite');
  assert.ok(ramp.slice(1,-1).every(id=>candidates.includes(id.slice(10))));
  const model=generatePaletteStudy({from:'mangrove_planks',to:'calcite',stops:4});
  const field=model.blocks.filter(b=>b.module==='field');
  assert.equal(field[0].id,'minecraft:mangrove_planks');assert.equal(field.at(-1).id,'minecraft:calcite');
  assert.equal(new Set(field.map(b=>b.id)).size,4);
  assert.throws(()=>generatePaletteStudy({from:'calcite'}));
  assert.throws(()=>composeGradient('minecraft:bamboo_trapdoor','calcite'));
  assert.throws(()=>composeGradient('calcite','tuff',{stops:0}));
});

test('Recomendação considera função, família, harmonia e face; agrupamento aproxima forma de mesma superfície',()=>{
  const seed='mangrove_planks', roof=recommend(seed,{role:'roof',family:'mineral'}), accent=recommend(seed,{role:'ornament',family:'tidal'});
  assert.ok(accent.some(row=>paletteRegistry[row.id].family!=='wood'));
  assert.notDeepEqual(roof,accent);assert.ok(accent.every(r=>r.reason && Number.isFinite(r.score)));
  assert.notDeepEqual(recommend(seed,{harmony:'complementary'}),recommend(seed,{harmony:'monochrome'}));
  const groups=groupMaterials(['mangrove_stairs','deepslate_bricks','mangrove_planks'],{threshold:.001});
  assert.ok(groups.some(g=>g.includes('minecraft:mangrove_planks') && g.includes('minecraft:mangrove_stairs')));
  assert.throws(()=>recommend('missing'));assert.throws(()=>recommend(seed,{role:'invalid'}));
});

test('Acabamento mantém estados, posições, etapas, blocos de kit e o núcleo original',()=>{
  const orig=generateRoof(), snapshot=JSON.stringify(orig), variants=new Set();
  const functional={x:11,y:0,z:0,module:'ornament',id:'minecraft:hopper',states:{facing_direction:0,toggle_bit:false}};
  const roof={...orig,blocks:[...orig.blocks,functional]};
  for(const family of Object.keys(paletteFamilies)) {
    const next=applyPalette(roof,{family});
    assert.equal(next.blocks.at(-1),functional);
    variants.add(JSON.stringify(next.materials));
    assert.deepEqual(next.materials,inventory(next.blocks));
    for(const [i,b] of next.blocks.entries()){
      const old=roof.blocks[i];assert.deepEqual([b.x,b.y,b.z,b.module,b.states],[old.x,old.y,old.z,old.module,old.states]);
      if(b===functional)continue;
      assert.equal(paletteRegistry[b.id].shape,paletteRegistry[old.id].shape);
      for(const [k,v] of Object.entries(b.states))assert.ok(paletteRegistry[b.id].states[k].includes(v));
    }
  }
  assert.equal(variants.size,4);assert.equal(JSON.stringify(orig),snapshot);
});
