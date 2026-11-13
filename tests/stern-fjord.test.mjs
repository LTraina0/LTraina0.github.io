import test from 'node:test';
import assert from 'node:assert/strict';
import {generateStern} from '../architect/v3/stern.mjs';
import {fjordStern} from '../architect/v3/stern-fjord.mjs';
import {auditStern} from '../architect/v3/stern-audit.mjs';
import {packModel,unpackModel} from '../architect/v2/transport.mjs';
import {validateModel} from '../architect/v2/laboratory.mjs';
import {kitVolume} from '../architect/v2/kit-shapes.mjs';
import {sternCatalog} from '../architect/v3/stern-catalog.mjs';

const baseline=generateStern({refined:true});
const phases=['intact','broken','displaced'].map(phase=>unpackModel(packModel(generateStern({phase,design:fjordStern}))));
const intact=phases[0];
const index=model=>new Map(model.blocks.map(b=>[[b.x,b.y,b.z].join(','),b]));
const before=index(baseline),after=index(intact);
const at=(x,y,z)=>after.get([x,y,z].join(','));
const volume=block=>block?kitVolume(sternCatalog[block.id].shape,block.states):[];

test('A revisão cabe no envelope, conserva as cavernas, o teto e a escada da v18',()=>{
  assert.deepEqual(intact.bounds,baseline.bounds);
  const protectedBlocks=m=>m.blocks.filter(b=>['keel','frames','lining','beams'].includes(b.module)||['piso-galeria','teto-galeria'].includes(b.component))
    .map(b=>[b.x,b.y,b.z,b.id,b.states,b.piece]);
  assert.deepEqual(protectedBlocks(intact),protectedBlocks(baseline));
  for(const z of [8,9])for(let x=-2;x<=3;x++){
    assert.equal(at(x,x+9,z).component,'escada-de-porão');
    assert.equal(at(x,x+10,z),undefined);
    assert.equal(at(x,x+11,z),undefined);
  }
});

test('O relevo muda nas três regiões mesmo com o material oculto',()=>{
  const regions=[
    b=>b.x>=10&&b.z>=1&&b.z<=21&&b.y>=4&&b.y<=12,
    b=>Math.abs(b.x)<=8&&b.z>=3&&b.z<=16&&b.y>=12&&b.y<=15,
    b=>Math.abs(b.x)<=10&&b.z>=20&&b.y>=11
  ];
  for(const select of regions){
    const keys=new Set([...before.keys(),...after.keys()]);
    let changed=0;
    for(const k of keys){
      const a=before.get(k),b=after.get(k);
      if(select(a??b)&&JSON.stringify(volume(a))!==JSON.stringify(volume(b)))changed++;
    }
    assert.ok(changed>=20,'Relevo alterado em apenas '+changed+' células');
  }
  for(const x of [-3,3]){
    assert.equal(at(x,17,23).states.hanging,true);
    assert.equal(at(x,18,23).id,'minecraft:iron_chain');
    assert.ok(at(x,19,23));
    assert.equal(at(x,14,21).component,'banco-de-vigia');
  }
  for(const z of [14,15]){
    assert.equal(at(-6,13,z).id,'minecraft:barrel');
    assert.equal(at(-6,13,z).states.facing_direction,5);
    assert.equal(at(-5,13,z),undefined);
  }
  for(const role of ['salt-wale','worn-working-lane','weathered-waterway','deck-repair'])
    assert.ok(intact.blocks.some(b=>b.appearance.ruleId===role),role);
});

test('Faixas minerais contornam a janela e o costado, com madeira aparente nos encaixes',()=>{
  const pieces=name=>intact.blocks.filter(b=>b.component===name);
  for(const [part,id] of [['peitoril-externo','deepslate_brick_slab'],['verga-de-alheta','polished_blackstone_brick_stairs'],['assento-da-janela','dark_oak_planks'],['montante-externo','stripped_spruce_log']]){
    const cells=pieces(part);
    assert.ok(cells.length>0);
    assert.ok(cells.every(b=>b.id==='minecraft:'+id),part);
  }
  const rim=pieces('lábio-da-cornija');
  assert.ok(rim.some(b=>b.x===0&&b.id==='minecraft:polished_blackstone_brick_slab'));
  assert.ok(rim.some(b=>Math.abs(b.x)===9&&b.id==='minecraft:deepslate_brick_slab'));
  assert.ok(pieces('aba-do-trincaniz').some(b=>b.piece==='panel'&&b.id.startsWith('minecraft:deepslate_brick_')));
  assert.ok(pieces('banco-de-vigia').every(b=>b.id==='minecraft:oak_stairs'));
});

test('A avaria expõe o vau e o costado, com passagem, vidro e inventário preservados nos três estados',()=>{
  for(const m of phases){
    for(const id of Object.keys(m.materials))assert.doesNotMatch(id,/copper|tuff|pale_oak|iron_trapdoor/);
  }
  for(const [x,z] of [[9,9],[12,8],[14,7]])assert.equal(at(x,12,z),undefined);
  assert.equal(at(10,11,10).component,'vau-10');
  assert.equal(at(15,10,8),undefined);
  for(const x of [-1,0,1])for(const y of [14,15,16,17])assert.equal(at(x,y,20),undefined);
  assert.ok(intact.blocks.filter(b=>b.component==='vidraça-da-câmara').every(b=>b.id==='minecraft:brown_stained_glass'));
  assert.equal(intact.materials['minecraft:brown_stained_glass'],12);
  assert.equal(at(9,4,8).id,'minecraft:dark_oak_planks');
  assert.ok(at(0,21,25).component==='selo-da-andorinha');
});
test('A inversão do painel transportado recompõe todas as células, os estados e os contatos',()=>{
  for(const model of phases)assert.equal(validateModel(model).cells,model.blocks.length);
  const audit=auditStern(phases);
  assert.equal(audit.originalSHA256,audit.reassembledSHA256);
  assert.deepEqual(audit.phases.map(p=>p.connectedBodies.length),[1,1,2]);
});
