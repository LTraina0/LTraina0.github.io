import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const original=JSON.parse(await readFile(new URL('../public/model.json',import.meta.url))),m=JSON.parse(await readFile(new URL('../public/model-tower-v1.json',import.meta.url)));
const key=b=>`${b.x},${b.y},${b.z}`,positions=new Map(m.blocks.map(b=>[key(b),b]));
test('tower 40 blocks, bridge centered and passage open',()=>{assert.equal(m.composition.tower.height,40);const a=m.blocks.filter(b=>b.module==='tower');assert.equal(Math.min(...a.map(b=>b.y)),2);assert.equal(Math.max(...a.map(b=>b.y)),41);assert.equal(Math.min(...a.map(b=>b.x))+Math.max(...a.map(b=>b.x)),35);assert.equal(positions.size,m.blocks.length);for(let x=14;x<=21;x++)for(let y=2;y<=4;y++)for(let z=5;z<=7;z++)assert.ok(!positions.has(`${x},${y},${z}`));});
test('original house and all original cushions preserved',()=>{for(const b of original.blocks.filter(b=>b.module!=='west'))assert.deepEqual(positions.get(key(b)),b);assert.deepEqual(m.entities.slice(0,original.entities.length),original.entities);assert.equal(m.entities.length,34);});
test('bridge floor remains continuous for 36 cells',()=>{for(let x=0;x<=35;x++)assert.ok(positions.has(`${x},1,6`));});

test('continuous shaft follows the upper-room footprint without outer frames',()=>{for(let y=6;y<=35;y++){const poles=m.blocks.filter(b=>b.module==='tower'&&b.y===y&&b.name==='minecraft:bamboo_block');assert.deepEqual(poles.map(b=>[b.x,b.z]).sort(),[[16,5],[16,7],[19,5],[19,7]]);}assert.deepEqual(m.composition.tower.footprint,[4,3]);});
