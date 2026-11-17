import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeMcstructure, decodeMcstructure } from './mcstructure.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const structDir = resolve(publicDir, 'estruturas');
mkdirSync(structDir, { recursive: true });

// V1 Reference Archive — 7x7 Static Moss Platform (12 x 9 x 12)
// Preserved alongside v3 in BuildsMine's Farms catalog for comparison & remodeling.
const grid = new Map();
function set(x, y, z, name, states = {}, module = 'estrutura', waterlogged = false) {
 const key = `${x},${y},${z}`;
 if (name === null) { grid.delete(key); return; }
 const entry = { x, y, z, name, states, module };
 if (waterlogged) entry.waterlogged = true;
 grid.set(key, entry);
}
function fill(x0, y0, z0, x1, y1, z1, name, states = {}, module = 'estrutura') {
 for (let x = x0; x <= x1; x++)
  for (let y = y0; y <= y1; y++)
   for (let z = z0; z <= z1; z++)
    set(x, y, z, name, { ...states }, module);
}

// 1. Base foundation (Y=0)
fill(1, 0, 0, 10, 0, 11, 'minecraft:stone_bricks', {}, 'estrutura');

// 2. Supporting deck under the 7x7 moss platform (Y=4 under moss)
for (let x = 3; x <= 9; x++) {
 for (let z = 3; z <= 9; z++) {
  if (x === 6 && z === 6) continue;
  if (x === 7 && z === 6) continue;
  if (x === 7 && z === 7) continue;
  if (x === 7 && z === 8) continue;
  set(x, 4, z, 'minecraft:smooth_stone', {}, 'estrutura');
 }
}
for (const [px, pz] of [[3, 3], [9, 3], [3, 9], [9, 9], [3, 6], [9, 6]]) {
 fill(px, 1, pz, px, 3, pz, 'minecraft:stone_bricks', {}, 'estrutura');
}

// 3. 7x7 Moss Platform (Y=5, X: 3..9, Z: 3..9)
fill(3, 5, 3, 9, 5, 9, 'minecraft:moss_block', {}, 'plataforma');

// 4. Containment walls & water-flushing dispensers (Y=5..7)
fill(2, 5, 2, 10, 7, 2, 'minecraft:stone_bricks', {}, 'estrutura');
for (const dx of [4, 6, 8]) {
 set(dx, 6, 2, 'minecraft:dispenser', { facing_direction: 3, triggered_bit: false }, 'coleta');
}
for (let bx = 3; bx <= 9; bx++) {
 set(bx, 5, 1, 'minecraft:smooth_stone', {}, 'circuito');
 set(bx, 6, 1, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
}

fill(2, 5, 3, 2, 7, 11, 'minecraft:glass', {}, 'estrutura');
fill(10, 5, 3, 10, 7, 11, 'minecraft:glass', {}, 'estrutura');
fill(3, 5, 11, 9, 7, 11, 'minecraft:glass', {}, 'estrutura');
fill(3, 4, 10, 7, 4, 10, 'minecraft:smooth_stone', {}, 'estrutura');

for (let wx = 3; wx <= 9; wx++) {
 set(wx, 5, 10, wx === 3 ? 'minecraft:water' : 'minecraft:flowing_water', { liquid_depth: wx - 3 }, 'coleta');
}
for (const [lx, lz] of [[2, 2], [10, 2], [2, 11], [10, 11]]) {
 set(lx, 8, lz, 'minecraft:lantern', { hanging: false }, 'estrutura');
}

// 5. Collection, Composters, Return Elevator & Surplus Chest ('coleta')
set(9, 4, 10, 'minecraft:hopper', { facing_direction: 0, toggle_bit: false }, 'coleta');
set(8, 4, 10, 'minecraft:hopper', { facing_direction: 0, toggle_bit: false }, 'coleta');
set(9, 3, 10, 'minecraft:composter', { composter_fill_level: 0 }, 'coleta');
set(8, 3, 10, 'minecraft:composter', { composter_fill_level: 0 }, 'coleta');

set(9, 2, 10, 'minecraft:hopper', { facing_direction: 4, toggle_bit: false }, 'coleta');
set(8, 2, 10, 'minecraft:hopper', { facing_direction: 2, toggle_bit: false }, 'coleta');
set(8, 2, 9, 'minecraft:hopper', { facing_direction: 5, toggle_bit: false }, 'coleta');
set(9, 2, 9, 'minecraft:chest', { 'minecraft:cardinal_direction': 'south' }, 'coleta');
set(10, 2, 9, 'minecraft:chest', { 'minecraft:cardinal_direction': 'south' }, 'coleta');
set(9, 1, 9, 'minecraft:stone_bricks', {}, 'estrutura');
set(10, 1, 9, 'minecraft:stone_bricks', {}, 'estrutura');

set(8, 1, 9, 'minecraft:hopper', { facing_direction: 2, toggle_bit: false }, 'coleta');
set(8, 1, 8, 'minecraft:hopper', { facing_direction: 4, toggle_bit: false }, 'coleta');

set(7, 1, 8, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');
set(7, 2, 8, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');
set(7, 3, 8, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');
set(7, 4, 8, 'minecraft:dropper', { facing_direction: 2, triggered_bit: false }, 'coleta');
set(7, 4, 7, 'minecraft:hopper', { facing_direction: 2, toggle_bit: false }, 'coleta');
set(7, 4, 6, 'minecraft:hopper', { facing_direction: 4, toggle_bit: false }, 'coleta');
set(6, 4, 6, 'minecraft:dispenser', { facing_direction: 1, triggered_bit: false }, 'coleta');

// 6. Redstone Clock & Branches ('circuito')
set(2, 1, 0, 'minecraft:smooth_stone', {}, 'circuito');
set(2, 2, 0, 'minecraft:lever', { lever_direction: 'up_east_west', open_bit: false }, 'circuito');
set(3, 1, 0, 'minecraft:unpowered_comparator', { 'minecraft:cardinal_direction': 'west', output_lit_bit: false, output_subtract_bit: true }, 'circuito');
set(4, 1, 0, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 0, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 1, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'north', repeater_delay: 3 }, 'circuito');
set(5, 1, 2, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(4, 1, 2, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'east', repeater_delay: 3 }, 'circuito');
set(3, 1, 2, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(3, 1, 1, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'south', repeater_delay: 3 }, 'circuito');

set(6, 1, 0, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(6, 1, 1, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'north', repeater_delay: 0 }, 'circuito');
set(6, 1, 2, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(6, 1, 3, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(6, 1, 4, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(6, 1, 5, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'north', repeater_delay: 0 }, 'circuito');
set(6, 1, 6, 'minecraft:smooth_stone', {}, 'circuito');
set(6, 2, 6, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito');
set(6, 3, 6, 'minecraft:smooth_stone', {}, 'circuito');

set(5, 1, 4, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 5, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 6, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 7, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
set(5, 1, 8, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'west', repeater_delay: 0 }, 'circuito');
set(6, 1, 8, 'minecraft:smooth_stone', {}, 'circuito');
set(6, 2, 8, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito');
set(6, 3, 8, 'minecraft:smooth_stone', {}, 'circuito');
set(6, 4, 8, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito');

set(7, 1, 0, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': 'west', repeater_delay: 3 }, 'circuito');
set(8, 1, 0, 'minecraft:smooth_stone', {}, 'circuito');
set(8, 2, 0, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito');
set(8, 3, 0, 'minecraft:smooth_stone', {}, 'circuito');
set(8, 4, 0, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito');
set(8, 5, 0, 'minecraft:observer', { 'minecraft:facing_direction': 'down', powered_bit: false }, 'circuito');
set(8, 6, 0, 'minecraft:smooth_stone', {}, 'circuito');
set(8, 6, 1, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');

const blocks = [...grid.values()].sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);

const model = {
 schemaVersion: 1,
 id: 'farm-musgo-v1',
 label: 'Farm de Musgo · V1 (Base 7×7)',
 size: [12, 9, 12],
 worldOrigin: [0, 0, 0],
 orientation: { front: [0, 0, -1] },
 modules: [
  { id: 'estrutura', label: 'Estrutura e Contenção', defaultVisible: true },
  { id: 'plataforma', label: 'Plataforma de Musgo (7×7)', defaultVisible: true },
  { id: 'circuito', label: 'Circuito Redstone (V1)', defaultVisible: true },
  { id: 'coleta', label: 'Água, Composteiras e Retorno', defaultVisible: true },
 ],
 demo: {
  type: 'moss-bonemeal-farm-v1',
  lever: [2, 2, 0],
  comparator: [3, 1, 0],
  bonemealDispenser: [6, 4, 6],
  centerMoss: [6, 5, 6],
  waterDispensers: [[4, 6, 2], [6, 6, 2], [8, 6, 2]],
  platformBounds: { x0: 3, x1: 9, y: 6, z0: 3, z1: 9 },
  gutterBounds: { x0: 3, x1: 9, y: 5, z: 10 },
  composters: [[9, 3, 10], [8, 3, 10]],
  chest: [[9, 2, 9], [10, 2, 9]],
  wirePhaseA: [[4, 1, 0], [5, 1, 0], [6, 1, 0], [6, 1, 2], [6, 1, 3], [6, 1, 4], [5, 1, 4], [5, 1, 5], [5, 1, 6], [5, 1, 7]],
  wirePhaseB: [[5, 1, 2], [3, 1, 2], [3, 6, 1], [4, 6, 1], [5, 6, 1], [6, 6, 1], [7, 6, 1], [8, 6, 1], [9, 6, 1]],
  observer: [8, 5, 0],
 },
 blocks,
};

const jsonPath = resolve(publicDir, 'model-farm-musgo-v1.json');
writeFileSync(jsonPath, JSON.stringify(model));

const mcBuf = encodeMcstructure({ size: model.size, worldOrigin: [0, 0, 0], blocks });
const mcPath = resolve(structDir, 'farm_musgo_v1_bedrock.mcstructure');
writeFileSync(mcPath, mcBuf);

const decoded = decodeMcstructure(mcBuf);
if (decoded.blocks.length !== blocks.length) {
 throw Error(`Round-trip mismatch: ${decoded.blocks.length} !== ${blocks.length}`);
}

console.log(JSON.stringify({ ok: true, blocks: blocks.length, size: model.size, jsonPath, mcPath }));
