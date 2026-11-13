import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeStudy,catalog,validateModel} from '../architect/v2/laboratory.mjs';
import {generateRefinedFacade} from '../architect/v22/facade.mjs';
import {applyArchitecturalPalette} from '../architect/v21/contextual-palette.mjs';
import {auditArchitecture,transformArchitecture} from '../architect/architectural-validation.mjs';
import {packModel} from '../architect/v2/transport.mjs';
import {key,transformBlock,boundsOf,inventory} from '../architect/model.mjs';
import {kitRegistry,transformKitBlock} from '../architect/v2/kit.mjs';
import frozen from './fixtures/release-021.json' with {type:'json'};

test('A B C permanecem byte a byte iguais aos pacotes congelados 0.2.1',()=>{
  for(const edition of ['A','B','C']){
    const model=makeStudy({study:'facade',edition,distribution:'contextual'}),id=model.studyId;
    assert.equal(createHash('sha256').update(JSON.stringify(packModel(model))).digest('hex'),frozen.models[id],id);
  }
});
test('O detector reproduz a abertura de meio bloco 0.2.1 e o fechamento superior ausente',()=>{
  const legacy=makeStudy({study:'facade',edition:'B',distribution:'contextual'}),fixed=generateRefinedFacade();
  assert.ok(auditArchitecture(legacy,catalog).some(i=>i.code==='gable-gap'&&i.gap===.5));
  assert.ok(auditArchitecture({...legacy,architecture:{...fixed.architecture,gableJoints:[]}},catalog).some(i=>i.code==='envelope-gap'));
  assert.deepEqual(auditArchitecture(fixed,catalog),[]);
});
test('Cotas mantêm encontros fechados sob 1 a 3 camadas, espessuras e alturas',()=>{
  for(const layers of [1,2,3])for(const thickness of [1,2])for(const rise of [6,8,9])for(const bracketStyle of ['balanced','fan']){
    const m=generateRefinedFacade({layers,thickness,rise,bracketStyle});
    assert.equal(m.datums.roofDatum,m.datums.wallTop+layers+thickness+2);
    assert.ok(m.architecture.sections.length>30);
    assert.ok(m.architecture.gableJoints.length>0);
    assert.ok(m.blocks.some(b=>b.structuralRole==='corner-return'));
    assert.deepEqual(auditArchitecture(m,catalog),[]);
  }
});
test('Retirada da fiada, meias peças incorretas e obstrução do acesso falham',()=>{
  const original=generateRefinedFacade();
  const finish=m=>{m.bounds=boundsOf(m.blocks);m.materials=inventory(m.blocks);return m;};
  for(const change of [
    m=>{const b=m.blocks.find(b=>b.structuralRole==='gable-apron');m.blocks=m.blocks.filter(n=>n!==b);},
    m=>{const b=m.blocks.find(b=>b.structuralRole==='gable-apron');b.id='minecraft:mangrove_slab';b.states={'minecraft:vertical_half':'bottom'};},
    m=>{const s=m.architecture.sections.find(s=>s.x===4&&s.z===3);m.blocks=m.blocks.filter(b=>key(b.x,b.y,b.z)!==key(s.x,s.from+1,s.z));},
    m=>{m.blocks.push({x:0,y:2,z:4,id:'minecraft:mangrove_planks',states:{},module:'walls',role:'wall'});}
  ]){
    const m=structuredClone(original);change(m);assert.throws(()=>validateModel(finish(m)),/Encontro arquitetônico|caminho físico/);
  }
  const incompatible=structuredClone(original);
  incompatible.blocks.find(b=>b.module==='upperEnvelope').module='opening';
  assert.ok(auditArchitecture(incompatible,catalog).some(i=>i.code==='module-incompatible'));
});
test('Paletas preservam coordenadas estados e formas, com justificativas recalculáveis',()=>{
  const mineral=generateRefinedFacade({palette:'mineral'}),patina=generateRefinedFacade({palette:'patina'});
  const geometry=m=>m.blocks.map(b=>[b.x,b.y,b.z,b.module,catalog[b.id].shape,b.states]);
  assert.deepEqual(geometry(mineral),geometry(patina));assert.notDeepEqual(mineral.materials,patina.materials);
  // The same palette can be replayed from its original material inputs.
  for(const m of [mineral,patina])for(const b of m.blocks){
    assert.equal(b.appearance.selected,b.id);assert.ok(b.appearance.ruleId&&b.appearance.rule);
    assert.ok([0,.25,.5,.75,1].includes(b.appearance.exposure));
  }
  const replay=applyArchitecturalPalette({...mineral,blocks:mineral.blocks.map(b=>({...b,id:b.appearance.inputId??b.id}))},{palette:'mineral'});
  assert.deepEqual(geometry(replay),geometry(mineral));
  assert.deepEqual(replay.blocks.map(b=>[b.id,b.appearance]),mineral.blocks.map(b=>[b.id,b.appearance]));
  const broken=structuredClone(mineral);broken.blocks[0].appearance.rule='decoração aleatória';assert.throws(()=>validateModel(broken),/Justificativa material/);
});
test('Transformações transportam estados, planos de fechamento e volumes livres',()=>{
  const source=generateRefinedFacade({capital:'anvil'});
  for(const mirrorX of [false,true])for(let turns=0;turns<4;turns++){
    const t={turns,mirrorX},move=b=>Object.hasOwn(kitRegistry,b.id)?transformKitBlock(b,t):transformBlock(b,t,catalog);
    const vector=v=>{const b=move({id:'minecraft:mangrove_planks',states:{},x:v[0],y:v[1],z:v[2]});return [b.x,b.y,b.z];};
    const blocks=source.blocks.map(move),architecture=transformArchitecture(source.architecture,vector);
    const transformed={...source,blocks,architecture,bounds:boundsOf(blocks)};
    validateModel(transformed);
  }
});
test('A sombra aproximada distingue uma laje de uma folha vertical na mesma célula',()=>{
  const base={x:0,y:0,z:0,id:'minecraft:deepslate_bricks',states:{},module:'skin',role:'roof'};
  const partial={x:0,y:1,z:0,id:'minecraft:bamboo_trapdoor',states:{direction:0,open_bit:true,upside_down_bit:false},module:'walls',role:'window'};
  const model={blocks:[base,partial],datums:{roofDatum:16}};
  const open=applyArchitecturalPalette(model,{palette:'patina'}).blocks[0];
  const covered=applyArchitecturalPalette({...model,blocks:[base,{...partial,id:'minecraft:mangrove_slab',states:{'minecraft:vertical_half':'bottom'}}]},{palette:'patina'}).blocks[0];
  assert.equal(open.appearance.exposure,1);assert.equal(covered.appearance.exposure,0);
  assert.ok(open.appearance.score>covered.appearance.score);
});
