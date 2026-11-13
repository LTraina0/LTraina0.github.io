import test from 'node:test';
import assert from 'node:assert/strict';
import {auditStern} from '../architect/v3/stern-audit.mjs';
import {generateStern} from '../architect/v3/stern.mjs';
import {packModel,unpackModel} from '../architect/v2/transport.mjs';
const models=()=>['intact','broken','displaced'].map(phase=>unpackModel(packModel(generateStern({phase}))));
test('Abertura, membros, grão, escadas e contatos remontam o casco publicado',()=>{
  const report=auditStern(models());
  assert.equal(report.originalSHA256,report.reassembledSHA256);
  for(const id of ['beam','wale','rib','keel','panelFrame','bodyFrame'])assert.ok(report.joints.find(j=>j.id===id)?.contacts>0);
});
test('Uma fibra trocada depois da separação reprova a remontagem',()=>{
  const data=models();
  const b=data[2].blocks.find(b=>b.piece==='panel'&&b.states.pillar_axis==='z');
  b.states={...b.states,pillar_axis:'x'};
  assert.throws(()=>auditStern(data));
});
