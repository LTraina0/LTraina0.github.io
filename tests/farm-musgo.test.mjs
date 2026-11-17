import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeMcstructure } from '../scripts/mcstructure.mjs';
import { FARM_LABELS } from '../src/scripts/redstone-blocks.js';

const model = JSON.parse(readFileSync(new URL('../public/model-farm-musgo.json', import.meta.url), 'utf8'));
const mcRaw = readFileSync(new URL('../public/estruturas/farm_musgo_bedrock.mcstructure', import.meta.url));
const decoded = decodeMcstructure(mcRaw);

assert.equal(model.id, 'farm-musgo');
assert.equal(decoded.blocks.length, model.blocks.length);
assert.deepEqual(decoded.size, model.size);
assert.equal(model.modules.length, 4);
assert.ok(model.demo?.type === 'moss-bonemeal-farm');

const coordMap = new Map(model.blocks.map(b => [`${b.x},${b.y},${b.z}`, b]));
const decMap = new Map(decoded.blocks.map(b => [`${b.x},${b.y},${b.z}`, b]));

// 1. Verify Central Bonemeal Dispenser is pre-loaded with 64 bone_meal in .mcstructure block_position_data
const [bx, by, bz] = model.demo.bonemealDispenser;
const decDisp = decMap.get(`${bx},${by},${bz}`);
assert.equal(decDisp?.name, 'minecraft:dispenser');
assert.equal(decDisp?.states.facing_direction, 1, 'Bonemeal dispenser must face UP (+Y)');
assert.equal(decDisp?.blockEntity?.id, 'Dispenser');
assert.equal(decDisp?.blockEntity?.items?.[0]?.name, 'minecraft:bone_meal');
assert.equal(decDisp?.blockEntity?.items?.[0]?.count, 64);

// 2. Verify permanent central moss block sits directly above bonemeal dispenser
const [mx, my, mz] = model.demo.centerMoss;
assert.equal(coordMap.get(`${mx},${my},${mz}`)?.name, 'minecraft:moss_block');
assert.equal(mx, bx);
assert.equal(my, by + 1);
assert.equal(mz, bz);

// 3. Verify Stone-Generator Waterlogged Pistons (4 North + 4 South) and Lava seals
assert.equal(model.demo.northPistons.length, 4);
assert.equal(model.demo.southPistons.length, 4);
for (const [px, py, pz] of model.demo.northPistons) {
 const p = decMap.get(`${px},${py},${pz}`);
 assert.equal(p?.name, 'minecraft:piston');
 assert.equal(p?.waterlogged, true, `North stone-gen piston ${px},${py},${pz} must be waterlogged`);
 assert.equal(p?.states.facing_direction, 3);
 assert.equal(coordMap.get(`${px},${py + 1},${pz + 1}`)?.name, 'minecraft:lava', 'Lava must drip vertically onto stone slot');
}
for (const [px, py, pz] of model.demo.southPistons) {
 const p = decMap.get(`${px},${py},${pz}`);
 assert.equal(p?.name, 'minecraft:piston');
 assert.equal(p?.waterlogged, true, `South stone-gen piston ${px},${py},${pz} must be waterlogged`);
 assert.equal(p?.states.facing_direction, 2);
 assert.equal(coordMap.get(`${px},${py + 1},${pz - 1}`)?.name, 'minecraft:lava', 'Lava must drip vertically onto stone slot');
}

// 4. Verify 7 Floodgate Sticky Pistons (facing UP) and water reservoir
assert.equal(model.demo.floodgatePistons.length, 7);
for (const [fx, fy, fz] of model.demo.floodgatePistons) {
 assert.equal(coordMap.get(`${fx},${fy},${fz}`)?.name, 'minecraft:sticky_piston');
 assert.equal(coordMap.get(`${fx},${fy},${fz}`)?.states.facing_direction, 1);
 assert.equal(coordMap.get(`${fx - 1},${fy + 2},${fz}`)?.name, 'minecraft:water');
}

// 5. Verify unobstructed double chest in East wing
for (const [cx, cy, cz] of model.demo.chest) {
 const chestBlock = coordMap.get(`${cx},${cy},${cz}`);
 assert.equal(chestBlock?.name, 'minecraft:chest');
 assert.equal(chestBlock.states['minecraft:cardinal_direction'], 'east');
 assert.equal(coordMap.has(`${cx},${cy + 1},${cz}`), false, `Chest at ${cx},${cy},${cz} must have air above`);
}

// 6. Verify Bedrock cardinal_direction = OUTPUT on clock & lock repeaters/comparator
assert.equal(coordMap.get('1,4,0')?.states['minecraft:cardinal_direction'], 'east');
assert.equal(coordMap.get('2,4,1')?.states['minecraft:cardinal_direction'], 'south');
assert.equal(coordMap.get('1,3,4')?.states['minecraft:cardinal_direction'], 'west');
assert.equal(coordMap.get('0,3,2')?.states['minecraft:cardinal_direction'], 'north');
assert.equal(coordMap.get('7,4,8')?.name, 'minecraft:unpowered_comparator');
assert.equal(coordMap.get('7,4,8')?.states['minecraft:cardinal_direction'], 'south');
assert.equal(coordMap.get('10,1,11')?.states['minecraft:cardinal_direction'], 'north');

// 7. Zero floating dependent blocks (repeaters, comparators, wires, top torches, levers)
const solidSet = new Set(
 model.blocks
  .filter(b => !/(wire|repeater|comparator|torch|lever|water|lava)/.test(b.name))
  .map(b => `${b.x},${b.y},${b.z}`)
);
for (const b of model.blocks) {
 if (/(redstone_wire|repeater|comparator|lever)/.test(b.name) || (b.name.includes('torch') && b.states.torch_facing_direction === 'top')) {
  assert.ok(solidSet.has(`${b.x},${b.y - 1},${b.z}`), `Floating block ${b.name} at ${b.x},${b.y},${b.z}`);
 }
}

// 8. Verify every block has a PT-BR label
const BASE_LABELS = new Set(['stone_bricks', 'smooth_stone', 'glass', 'lantern']);
for (const b of model.blocks) {
 const id = b.name.split(':')[1];
 assert.ok(FARM_LABELS[id] || BASE_LABELS.has(id), `Missing PT-BR label for ${b.name}`);
}

console.log(`PASS: Farm de Musgo v3 Bedrock validada (${model.blocks.length} blocos, gerador de pedra + pistoes encharcados + 64 farinhas pre-carregadas).`);

// 9. Verify V1 reference model is also intact & decodes cleanly
const modelV1 = JSON.parse(readFileSync(new URL('../public/model-farm-musgo-v1.json', import.meta.url), 'utf8'));
const mcV1 = decodeMcstructure(readFileSync(new URL('../public/estruturas/farm_musgo_v1_bedrock.mcstructure', import.meta.url)));
assert.equal(modelV1.id, 'farm-musgo-v1');
assert.equal(modelV1.blocks.length, 416);
assert.equal(mcV1.blocks.length, 416);
assert.deepEqual(mcV1.size, [12, 9, 12]);
assert.equal(modelV1.demo?.type, 'moss-bonemeal-farm-v1');
console.log(`PASS: Farm de Musgo V1 (Referencia) validada (${modelV1.blocks.length} blocos, 12x9x12).`);
