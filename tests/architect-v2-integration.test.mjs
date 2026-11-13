import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {studies,studyKey,defaults} from '../architect/v2/studies.mjs';
import {makeStudy,validateModel,catalog} from '../architect/v2/laboratory.mjs';
import {packModel,unpackModel} from '../architect/v2/transport.mjs';
import {inventory,boundsOf} from '../architect/model.mjs';
import {geometryDefaults} from '../architect/v2/geometry.mjs';

test('Cada estudo disponibilizado mantém todas as células e metadados no transporte',()=>{
  const presets=studies(),unique=new Set();
  for(const p of presets){
    const model=makeStudy(p);unique.add(studyKey(p));
    const decoded=unpackModel(JSON.parse(JSON.stringify(packModel(model))));
    assert.deepEqual(decoded,model);
  }
  assert.equal(unique.size,presets.length);assert.equal([...unique].filter(k=>!k.startsWith('sternwork-')).length,220);
  assert.deepEqual([...unique].filter(k=>k.startsWith('stern-')),['stern-intact','stern-broken','stern-displaced']);
  assert.deepEqual([...unique].filter(k=>k.startsWith('sternwork-')),['sternwork-intact','sternwork-broken','sternwork-displaced']);
});
test('A paleta conserva a geometria por célula e os pináculos encaixam no bloco portador',()=>{
  const plain=makeStudy(defaults),tinted=makeStudy({...defaults,finish:'ember'});
  const placement=model=>model.blocks.map(b=>[b.x,b.y,b.z,b.module,catalog[b.id].shape,b.states]);
  assert.deepEqual(placement(tinted),placement(plain));
  assert.notDeepEqual(tinted.materials,plain.materials);
  assert.equal(plain.components.length,2);
  for(const {origin:[x,y,z],socket} of plain.components){
    const stack=plain.blocks.filter(b=>b.component===socket).sort((a,b)=>a.y-b.y);
    assert.deepEqual(stack.map(b=>[b.x,b.y,b.z]),[[x,y,z],[x,y+1,z],[x,y+2,z]]);
    assert.equal(stack[1].id,'minecraft:anvil');assert.ok(plain.blocks.some(b=>b.x===x&&b.y===y-1&&b.z===z));
  }
});
test('Validação composta rejeita colisão, estado, gravidade e contato ausente',()=>{
  for(const mutate of [
    m=>{m.blocks.push({...m.blocks[0]});},
    m=>{m.blocks.find(b=>b.id==='minecraft:anvil').states['minecraft:cardinal_direction']='up';},
    m=>{const b=m.blocks.find(b=>b.id==='minecraft:anvil');m.blocks=m.blocks.filter(n=>!(n.x===b.x&&n.y===b.y-1&&n.z===b.z));},
    m=>{m.blocks.push({...m.blocks[0],x:90,y:10});}
  ]){
    const model=makeStudy(defaults);mutate(model);model.materials=inventory(model.blocks);model.bounds=boundsOf(model.blocks);
    assert.throws(()=>validateModel(model));
  }
});
test('O agente chama a CLI fora do site e transforma os encaixes junto com o modelo',()=>{
  const cli=fileURLToPath(new URL('../architect/v2/cli.mjs',import.meta.url));
  const run=(cmd,p)=>{
    const res=spawnSync(process.execPath,[cli,cmd,'-'],{input:JSON.stringify(p),encoding:'utf8',maxBuffer:6e6});
    assert.equal(res.status,0,res.stderr);return JSON.parse(res.stdout);
  };
  const model=run('roof',{family:'irimoya',finish:'tidal'});
  const all=run('discover',{limit:1}),ready=run('discover',{scope:'renderable',limit:1}),research=run('discover',{scope:'research',limit:1});
  assert.equal(all.total,1466);
  assert.equal(ready.total+research.total,all.total);
  assert.equal(ready.total,Object.keys(catalog).length);
  assert.ok(run('discover',{query:'bigorna',scope:'renderable'}).items.some(b=>b.id==='minecraft:anvil'));
  assert.equal(model.params.ornament,geometryDefaults.ornament);
  const moved=run('transform',{model,transform:{turns:1,mirrorX:true}});
  assert.deepEqual(moved.components.map(c=>c.origin),model.components.map(c=>[-c.origin[2]||0,c.origin[1],-c.origin[0]||0]));
  assert.equal(run('validate',moved).cells,moved.blocks.length);
  const recommendations=run('recommend',{seed:'mangrove_planks',role:'ornament',family:'ember'});
  assert.ok(recommendations.length>=3 && recommendations.every(r=>r.reason&&catalog[r.id]));
});
