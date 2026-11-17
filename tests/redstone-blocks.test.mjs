import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import {
 buildFarmPart,
 computeWireMask,
 parseFacing,
 farmKeyOf,
 FARM_CUT_KEYS,
 FARM_GLASS_KEYS,
} from '../src/scripts/redstone-blocks.js';
import { createBlockLight } from '../src/scripts/block-light.js';
import { encodeMcstructure, decodeMcstructure } from '../scripts/mcstructure.mjs';

const cutSet = new Set(FARM_CUT_KEYS);
const glassSet = new Set(FARM_GLASS_KEYS);
const V = {
 north: new THREE.Vector3(0, 0, -1),
 south: new THREE.Vector3(0, 0, 1),
 east: new THREE.Vector3(1, 0, 0),
 west: new THREE.Vector3(-1, 0, 0),
 up: new THREE.Vector3(0, 1, 0),
 down: new THREE.Vector3(0, -1, 0),
};
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _ax = new THREE.Vector3(1, 0, 0);
const _ay = new THREE.Vector3(0, 1, 0);

function makeBox(bounds, keys, _rects, _uvScale) {
 const [x0, y0, z0, x1, y1, z1] = bounds;
 const g = new THREE.BoxGeometry((x1 - x0) / 16, (y1 - y0) / 16, (z1 - z0) / 16);
 g.translate((x0 + x1) / 32, (y0 + y1) / 32, (z0 + z1) / 32);
 const isFullBox = x0 === 0 && y0 === 0 && z0 === 0 && x1 === 16 && y1 === 16 && z1 === 16;
 return { g, keys: Array.isArray(keys) ? keys : Array(6).fill(keys), isFullBox };
}
function makePlane(w, h, _rect, angle, center, key) {
 const g = new THREE.PlaneGeometry(w / 16, h / 16);
 g.rotateY(angle);
 g.translate(...center);
 return { g, keys: [key], isFullBox: false };
}
function rotateParts(list, axis, angle) {
 _m.makeRotationAxis(axis, angle);
 for (const p of list) { p.g.translate(-0.5, -0.5, -0.5); p.g.applyMatrix4(_m); p.g.translate(0.5, 0.5, 0.5); }
 return list;
}
function orientParts(list, dir, from = 'south') {
 _q.setFromUnitVectors(V[from], V[dir] || V[from]);
 _m.makeRotationFromQuaternion(_q);
 for (const p of list) { p.g.translate(-0.5, -0.5, -0.5); p.g.applyMatrix4(_m); p.g.translate(0.5, 0.5, 0.5); }
 return list;
}
function renderTestParts(b, wireMask = 0) {
 const out = [];
 const handled = buildFarmPart(b, {
  box: makeBox,
  plane: makePlane,
  rotate: rotateParts,
  orient: orientParts,
  out,
  PlaneGeometry: THREE.PlaneGeometry,
  axisX: _ax,
  axisY: _ay,
  tiltTorch: () => {},
 }, { wireMask });
 return { handled, out };
}
function isOpaqueCube(out) {
 if (out.length !== 1 || !out[0].isFullBox) return false;
 return out[0].keys.every(k => !cutSet.has(k) && !glassSet.has(k));
}

// 1. Non-cubic / translucent blocks must NEVER register as opaque full cubes
const nonOpaqueSamples = [
 { name: 'minecraft:redstone_wire', states: { redstone_signal: 12 } },
 { name: 'minecraft:unpowered_repeater', states: { 'minecraft:cardinal_direction': 'south', repeater_delay: 2 } },
 { name: 'minecraft:powered_comparator', states: { 'minecraft:cardinal_direction': 'east', output_lit_bit: true, output_subtract_bit: true } },
 { name: 'minecraft:redstone_torch', states: { torch_facing_direction: 'north' } },
 { name: 'minecraft:hopper', states: { facing_direction: 4, toggle_bit: false } },
 { name: 'minecraft:chest', states: { 'minecraft:cardinal_direction': 'south' } },
 { name: 'minecraft:composter', states: { composter_fill_level: 5 } },
 { name: 'minecraft:rail', states: { rail_direction: 6 } },
 { name: 'minecraft:golden_rail', states: { rail_direction: 2, rail_data_bit: true } },
 { name: 'minecraft:sculk_sensor', states: { sculk_sensor_phase: 1 } },
 { name: 'minecraft:calibrated_sculk_sensor', states: { 'minecraft:cardinal_direction': 'west', sculk_sensor_phase: 0 } },
 { name: 'minecraft:daylight_detector', states: { redstone_signal: 8 } },
 { name: 'minecraft:lightning_rod', states: { facing_direction: 1, powered_bit: false } },
 { name: 'minecraft:water', states: { liquid_depth: 0 } },
 { name: 'minecraft:lava', states: { liquid_depth: 0 } },
 { name: 'minecraft:slime', states: {} },
 { name: 'minecraft:honey_block', states: {} },
 { name: 'minecraft:azalea', states: {} },
 { name: 'minecraft:azalea_leaves', states: {} },
 { name: 'minecraft:amethyst_cluster', states: { 'minecraft:block_face': 'north' } },
 { name: 'minecraft:cocoa', states: { direction: 1, age: 2 } },
 { name: 'minecraft:kelp', states: { kelp_age: 3 } },
 { name: 'minecraft:rose_bush', states: { upper_block_bit: true } },
 { name: 'minecraft:farmland', states: { moisturized_amount: 7 } },
 { name: 'minecraft:lever', states: { lever_direction: 'north', open_bit: true } },
 { name: 'minecraft:stone_button', states: { facing_direction: 3, button_pressed_bit: false } },
 { name: 'minecraft:stone_pressure_plate', states: { redstone_signal: 0 } },
];

for (const b of nonOpaqueSamples) {
 const { handled, out } = renderTestParts(b);
 assert.equal(handled, true, `${b.name} must be handled by buildFarmPart`);
 assert.equal(isOpaqueCube(out), false, `${b.name} must NOT be an opaque full cube`);
 for (const p of out) p.g.dispose();
}

// 2. Opaque full cubes must be opaque full cubes
for (const b of [
 { name: 'minecraft:piston', states: { facing_direction: 1 } },
 { name: 'minecraft:sticky_piston', states: { facing_direction: 4 } },
 { name: 'minecraft:observer', states: { 'minecraft:facing_direction': 'north', powered_bit: false } },
 { name: 'minecraft:dispenser', states: { facing_direction: 0 } },
 { name: 'minecraft:dropper', states: { facing_direction: 5 } },
 { name: 'minecraft:crafter', states: { orientation: 'east_up', crafting: true, triggered_bit: false } },
 { name: 'minecraft:copper_bulb', states: { lit: true, powered_bit: false } },
 { name: 'minecraft:target', states: {} },
 { name: 'minecraft:chiseled_bookshelf', states: { direction: 2, books_stored: 3 } },
]) {
 const { handled, out } = renderTestParts(b);
 assert.equal(handled, true, `${b.name} must be handled`);
 assert.equal(isOpaqueCube(out), true, `${b.name} must be an opaque full cube`);
 for (const p of out) p.g.dispose();
}

// 3. Hopper spout direction check (facing_direction=5 -> east = +X > 1.0? No, spout at x in [0.75, 1.0])
{
 const { out } = renderTestParts({ name: 'minecraft:hopper', states: { facing_direction: 5 } });
 const spout = out[2];
 spout.g.computeBoundingBox();
 assert.ok(spout.g.boundingBox.max.x > 0.95 && spout.g.boundingBox.min.x >= 0.74, 'east hopper spout must extend to +X');
 for (const p of out) p.g.dispose();
}

 // 4. Wire connectivity mask & line/cross orientation
{
 const grid = new Map([
  ['1,1,1', { name: 'minecraft:redstone_wire', x: 1, y: 1, z: 1, states: { redstone_signal: 5 } }],
  ['1,1,0', { name: 'minecraft:observer', x: 1, y: 1, z: 0, states: {} }],
  ['2,2,1', { name: 'minecraft:redstone_wire', x: 2, y: 2, z: 1, states: { redstone_signal: 4 } }],
  ['5,1,1', { name: 'minecraft:unpowered_repeater', x: 5, y: 1, z: 1, states: { 'minecraft:cardinal_direction': 'north' } }],
  ['6,1,1', { name: 'minecraft:redstone_wire', x: 6, y: 1, z: 1, states: { redstone_signal: 0 } }],
 ]);
 const mask = computeWireMask(
  grid.get('1,1,1'),
  (x, y, z) => grid.get(`${x},${y},${z}`),
  () => false
 );
 assert.equal(mask & 1, 1, 'connects north to observer');
 assert.equal(mask & 4, 4, 'connects east to step-up wire');
 assert.equal(mask & 64, 64, 'marks east vertical climb');

 // Side wire next to N-S repeater must NOT connect sideways to repeater
 const sideRepeaterMask = computeWireMask(
  grid.get('6,1,1'),
  (x, y, z) => grid.get(`${x},${y},${z}`),
  () => false
 );
 assert.equal(sideRepeaterMask & 8, 0, 'wire must not connect laterally into repeater side');

 // Verify azalea side cutout key is registered so base does not render black
 assert.ok(cutSet.has('azaleaSide'), 'azaleaSide must be in FARM_CUT_KEYS');
 assert.ok(cutSet.has('floweringAzaleaSide'), 'floweringAzaleaSide must be in FARM_CUT_KEYS');
 assert.ok(cutSet.has('azaleaPlant'), 'azaleaPlant must be in FARM_CUT_KEYS');
}

// 5. parseFacing & farmKeyOf
assert.equal(parseFacing(0), 'down');
assert.equal(parseFacing(5), 'east');
assert.equal(parseFacing('north'), 'north');
assert.equal(farmKeyOf('minecraft:moss_block'), 'mossBlock');
assert.equal(farmKeyOf('minecraft:smooth_stone_slab'), 'smoothStone');
assert.equal(farmKeyOf('minecraft:magenta_wool'), 'wool_magenta');

// 6. Block light with new emitters (lit copper bulb vs unlit, amethyst cluster)
{
 const bulbLit = { name: 'minecraft:copper_bulb', x: 0, y: 0, z: 0, states: { lit: true } };
 const bulbOff = { name: 'minecraft:copper_bulb', x: 30, y: 0, z: 0, states: { lit: false } };
 const light = createBlockLight([bulbLit, bulbOff], () => [], {});
 light.bake(() => true);
 assert.ok(light.sample(1.5, 0.5, 0.5) > 0, 'lit copper bulb must emit light');
 assert.equal(light.sample(31.5, 0.5, 0.5), 0, 'unlit copper bulb must not emit light');
}

// 7. .mcstructure encode -> decode round-trip with farm blocks, waterlogged, and minecart entity
{
 const sampleBlocks = [
  { x: 0, y: 0, z: 0, name: 'minecraft:stone', states: {} },
  { x: 1, y: 0, z: 0, name: 'minecraft:hopper', states: { facing_direction: 4, toggle_bit: false }, waterlogged: true },
  { x: 0, y: 1, z: 0, name: 'minecraft:observer', states: { 'minecraft:facing_direction': 'south', powered_bit: true } },
  { x: 1, y: 1, z: 0, name: 'minecraft:unpowered_repeater', states: { 'minecraft:cardinal_direction': 'north', repeater_delay: 3 } },
  { x: 2, y: 0, z: 0, name: 'minecraft:golden_rail', states: { rail_direction: 1, rail_data_bit: true } },
  { x: 2, y: 1, z: 0, name: 'minecraft:copper_bulb', states: { lit: true, powered_bit: false } },
 ];
 const entities = [{ identifier: 'minecraft:hopper_minecart', position: [2.5, 1.0625, 0.5], rotation: [0, 0] }];
 const buf = encodeMcstructure({ size: [3, 2, 1], worldOrigin: [10, 64, -5], blocks: sampleBlocks, entities });
 const decoded = decodeMcstructure(buf);
 assert.deepEqual(decoded.size, [3, 2, 1]);
 assert.deepEqual(decoded.worldOrigin, [10, 64, -5]);
 assert.equal(decoded.blocks.length, sampleBlocks.length);
 assert.equal(decoded.waterloggedCount, 1);
 assert.equal(decoded.entities.length, 1);
 assert.equal(decoded.entities[0].identifier, 'minecraft:hopper_minecart');
 const decHopper = decoded.blocks.find(b => b.name === 'minecraft:hopper');
 assert.equal(decHopper.waterlogged, true);
 assert.equal(decHopper.states.facing_direction, 4);
 const decObs = decoded.blocks.find(b => b.name === 'minecraft:observer');
 assert.equal(decObs.states['minecraft:facing_direction'], 'south');
 assert.equal(Boolean(decObs.states.powered_bit), true);
}

 // 8. Round-trip verification against real AndorinhaPirateShip_Echelman.mcstructure
{
 const raw = readFileSync(new URL('../public/estruturas/AndorinhaPirateShip_Echelman.mcstructure', import.meta.url));
 const dec = decodeMcstructure(raw);
 assert.equal(dec.blocks.length, 7980);
 const reEncoded = encodeMcstructure(dec);
 const dec2 = decodeMcstructure(reEncoded);
 assert.equal(dec2.blocks.length, 7980);
 assert.deepEqual(dec2.size, dec.size);
}

// 9. Lever pivot stays anchored near base and double chest halves meet cleanly without center gap
{
 const offLever = renderTestParts({ name: 'minecraft:lever', states: { lever_direction: 'up_north_south', open_bit: false } });
 const onLever = renderTestParts({ name: 'minecraft:lever', states: { lever_direction: 'up_north_south', open_bit: true } });
 assert.equal(offLever.out.length, 2);
 assert.equal(onLever.out.length, 2);
 offLever.out[1].g.computeBoundingBox();
 onLever.out[1].g.computeBoundingBox();
 assert.ok(offLever.out[1].g.boundingBox.min.y >= 0.08 && offLever.out[1].g.boundingBox.min.y <= 0.16, 'off lever handle anchored at base');
 assert.ok(onLever.out[1].g.boundingBox.min.y >= 0.08 && onLever.out[1].g.boundingBox.min.y <= 0.16, 'on lever handle anchored at base');
 assert.notEqual(
  Math.sign(offLever.out[1].g.boundingBox.max.z - 0.5 + (offLever.out[1].g.boundingBox.min.z - 0.5)),
  Math.sign(onLever.out[1].g.boundingBox.max.z - 0.5 + (onLever.out[1].g.boundingBox.min.z - 0.5)),
  'lever handle must flip opposite sides around base pivot'
 );
 for (const p of [...offLever.out, ...onLever.out]) p.g.dispose();

 const leftHalf = [];
 buildFarmPart(
  { name: 'minecraft:chest', states: { 'minecraft:cardinal_direction': 'east' } },
  { box: makeBox, plane: makePlane, rotate: rotateParts, orient: orientParts, out: leftHalf, PlaneGeometry: THREE.PlaneGeometry, axisX: _ax, axisY: _ay, tiltTorch: () => {} },
  { wireMask: 0, chestPair: 'left' }
 );
 const rightHalf = [];
 buildFarmPart(
  { name: 'minecraft:chest', states: { 'minecraft:cardinal_direction': 'east' } },
  { box: makeBox, plane: makePlane, rotate: rotateParts, orient: orientParts, out: rightHalf, PlaneGeometry: THREE.PlaneGeometry, axisX: _ax, axisY: _ay, tiltTorch: () => {} },
  { wireMask: 0, chestPair: 'right' }
 );
 leftHalf[0].g.computeBoundingBox();
 rightHalf[0].g.computeBoundingBox();
 assert.equal(leftHalf[0].g.boundingBox.min.z, 0, 'east-facing left chest half reaches z=0 seam');
 assert.equal(rightHalf[0].g.boundingBox.max.z, 1, 'east-facing right chest half reaches z=1 seam');
 for (const p of [...leftHalf, ...rightHalf]) p.g.dispose();
}

console.log('PASS: todas as verificações de redstone-blocks, block-light e round-trip .mcstructure passaram!');
