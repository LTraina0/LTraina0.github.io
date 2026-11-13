import test from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {generatePolarScene} from '../architect/v3/polar.mjs';
import {generateStern} from '../architect/v3/stern.mjs';
import {fjordStern} from '../architect/v3/stern-fjord.mjs';
import {auditStern} from '../architect/v3/stern-audit.mjs';
import {boundsOf,inventory,checkStates,key} from '../architect/model.mjs';
import {catalog} from '../architect/v2/laboratory.mjs';
import {kitVolume} from '../architect/v2/kit-shapes.mjs';
import {packModel,unpackModel} from '../architect/v2/transport.mjs';

const started=performance.now();
const scene=generatePolarScene();
const generatedMs=performance.now()-started;
const ship=generateStern({phase:'displaced',design:fjordStern});
const bySource=blocks=>new Map(blocks.filter(b=>b.sourceCell).map(b=>[b.sourceCell,b]));
const naval=bySource(scene.blocks);
const at=new Map(scene.blocks.map(b=>[key(b.x,b.y,b.z),b]));

test('O cenário preserva integralmente a Andorinha aprovada e a procedência do painel',()=>{
  assert.equal(ship.blocks.length,4321);
  const signature=ship.blocks.map(b=>JSON.stringify([b.x,b.y,b.z,b.id,b.states,b.module,b.component,b.origin,b.sourceCell,b.piece,b.appearance])).sort().join('\n');
  assert.equal(createHash('sha256').update(signature).digest('hex'),'c5d2e9cb34826fd4581c6d9e151fb2311020db8e60586461ab22096d8d5ed974');
  assert.equal(naval.size,ship.blocks.length);
  for(const block of ship.blocks)assert.deepEqual(naval.get(block.sourceCell),block,block.sourceCell);
  const phases=['intact','broken','displaced'].map(phase=>generateStern({phase,design:fjordStern}));
  const audit=auditStern(phases);
  assert.equal(audit.originalSHA256,audit.reassembledSHA256);
});

test('As células ambientais usam IDs e estados reais sem sobrepor o casco',()=>{
  assert.equal(at.size,scene.blocks.length,'Coordenadas repetidas no conjunto');
  const modules=new Map(scene.modules.map(m=>[m.id,m]));
  assert.equal(modules.size,scene.modules.length);
  for(const block of scene.blocks){
    assert.ok([block.x,block.y,block.z].every(Number.isSafeInteger));
    assert.ok(modules.has(block.module),block.module);
    checkStates(block,catalog);
  }
  assert.deepEqual(scene.bounds,boundsOf(scene.blocks));
  assert.deepEqual(scene.materials,inventory(scene.blocks));
  const environment=scene.blocks.filter(b=>b.environment);
  assert.equal(environment.length,scene.blocks.length-naval.size);
  for(const name of ['env-rock','env-channel','env-floes','env-glacier','env-snow','env-ruins','env-access','env-light']){
    assert.ok(environment.some(b=>b.module===name),'Módulo ambiental ausente '+name);
  }
  for(const block of ship.blocks){
    assert.equal(at.get(key(block.x,block.y,block.z)).sourceCell,block.sourceCell);
  }
});

test('O transporte público mantém as células navais e os módulos ambientais',t=>{
  const packet=packModel(scene),unpacked=unpackModel(packet);
  assert.deepEqual(bySource(unpacked.blocks),naval);
  assert.deepEqual(unpacked.modules,scene.modules);
  assert.deepEqual(unpacked.bounds,scene.bounds);
  assert.deepEqual(unpacked.materials,scene.materials);
  assert.equal(unpacked.blocks.length,scene.blocks.length);
  t.diagnostic(JSON.stringify({cells:scene.blocks.length,environment:scene.blocks.length-naval.size,materials:Object.keys(scene.materials).length,modules:scene.modules.length,packetBytes:Buffer.byteLength(JSON.stringify(packet)),generatedMs:Math.round(generatedMs)}));
});

test('Os percursos apoiam-se em pisos reais e mantêm dois blocos de altura livre',()=>{
  assert.ok(scene.polar?.routes?.length,'Percurso de acesso ausente');
  for(const route of scene.polar.routes){
    assert.ok(route.floor.length>0,route.id);
    assert.equal(route.clearance,2);
    for(const [x,y,z] of route.floor){
      assert.ok(at.has(key(x,y,z)),'Piso ausente '+route.id+' '+key(x,y,z));
      for(const dy of [1,2])assert.equal(at.has(key(x,y+dy,z)),false,'Passagem bloqueada '+route.id+' '+key(x,y+dy,z));
    }
  }
});

test('A neve ambiental assenta sobre a face superior real do bloco de apoio',()=>{
  for(const snow of scene.blocks.filter(b=>b.environment&&b.id==='minecraft:snow_layer')){
    const support=at.get(key(snow.x,snow.y-1,snow.z));
    assert.ok(support,'Neve sem apoio '+key(snow.x,snow.y,snow.z));
    const shape=catalog[support.id].shape;
    assert.ok(shape==='cube'||shape==='log'||shape==='slab'&&support.states['minecraft:vertical_half']==='top','Forma sem apoio superior completo '+key(snow.x,snow.y,snow.z));
    const boxes=kitVolume(shape,support.states);
    assert.ok(boxes.some(box=>box[0]===0&&box[2]===0&&box[3]===16&&box[4]===16&&box[5]===16),'Face de apoio incompleta ou abaixo da neve '+key(snow.x,snow.y,snow.z));
  }
});
