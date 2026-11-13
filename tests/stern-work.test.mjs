import test from 'node:test';
import assert from 'node:assert/strict';
import {generateStern} from '../architect/v3/stern.mjs';
import {auditStern} from '../architect/v3/stern-audit.mjs';
import {inspectSternMaterials} from '../architect/v3/stern-inventory.mjs';
import {packModel,unpackModel} from '../architect/v2/transport.mjs';

const phases=['intact','broken','displaced'];
const models=()=>phases.map(phase=>unpackModel(packModel(generateStern({phase,refined:true}))));
const refined=generateStern({refined:true});
const lookup=new Map(refined.blocks.map(b=>[[b.x,b.y,b.z].join(','),b]));
const at=(x,y,z)=>lookup.get([x,y,z].join(','));

test('A quilha, as cavernas, os vaus e o forro permanecem nas estações de origem',()=>{
  const skeleton=model=>model.blocks.filter(b=>['keel','frames','beams','lining'].includes(b.module))
    .map(b=>[b.x,b.y,b.z,b.component,b.module,b.id,b.states,b.piece]);
  assert.deepEqual(skeleton(refined),skeleton(generateStern()));
});
test('A passagem tem dois blocos de largura, altura livre e desembarque nos dois extremos',()=>{
  for(const z of [8,9]){
    for(let x=-2;x<=3;x++){
      const y=x+9;
      assert.equal(at(x,y,z).component,'escada-de-porão');
      assert.equal(at(x,y,z).states.weirdo_direction,0);
      for(const headroom of [1,2])assert.equal(at(x,y+headroom,z),undefined);
    }
    assert.ok(at(4,12,z));
    assert.equal(at(4,13,z),undefined);
    assert.equal(at(-3,6,z).component,'patamar-inferior');
    assert.equal(at(-3,7,z),undefined);
  }
});
test('Biqueiras drenam o bordo e os aparelhos têm apoio, espaço e procedência',()=>{
  const scuppers=refined.blocks.filter(b=>b.component==='biqueira-da-sacada');
  assert.deepEqual(scuppers.map(b=>b.x).sort((a,b)=>a-b),[-9,-5,5,9]);
  assert.ok(scuppers.every(b=>b.id.includes('oxidized_cut_copper_slab')));
  const lamps=refined.blocks.filter(b=>b.id==='minecraft:lantern');
  assert.equal(lamps.length,4);
  for(const b of lamps)assert.equal(at(b.x,b.y+(b.states.hanging?1:-1),b.z)?.id,b.states.hanging?'minecraft:iron_chain':'minecraft:oak_log');
  for(const z of [14,15]){
    assert.equal(at(-6,13,z).states.facing_direction,5);
    assert.equal(at(-5,13,z),undefined);
  }
  for(const side of [-1,1])for(const z of [3,8,13,18]){
    const nearby=refined.blocks.filter(b=>b.z===z&&Math.sign(b.x)===side);
    assert.ok(nearby.some(b=>b.component.endsWith('-soleira')&&b.id==='minecraft:oak_slab'));
    assert.ok(nearby.some(b=>b.component.endsWith('-folha')&&b.states.upside_down_bit));
  }
  const inv=inspectSternMaterials(refined);
  assert.equal(inv.modules.deck.paletteRules['salvaged-repair'],35);
  for(const kit of ['gallery-knee','cargo-davit','hatch-leaves','hatch-leaves-raised','windlass'])assert.ok(inv.total.kits[kit]>0);
});
test('Remontagem das peças exportadas recupera estados, materiais e contatos. Uma dobradiça trocada reprova',()=>{
  const data=models(),audit=auditStern(data);
  assert.equal(audit.originalSHA256,audit.reassembledSHA256);
  assert.equal(audit.phases[2].connectedBodies.length,2);
  const hinge=data[2].blocks.find(b=>b.piece==='panel'&&b.id.endsWith('_trapdoor'));
  hinge.states={...hinge.states,direction:(hinge.states.direction+1)%4};
  assert.throws(()=>auditStern(data));
});
