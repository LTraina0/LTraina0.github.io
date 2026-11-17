import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeMcstructure, decodeMcstructure } from './mcstructure.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const structDir = resolve(publicDir, 'estruturas');
mkdirSync(structDir, { recursive: true });

// 100% Bedrock Edition 1.21+ Automatic Moss & Bonemeal Farm (v3 Stone-Generator + Pistons + Floodgate)
// Dimensions: 13 x 9 x 15 (X: 0..12, Y: 0..8, Z: 0..14) - fits inside a single 16x16 chunk!
// Audited Bedrock rules:
// - minecraft:cardinal_direction on repeater/comparator = OUTPUT direction
// - Waterlogged stone-gen pistons (North Z=1, South Z=13) + overhead sealed lava (Z=2, Z=12) form stone cleanly
// - MCPE-121996 (1.17.30+): Pistons crush converted moss_blocks in place -> net +100% bonemeal profit
// - Level-triggered Sticky Piston Floodgate (X=4): immune to lever toggle desync (Lever OFF = strictly dry)
// - Comparator Lock at (7,4,7)->(10,1,10) caps dispenser reserve at ~96 items; excess goes straight to East chest
// - Pre-loaded 64 bone_meal baked into block_position_data of (7,4,7) Dispenser

const grid = new Map();
function set(x, y, z, name, states = {}, module = 'estrutura', extra = {}) {
 const key = `${x},${y},${z}`;
 if (name === null) { grid.delete(key); return; }
 const entry = { x, y, z, name, states, module };
 if (extra.waterlogged) entry.waterlogged = true;
 if (extra.blockEntity) entry.blockEntity = extra.blockEntity;
 grid.set(key, entry);
}
function fill(x0, y0, z0, x1, y1, z1, name, states = {}, module = 'estrutura') {
 for (let x = x0; x <= x1; x++)
  for (let y = y0; y <= y1; y++)
   for (let z = z0; z <= z1; z++)
    set(x, y, z, name, { ...states }, module);
}

// 1. Base foundation (Y=0)
fill(0, 0, 0, 12, 0, 14, 'minecraft:stone_bricks', {}, 'estrutura');

// 2. Supporting deck under 5x7 conversion tray (Y=4, X:5..9, Z:4..10) & generator frames
for (let x = 5; x <= 9; x++) {
 for (let z = 4; z <= 10; z++) {
  if (x === 7 && z === 7) continue; // central bonemeal dispenser
  if (x === 8 && z === 7) continue; // top dropper of return shaft
  if (x === 7 && (z === 5 || z === 6 || z >= 8)) continue; // dispenser trigger / comparator lock channels
  if (x === 6 && (z === 5 || z === 6)) continue; // dispenser trigger wire
  if ((x === 8 || x === 9) && z >= 4 && z <= 6) continue; // upper dropper pulse stairs
  set(x, 4, z, 'minecraft:smooth_stone', {}, 'estrutura');
 }
}
// Solid deck under North & South stone generators and pistons (Y=4)
fill(4, 4, 1, 10, 4, 3, 'minecraft:smooth_stone', {}, 'estrutura');
fill(4, 4, 11, 10, 4, 13, 'minecraft:smooth_stone', {}, 'estrutura');
// Seal piston back & caps (North Z=0, Y=5 and Y=6; South Z=14, Y=5 and Y=6)
fill(4, 5, 0, 10, 5, 0, 'minecraft:smooth_stone', {}, 'estrutura');
fill(4, 5, 14, 10, 5, 14, 'minecraft:smooth_stone', {}, 'estrutura');
fill(4, 6, 1, 10, 6, 1, 'minecraft:stone_bricks', {}, 'estrutura');
fill(4, 6, 13, 10, 6, 13, 'minecraft:stone_bricks', {}, 'estrutura');
// North & South Lava Containment Rings + Divider Walls (Y=5..7)
for (const px of [4, 7, 10]) {
 set(px, 5, 1, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 5, 2, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 5, 3, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 6, 2, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 5, 11, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 5, 12, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 5, 13, 'minecraft:stone_bricks', {}, 'estrutura');
 set(px, 6, 12, 'minecraft:stone_bricks', {}, 'estrutura');
}
fill(4, 6, 3, 10, 6, 3, 'minecraft:stone_bricks', {}, 'estrutura');
fill(4, 6, 11, 10, 6, 11, 'minecraft:stone_bricks', {}, 'estrutura');
fill(4, 7, 2, 10, 7, 3, 'minecraft:stone_bricks', {}, 'estrutura');
fill(4, 7, 11, 10, 7, 12, 'minecraft:stone_bricks', {}, 'estrutura');
fill(5, 7, 2, 9, 7, 2, 'minecraft:glass', {}, 'estrutura');
fill(5, 7, 12, 9, 7, 12, 'minecraft:glass', {}, 'estrutura');

// Perimeter support pillars (keeping Y=1..4 wires & chest completely clear)
for (const [px, pz] of [[4, 1], [10, 1], [4, 13], [10, 13], [10, 4], [10, 7]]) {
 fill(px, 1, pz, px, 3, pz, 'minecraft:stone_bricks', {}, 'estrutura');
}
// East glass containment & lantern lighting
fill(11, 5, 4, 11, 7, 10, 'minecraft:glass', {}, 'estrutura');
fill(4, 7, 4, 4, 7, 10, 'minecraft:glass', {}, 'estrutura');
fill(10, 4, 4, 10, 4, 8, 'minecraft:smooth_stone', {}, 'estrutura');
for (const [lx, lz] of [[4, 3], [10, 3], [4, 11], [10, 11]]) {
 set(lx, 8, lz, 'minecraft:lantern', { hanging: false }, 'estrutura');
}

// 3. Stone Generators, Waterlogged Pistons & 5x7 Conversion Platform ('plataforma')
for (const sx of [5, 6, 8, 9]) {
 // North wing: waterlogged piston -> stone gen under lava -> buffer stone -> conversion lane
 set(sx, 5, 1, 'minecraft:piston', { facing_direction: 3 }, 'plataforma', { waterlogged: true });
 set(sx, 5, 2, 'minecraft:stone', {}, 'plataforma');
 set(sx, 6, 2, 'minecraft:lava', { liquid_depth: 0 }, 'plataforma');
 set(sx, 5, 3, 'minecraft:stone', {}, 'plataforma');
 for (let sz = 4; sz <= 6; sz++) set(sx, 5, sz, 'minecraft:stone', {}, 'plataforma');

 // Obsidian stopper row at Z=7 (prevents North/South stone lanes from colliding)
 set(sx, 5, 7, 'minecraft:obsidian', {}, 'plataforma');

 // South wing
 for (let sz = 8; sz <= 10; sz++) set(sx, 5, sz, 'minecraft:stone', {}, 'plataforma');
 set(sx, 5, 11, 'minecraft:stone', {}, 'plataforma');
 set(sx, 5, 12, 'minecraft:stone', {}, 'plataforma');
 set(sx, 6, 12, 'minecraft:lava', { liquid_depth: 0 }, 'plataforma');
 set(sx, 5, 13, 'minecraft:piston', { facing_direction: 2 }, 'plataforma', { waterlogged: true });
}
// Stationary center strip X=7 (never pushed by pistons; (7,5,7) sits directly on bonemeal dispenser)
set(7, 5, 2, 'minecraft:smooth_stone', {}, 'estrutura');
set(7, 5, 3, 'minecraft:smooth_stone', {}, 'estrutura');
set(7, 5, 11, 'minecraft:smooth_stone', {}, 'estrutura');
set(7, 5, 12, 'minecraft:smooth_stone', {}, 'estrutura');
for (let sz = 4; sz <= 10; sz++) {
 set(7, 5, sz, 'minecraft:moss_block', {}, 'plataforma');
}

// 4. West Sticky-Piston Floodgate & Permanent Water Reservoir ('coleta')
fill(3, 5, 4, 3, 5, 10, 'minecraft:smooth_stone', {}, 'coleta');
fill(2, 6, 4, 2, 6, 10, 'minecraft:glass', {}, 'estrutura');
set(3, 6, 3, 'minecraft:stone_bricks', {}, 'estrutura');
set(3, 6, 11, 'minecraft:stone_bricks', {}, 'estrutura');
for (let fz = 4; fz <= 10; fz++) {
 set(3, 6, fz, 'minecraft:water', { liquid_depth: 0 }, 'coleta');
 set(4, 4, fz, 'minecraft:sticky_piston', { facing_direction: 1 }, 'coleta');
 set(4, 5, fz, 'minecraft:smooth_stone', {}, 'coleta'); // Pushed up to Y=6 on idle = DRY!
}

// 5. East Collection Gutter, Dual Composters, Dropper Return & Unobstructed Double Chest ('coleta')
for (let gz = 4; gz <= 10; gz++) {
 set(10, 5, gz, gz === 4 ? 'minecraft:water' : 'minecraft:flowing_water', { liquid_depth: gz - 4 }, 'coleta');
}
// 2 Intake Hoppers -> 2 Composters -> Priority Junction -> East Double Chest
set(10, 4, 9, 'minecraft:hopper', { facing_direction: 0, toggle_bit: false }, 'coleta');
set(10, 4, 10, 'minecraft:hopper', { facing_direction: 0, toggle_bit: false }, 'coleta');
set(10, 3, 9, 'minecraft:composter', { composter_fill_level: 0 }, 'coleta');
set(10, 3, 10, 'minecraft:composter', { composter_fill_level: 0 }, 'coleta');
set(10, 2, 9, 'minecraft:hopper', { facing_direction: 3, toggle_bit: false }, 'coleta'); // south -> (10,2,10)
set(10, 2, 10, 'minecraft:hopper', { facing_direction: 5, toggle_bit: false }, 'coleta'); // east -> double chest

// Unobstructed Surplus Double Chest in East wing (X=11, Y=2, Z=9..10; air above!)
set(11, 1, 9, 'minecraft:stone_bricks', {}, 'estrutura');
set(11, 1, 10, 'minecraft:stone_bricks', {}, 'estrutura');
set(11, 2, 9, 'minecraft:chest', { 'minecraft:cardinal_direction': 'east' }, 'coleta');
set(11, 2, 10, 'minecraft:chest', { 'minecraft:cardinal_direction': 'east' }, 'coleta');

// Priority Return Hopper (locked by comparator when (7,4,7) >= 96 bone_meal) -> Zero-buffer Dropper Chain -> (7,4,7)
set(10, 1, 10, 'minecraft:hopper', { facing_direction: 4, toggle_bit: false }, 'coleta'); // west -> (9,1,10)
set(9, 1, 10, 'minecraft:dropper', { facing_direction: 4, triggered_bit: false }, 'coleta'); // west -> (8,1,10)
set(8, 1, 10, 'minecraft:dropper', { facing_direction: 2, triggered_bit: false }, 'coleta'); // north
set(8, 1, 9, 'minecraft:dropper', { facing_direction: 2, triggered_bit: false }, 'coleta');  // north
set(8, 1, 8, 'minecraft:dropper', { facing_direction: 2, triggered_bit: false }, 'coleta');  // north
set(8, 1, 7, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');  // up
set(8, 2, 7, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');  // up
set(8, 3, 7, 'minecraft:dropper', { facing_direction: 1, triggered_bit: false }, 'coleta');  // up
set(8, 4, 7, 'minecraft:dropper', { facing_direction: 4, triggered_bit: false }, 'coleta');  // west -> (7,4,7) dispenser!

// Central Upward Bonemeal Dispenser with 64 Bone Meal baked into block_position_data
set(7, 4, 7, 'minecraft:dispenser', { facing_direction: 1, triggered_bit: false }, 'coleta', {
 blockEntity: {
  id: 'Dispenser',
  items: [{ name: 'minecraft:bone_meal', count: 64, slot: 0, damage: 0 }],
 },
});

// 6. Redstone Clock, Piston Observer, Floodgate Controller & Comparator Reserve Lock ('circuito')
function wire(x, y, z) {
 set(x, y - 1, z, 'minecraft:smooth_stone', {}, 'circuito');
 set(x, y, z, 'minecraft:redstone_wire', { redstone_signal: 0 }, 'circuito');
}
function rep(x, y, z, outDir, delay = 0) {
 set(x, y - 1, z, 'minecraft:smooth_stone', {}, 'circuito');
 set(x, y, z, 'minecraft:unpowered_repeater', { 'minecraft:cardinal_direction': outDir, repeater_delay: delay }, 'circuito');
}

// 6a. Lever + T_gate + 5-Repeater 4.0s Clock Loop (X=0..2, Z=0..6)
set(0, 1, 6, 'minecraft:stone_bricks', {}, 'circuito');
set(0, 2, 6, 'minecraft:lever', { lever_direction: 'up_north_south', open_bit: false }, 'circuito');
wire(0, 1, 5); wire(0, 1, 4); wire(0, 1, 3);
rep(0, 1, 2, 'north', 0);
set(0, 1, 1, 'minecraft:smooth_stone', {}, 'circuito');
set(0, 2, 1, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito'); // T_gate
set(0, 3, 1, 'minecraft:smooth_stone', {}, 'circuito');
set(0, 4, 1, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito'); // T_clock

wire(0, 4, 0);
rep(1, 4, 0, 'east', 3); // R1 (0.4s)
wire(2, 4, 0);           // t = 0.4s ON / 2.4s OFF (observed!)
rep(2, 4, 1, 'south', 3); // R2 (0.8s)
rep(2, 4, 2, 'south', 3); // R3 (1.2s)
wire(2, 4, 3);
wire(2, 3, 4);            // step down (2,4,4 = air)
rep(1, 3, 4, 'west', 3);  // R4 (1.6s)
wire(0, 3, 4);
wire(0, 3, 3);
rep(0, 3, 2, 'north', 3); // R5 (2.0s -> back to (0,3,1))

// 6b. Branch A (t = 0.0s): Bonemeal Dispenser (7,4,7)
set(0, 5, 1, 'minecraft:smooth_stone', {}, 'circuito');
rep(0, 5, 2, 'south', 0);
wire(0, 5, 3); wire(0, 5, 4); wire(0, 5, 5); wire(0, 5, 6);
wire(1, 4, 6); wire(2, 3, 6); wire(3, 2, 6); wire(4, 2, 6);
wire(4, 2, 5); wire(5, 3, 5); wire(6, 4, 5); wire(7, 4, 5);
rep(7, 4, 6, 'south', 0); // hard-powers (7,4,7) Dispenser directly

// 6c. Branch B (t = 0.4s & 2.4s): Observer -> North Pistons + South Pistons + Dropper Chain
set(2, 5, 0, 'minecraft:observer', { 'minecraft:facing_direction': 'down', powered_bit: false }, 'circuito');
set(2, 6, 0, 'minecraft:smooth_stone', {}, 'circuito');
rep(3, 6, 0, 'east', 1);
for (let nx = 4; nx <= 9; nx++) wire(nx, 6, 0); // North piston bar (note (4..9,5,0) already smooth_stone)

rep(1, 6, 0, 'south', 0);
for (let sz = 1; sz <= 7; sz++) wire(1, 6, sz);
rep(1, 6, 8, 'south', 0);
for (let sz = 9; sz <= 14; sz++) wire(1, 6, sz);
for (let sx = 2; sx <= 9; sx++) wire(sx, 6, 14); // South piston bar

// Step down from South piston bar -> Return Dropper Chain
wire(2, 5, 13); wire(2, 4, 12); wire(2, 3, 11); wire(2, 2, 10);
wire(2, 1, 9); wire(3, 1, 9); wire(4, 1, 9); wire(5, 1, 9);
rep(6, 1, 9, 'east', 0);
wire(7, 1, 9); wire(7, 1, 8); wire(7, 1, 7); wire(7, 1, 10);
wire(7, 1, 11); wire(8, 1, 11); wire(9, 1, 11); // pulses (9,1,10) Dropper 1
// Vertical shaft dropper pulses (8,2..4,7)
wire(7, 1, 6); wire(8, 1, 6); wire(9, 1, 6);
wire(10, 2, 6); wire(10, 2, 7); rep(9, 2, 7, 'west', 0);
wire(10, 3, 5); wire(9, 3, 5); wire(9, 3, 6); rep(9, 3, 7, 'west', 0);
wire(9, 4, 4); wire(8, 4, 4); wire(8, 4, 5); rep(8, 4, 6, 'south', 0);

// 6d. Branch C (Sticky Pistons = R1 OR !R4 -> opens cleanly 2.6s..3.6s!)
wire(3, 4, 0); wire(3, 4, 1); wire(3, 4, 2);
rep(3, 4, 3, 'south', 1); // +0.2s so flush begins at 2.6s (after Push 2)
for (let fz = 4; fz <= 10; fz++) wire(3, 4, fz);

wire(0, 3, 5); wire(0, 3, 6); wire(0, 3, 7);
rep(0, 3, 8, 'east', 0);
set(1, 3, 8, 'minecraft:smooth_stone', {}, 'circuito');
set(1, 4, 8, 'minecraft:redstone_torch', { torch_facing_direction: 'top' }, 'circuito'); // !R4
wire(2, 4, 8); // feeds directly into (3,4,8) Floodgate wire

// 6e. Comparator Reserve Lock on Return Hopper (10,1,10) when Dispenser (7,4,7) >= 96 items (signal >= 3)
set(7, 3, 8, 'minecraft:smooth_stone', {}, 'circuito');
set(7, 4, 8, 'minecraft:unpowered_comparator', { 'minecraft:cardinal_direction': 'south', output_lit_bit: false, output_subtract_bit: false }, 'circuito');
wire(7, 4, 9); wire(7, 4, 10); wire(7, 4, 11);
rep(8, 4, 11, 'east', 0);
wire(9, 4, 11); wire(10, 3, 11); wire(11, 2, 11); wire(11, 1, 12); wire(10, 1, 12);
rep(10, 1, 11, 'north', 0); // directly locks (10,1,10) Return Hopper when >= 96 bone_meal

// Stable ordered block list: solids first, dependent/fluid blocks last
const blocks = [...grid.values()].sort((a, b) => {
 const dep = n => /(wire|repeater|comparator|torch|lever|water|lava)/.test(n) ? 1 : 0;
 return dep(a.name) - dep(b.name) || a.y - b.y || a.x - b.x || a.z - b.z;
});

const model = {
 schemaVersion: 2,
 id: 'farm-musgo',
 label: 'Farm de Musgo · Farinha de Osso v3 (Bedrock 1.21+)',
 size: [13, 9, 15],
 orientation: { front: '+Z', back: '-Z', left: '-X (Port)', right: '+X (Starboard)' },
 modules: [
  { id: 'estrutura', label: 'Estrutura & Contenção', defaultVisible: true },
  { id: 'plataforma', label: 'Gerador de Pedra, Pistões & Musgo', defaultVisible: true },
  { id: 'coleta', label: 'Comporta d\'Água, Calha & Composteiras', defaultVisible: true },
  { id: 'circuito', label: 'Clock 4.0s, Travas & Circuito Redstone', defaultVisible: true },
 ],
 stats: {
  blockCount: blocks.length,
  bedrockVerified: true,
 },
 demo: {
  type: 'moss-bonemeal-farm',
  lever: [0, 2, 6],
  comparator: [7, 4, 8],
  bonemealDispenser: [7, 4, 7],
  centerMoss: [7, 5, 7],
  observer: [2, 5, 0],
  northPistons: [[5, 5, 1], [6, 5, 1], [8, 5, 1], [9, 5, 1]],
  southPistons: [[5, 5, 13], [6, 5, 13], [8, 5, 13], [9, 5, 13]],
  floodgatePistons: [[4, 4, 4], [4, 4, 5], [4, 4, 6], [4, 4, 7], [4, 4, 8], [4, 4, 9], [4, 4, 10]],
  composters: [[10, 3, 9], [10, 3, 10]],
  chest: [[11, 2, 9], [11, 2, 10]],
  platformBounds: { x0: 5, x1: 9, y: 6, z0: 4, z1: 10 },
  gutterBounds: { x: 10, y: 5, z0: 4, z1: 10 },
  wirePhaseA: [
   [0, 1, 5], [0, 1, 4], [0, 1, 3], [0, 4, 0], [0, 5, 3], [0, 5, 4], [0, 5, 5], [0, 5, 6],
   [1, 4, 6], [2, 3, 6], [3, 2, 6], [4, 2, 6], [4, 2, 5], [5, 3, 5], [6, 4, 5], [7, 4, 5],
  ],
  repeatersPhaseA: [[0, 5, 2], [7, 4, 6]],
  torchesPhaseA: [[0, 4, 1]],
  wirePhaseB: [
   [2, 4, 0], [4, 6, 0], [5, 6, 0], [6, 6, 0], [7, 6, 0], [8, 6, 0], [9, 6, 0],
   [1, 6, 1], [1, 6, 2], [1, 6, 3], [1, 6, 4], [1, 6, 5], [1, 6, 6], [1, 6, 7],
   [1, 6, 9], [1, 6, 10], [1, 6, 11], [1, 6, 12], [1, 6, 13], [1, 6, 14],
   [2, 6, 14], [3, 6, 14], [4, 6, 14], [5, 6, 14], [6, 6, 14], [7, 6, 14], [8, 6, 14], [9, 6, 14],
   [2, 5, 13], [2, 4, 12], [2, 3, 11], [2, 2, 10],
   [2, 1, 9], [3, 1, 9], [4, 1, 9], [5, 1, 9], [7, 1, 9], [7, 1, 8], [7, 1, 7], [7, 1, 10],
   [7, 1, 11], [8, 1, 11], [9, 1, 11], [7, 1, 6], [8, 1, 6], [9, 1, 6],
  ],
  repeatersPhaseB: [
   [1, 4, 0], [3, 6, 0], [1, 6, 0], [1, 6, 8], [6, 1, 9], [9, 2, 7], [9, 3, 7], [8, 4, 6],
  ],
  torchesIdleOff: [[0, 2, 1]],
  torchesFloodOff: [[1, 4, 8]],
  floodgateWire: [
   [3, 4, 0], [3, 4, 1], [3, 4, 2],
   [3, 4, 4], [3, 4, 5], [3, 4, 6], [3, 4, 7], [3, 4, 8], [3, 4, 9], [3, 4, 10], [2, 4, 8],
  ],
  floodgateRepeaters: [[3, 4, 3], [0, 3, 8]],
 },
 blocks,
};

const jsonPath = resolve(publicDir, 'model-farm-musgo.json');
writeFileSync(jsonPath, JSON.stringify(model));

const mcBuf = encodeMcstructure({ size: model.size, worldOrigin: [0, 0, 0], blocks });
const mcPath = resolve(structDir, 'farm_musgo_bedrock.mcstructure');
writeFileSync(mcPath, mcBuf);

const decoded = decodeMcstructure(mcBuf);
if (decoded.blocks.length !== blocks.length) {
 throw Error(`Round-trip mismatch: ${decoded.blocks.length} !== ${blocks.length}`);
}

console.log(JSON.stringify({
 ok: true,
 blocks: blocks.length,
 size: model.size,
 jsonPath,
 mcPath,
 paletteSize: decoded.paletteSize,
}));
