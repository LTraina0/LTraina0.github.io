import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateFacade} from '../architect/v21/facade.mjs';
import {composeComponent} from '../architect/v21/components.mjs';
import {surfaceContext} from '../architect/v21/contextual-palette.mjs';
import {validateModel,catalog} from '../architect/v2/laboratory.mjs';
import {boundsOf,inventory,key,transformBlock} from '../architect/model.mjs';
import {transformKitBlock,kitRegistry} from '../architect/v2/kit.mjs';
import evidence from '../architect/v2/bedrock-evidence.json' with {type:'json'};

test('Fachada combina motores com peças conectadas, estados corretos e seis construções determinísticas',()=>{
  for(const edition of ['A','B','C'])for(const distribution of ['contextual','illustrative']){
    const model=generateFacade({edition,distribution});
    assert.equal(validateModel(model).cells,model.blocks.length);
    assert.deepEqual(generateFacade({edition,distribution}),model);
    assert.equal(model.validation.game,'pending');
    for(const id of Object.keys(model.materials)){
      assert.ok(catalog[id],id);
      assert.equal(evidence.entries[id].stateSubsetVerified,true,id);
      for(const face of Object.values(evidence.entries[id].textures))assert.match(face.sha256,/^[a-f0-9]{64}$/);
    }
    if(edition!=='A')for(const name of ['opening','capital','cornice'])assert.ok(model.components.some(c=>c.libraryId===name));
    assert.ok(model.blocks.some(b=>b.role==='window'));
    assert.ok(model.blocks.some(b=>b.module==='gables'));
  }
});
test('Contexto depende de abrigo, função e forma; a distribuição experimental conserva os encaixes',()=>{
  const a=generateFacade({edition:'B'}),b=generateFacade({edition:'C'}),c=generateFacade({edition:'C',distribution:'illustrative'});
  const shape=m=>m.blocks.map(b=>[b.x,b.y,b.z,b.module,catalog[b.id].shape,b.states]);
  assert.deepEqual(shape(a),shape(b));assert.deepEqual(shape(b),shape(c));assert.notDeepEqual(b.materials,c.materials);
  const rules=new Set(b.blocks.map(b=>b.appearance.rule));
  assert.ok(b.blocks.filter(b=>b.module==='walls').every(b=>Number.isFinite(b.appearance.lightness)));
  for(const rule of ['rodapé de desgaste','recuo sob proteção','preenchimento exposto do pano','acento no eixo ou no ritmo modular'])assert.ok(rules.has(rule),rule);
  const block={x:0,y:0,z:0,module:'walls'},bounds={min:[0,0,0],size:[3,3,3]};
  assert.equal(surfaceContext(block,new Map(),bounds).sheltered,false);
  assert.equal(surfaceContext(block,new Map([['0,2,0',{}]]),bounds).overhead,2);
});
test('Peças e fachada preservam contato e estados sob quatro rotações e espelhos',()=>{
  for(const name of ['opening','capital','cornice'])for(const mirrorX of [false,true])for(let turns=0;turns<4;turns++){
    const piece=composeComponent(name,{turns,mirrorX});
    const first=new Map(piece.blocks.map(b=>[key(b.x,b.y,b.z),b]));
    assert.equal(first.size,piece.blocks.length);
    const blocks=piece.blocks.map(b=>({...b,module:name}));
    const m={blocks,modules:[{id:name,label:name,stage:0}],bounds:boundsOf(blocks),materials:inventory(blocks)};
    validateModel(m);
  }
  const source=generateFacade({edition:'B'});
  for(let turns=0;turns<4;turns++){
    const blocks=source.blocks.map(b=>Object.hasOwn(kitRegistry,b.id)?transformKitBlock(b,{turns,mirrorX:true}):transformBlock(b,{turns,mirrorX:true},catalog));
    validateModel({...source,blocks,bounds:boundsOf(blocks)});
  }
});
test('Auditoria e validador deixam limites explícitos e rejeitam remoção de apoios',()=>{
  const m=generateFacade({edition:'B'}),anvil=m.blocks.find(b=>b.id==='minecraft:anvil');
  const blocks=m.blocks.filter(b=>!(b.x===anvil.x&&b.y===anvil.y-1&&b.z===anvil.z));
  assert.throws(()=>validateModel({...m,blocks,materials:inventory(blocks)}),/base estável/);
  assert.ok(JSON.stringify(evidence).includes('inGameChecked'));
});
