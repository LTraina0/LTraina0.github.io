import * as T from 'three';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { canonicalStairParts, stairFacing } from './geometry.js';
import { createBlockLight } from './block-light.js';
import {
 FARM_TEXTURE_FILES,
 FARM_TEXTURE_ALIASES,
 FARM_MATERIAL_TINTS,
 FARM_CUT_KEYS,
 FARM_GLASS_KEYS,
 FARM_EMISSIVE_SPECS,
 FARM_NIGHT_EMISSIVE_KEYS,
 FARM_ITEM_ICON_FILES,
 FARM_LOG_MAP,
 buildFarmPart,
 computeWireMask,
 farmKeyOf,
} from './redstone-blocks.js';

const ROOT = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.60.5/resource_pack/textures/';

const TEXTURE_FILES = {
 ...FARM_TEXTURE_FILES,
 mud: 'blocks/mud_bricks.png',
 birch: 'blocks/planks_birch.png',
 bamboo: 'blocks/bamboo_planks.png',
 mosaic: 'blocks/bamboo_mosaic.png',
 log: 'blocks/bamboo_block.png',
 logTop: 'blocks/bamboo_block_top.png',
 stripped: 'blocks/stripped_bamboo_block.png',
 strippedTop: 'blocks/stripped_bamboo_block_top.png',
 trapdoor: 'blocks/bamboo_trapdoor.png',
 lantern: 'blocks/lantern.png',
 soulLantern: 'blocks/soul_lantern.png',
 copperLantern: 'blocks/copper_lantern.png',
 exposedCopperLantern: 'blocks/exposed_copper_lantern.png',
 weatheredCopperLantern: 'blocks/weathered_copper_lantern.png',
 oxidizedCopperLantern: 'blocks/oxidized_copper_lantern.png',
 chain1: 'blocks/chain1.png',
 chain2: 'blocks/chain2.png',
 copperChain1: 'blocks/copper_chain1.png',
 copperChain2: 'blocks/copper_chain2.png',
 exposedCopperChain1: 'blocks/exposed_copper_chain1.png',
 exposedCopperChain2: 'blocks/exposed_copper_chain2.png',
 weatheredCopperChain1: 'blocks/weathered_copper_chain1.png',
 weatheredCopperChain2: 'blocks/weathered_copper_chain2.png',
 oxidizedCopperChain1: 'blocks/oxidized_copper_chain1.png',
 oxidizedCopperChain2: 'blocks/oxidized_copper_chain2.png',
 torch: 'blocks/torch_on.png',
 shroom: 'blocks/shroomlight.png',
 bell: 'blocks/bell_side.png',
 bellTop: 'blocks/bell_top.png',
 bellBottom: 'blocks/bell_bottom.png',
 scaffold: 'blocks/scaffolding_side.tga',
 scaffoldTop: 'blocks/scaffolding_top.tga',
 scaffoldBottom: 'blocks/scaffolding_bottom.tga',
 wood: 'blocks/planks_oak.png',
 fence: 'blocks/bamboo_fence.png',
 gate: 'blocks/bamboo_fence_gate.png',
 birchLog: 'blocks/stripped_birch_log.png',
 birchLogTop: 'blocks/stripped_birch_log_top.png',
 froglight: 'blocks/ochre_froglight_side.png',
 froglightTop: 'blocks/ochre_froglight_top.png',
 pearlescentFroglight: 'blocks/pearlescent_froglight_side.png',
 pearlescentFroglightTop: 'blocks/pearlescent_froglight_top.png',
 stem: 'blocks/bamboo_stem.png',
 leaf: 'blocks/bamboo_leaf.png',
 smallLeaf: 'blocks/bamboo_small_leaf.png',
 spruce: 'blocks/planks_spruce.png',
 spruceLog: 'blocks/log_spruce.png',
 spruceLogTop: 'blocks/log_spruce_top.png',
 strippedSpruce: 'blocks/stripped_spruce_log.png',
 strippedSpruceTop: 'blocks/stripped_spruce_log_top.png',
 spruceTrapdoor: 'blocks/spruce_trapdoor.png',
 spruceDoorLower: 'blocks/door_spruce_lower.png',
 spruceDoorUpper: 'blocks/door_spruce_upper.png',
 darkOak: 'blocks/planks_big_oak.png',
 darkOakLog: 'blocks/log_big_oak.png',
 darkOakLogTop: 'blocks/log_big_oak_top.png',
 strippedDarkOak: 'blocks/stripped_dark_oak_log.png',
 strippedDarkOakTop: 'blocks/stripped_dark_oak_log_top.png',
 darkOakTrapdoor: 'blocks/dark_oak_trapdoor.png',
 darkOakDoorLower: 'blocks/door_dark_oak_lower.png',
 darkOakDoorUpper: 'blocks/door_dark_oak_upper.png',
 crimsonDoorLower: 'blocks/huge_fungus/crimson_door_lower.png',
 crimsonDoorUpper: 'blocks/huge_fungus/crimson_door_top.png',
 oakLog: 'blocks/log_oak.png',
 oakLogTop: 'blocks/log_oak_top.png',
 strippedOak: 'blocks/stripped_oak_log.png',
 strippedOakTop: 'blocks/stripped_oak_log_top.png',
 oakTrapdoor: 'blocks/trapdoor.png',
 crimson: 'blocks/huge_fungus/crimson_planks.png',
 crimsonTrapdoor: 'blocks/huge_fungus/crimson_trapdoor.png',
 strippedCrimson: 'blocks/huge_fungus/stripped_crimson_stem_side.png',
 strippedCrimsonTop: 'blocks/huge_fungus/stripped_crimson_stem_top.png',
 redNether: 'blocks/red_nether_brick.png',
 netherBricks: 'blocks/nether_brick.png',
 chiseledNether: 'blocks/chiseled_nether_bricks.png',
 polishedBlackstoneBricks: 'blocks/polished_blackstone_bricks.png',
 chiseledPolishedBlackstone: 'blocks/chiseled_polished_blackstone.png',
 oxCopper: 'blocks/oxidized_cut_copper.png',
 weatheredCopper: 'blocks/weathered_cut_copper.png',
 cutCopper: 'blocks/cut_copper.png',
 andesite: 'blocks/stone_andesite.png',
 mangrove: 'blocks/mangrove_planks.png',
 whiteWool: 'blocks/wool_colored_white.png',
 blackWool: 'blocks/wool_colored_black.png',
 lightGrayWool: 'blocks/wool_colored_silver.png',
 blueIce: 'blocks/blue_ice.png',
 packedIce: 'blocks/ice_packed.png',
 snow: 'blocks/snow.png',
 brownGlass: 'blocks/glass_brown.png',
 clearGlass: 'blocks/glass.png',
 tintedGlass: 'blocks/tinted_glass.png',
 lightGrayGlass: 'blocks/glass_silver.png',
 pinkGlass: 'blocks/glass_pink.png',
 whiteGlass: 'blocks/glass_white.png',
 redGlass: 'blocks/glass_red.png',
 orangeGlass: 'blocks/glass_orange.png',
 magentaGlass: 'blocks/glass_magenta.png',
 purpleGlass: 'blocks/glass_purple.png',
 yellowGlass: 'blocks/glass_yellow.png',
 ironBars: 'blocks/iron_bars.png',
 copperBars: 'blocks/copper_bars.png',
 exposedCopperBars: 'blocks/exposed_copper_bars.png',
 weatheredCopperBars: 'blocks/weathered_copper_bars.png',
 oxidizedCopperBars: 'blocks/oxidized_copper_bars.png',
 whiteCandle: 'blocks/candles/white_candle.png',
 whiteCandleLit: 'blocks/candles/white_candle_lit.png',
 lightGrayCandle: 'blocks/candles/light_gray_candle.png',
 lightGrayCandleLit: 'blocks/candles/light_gray_candle_lit.png',
 seaPickle: 'blocks/sea_pickle.png',
 glowLichen: 'blocks/glow_lichen.png',
 paleOakShelf: 'blocks/pale_oak_shelf.png',
 glowstone: 'blocks/glowstone.png',
 ladder: 'blocks/ladder.png',
 barrelSide: 'blocks/barrel_side.png',
 barrelTop: 'blocks/barrel_top.png',
 barrelTopOpen: 'blocks/barrel_top_open.png',
 barrelBottom: 'blocks/barrel_bottom.png',
};

const CUT_KEYS = new Set([
 'stem', 'leaf', 'smallLeaf', 'fence', 'gate', 'trapdoor',
 'spruceTrapdoor', 'darkOakTrapdoor', 'oakTrapdoor', 'crimsonTrapdoor',
 'spruceDoorLower', 'spruceDoorUpper', 'darkOakDoorLower', 'darkOakDoorUpper',
 'crimsonDoorLower', 'crimsonDoorUpper', 'ladder',
 'chain1', 'chain2', 'copperChain1', 'copperChain2',
 'exposedCopperChain1', 'exposedCopperChain2', 'weatheredCopperChain1', 'weatheredCopperChain2',
 'oxidizedCopperChain1', 'oxidizedCopperChain2',
 'ironBars', 'copperBars', 'exposedCopperBars', 'weatheredCopperBars', 'oxidizedCopperBars',
 'scaffold', 'scaffoldTop', 'scaffoldBottom', 'torch',
 'bell', 'bellTop', 'bellBottom',
 'lantern', 'soulLantern', 'copperLantern', 'exposedCopperLantern', 'weatheredCopperLantern', 'oxidizedCopperLantern',
 'whiteCandle', 'whiteCandleLit', 'lightGrayCandle', 'lightGrayCandleLit',
 'seaPickle', 'glowLichen',
 ...FARM_CUT_KEYS,
]);

const GLASS_KEYS = new Set([
 'brownGlass', 'clearGlass', 'tintedGlass', 'lightGrayGlass', 'pinkGlass',
 'whiteGlass', 'redGlass', 'orangeGlass', 'magentaGlass', 'purpleGlass', 'yellowGlass',
 ...FARM_GLASS_KEYS,
]);

const ITEM_ICON_FILES = {
 ...FARM_ITEM_ICON_FILES,
 lantern: 'items/lantern.png',
 soul_lantern: 'items/soul_lantern.png',
 copper_lantern: 'items/copper_lantern.png',
 exposed_copper_lantern: 'items/exposed_copper_lantern.png',
 weathered_copper_lantern: 'items/weathered_copper_lantern.png',
 oxidized_copper_lantern: 'items/oxidized_copper_lantern.png',
 iron_chain: 'items/chain.png',
 copper_chain: 'items/copper_chain.png',
 exposed_copper_chain: 'items/exposed_copper_chain.png',
 weathered_copper_chain: 'items/weathered_copper_chain.png',
 oxidized_copper_chain: 'items/oxidized_copper_chain.png',
 bell: 'items/villagebell.png',
 crimson_door: 'items/crimson_door.png',
 sea_pickle: 'items/sea_pickle.png',
 white_candle: 'items/candles/white_candle.png',
 light_gray_candle: 'items/candles/light_gray_candle.png',
};

const LANTERN_MASK_KEYS = new Set([
 'lantern', 'soulLantern', 'copperLantern',
 'exposedCopperLantern', 'weatheredCopperLantern', 'oxidizedCopperLantern',
]);

const FULL_EMISSIVE_SPECS = {
 shroom: { color: '#ffd29a', intensity: 0.2 },
 froglight: { color: '#ffe4a6', intensity: 0.3 },
 froglightTop: { color: '#ffe4a6', intensity: 0.3 },
 pearlescentFroglight: { color: '#ffe4a6', intensity: 0.3 },
 pearlescentFroglightTop: { color: '#ffe4a6', intensity: 0.3 },
 glowstone: { color: '#ffe4a6', intensity: 0.3 },
 glowLichen: { color: '#9be8d0', intensity: 0.22 },
 whiteCandleLit: { color: '#ffbb66', intensity: 0.25 },
 lightGrayCandleLit: { color: '#ffbb66', intensity: 0.25 },
 ...FARM_EMISSIVE_SPECS,
};

const NIGHT_EMISSIVE_KEYS = [
 'froglight', 'froglightTop', 'pearlescentFroglight', 'pearlescentFroglightTop',
 'glowLichen', 'whiteCandleLit', 'lightGrayCandleLit',
 ...FARM_NIGHT_EMISSIVE_KEYS,
];

const V = {
 north: new T.Vector3(0, 0, -1),
 south: new T.Vector3(0, 0, 1),
 east: new T.Vector3(1, 0, 0),
 west: new T.Vector3(-1, 0, 0),
 up: new T.Vector3(0, 1, 0),
 down: new T.Vector3(0, -1, 0),
};

const LOG_MAP = {
 ...FARM_LOG_MAP,
 bamboo_block: ['log', 'logTop'],
 stripped_bamboo_block: ['stripped', 'strippedTop'],
 stripped_birch_log: ['birchLog', 'birchLogTop'],
 ochre_froglight: ['froglight', 'froglightTop'],
 pearlescent_froglight: ['pearlescentFroglight', 'pearlescentFroglightTop'],
 spruce_log: ['spruceLog', 'spruceLogTop'],
 stripped_spruce_log: ['strippedSpruce', 'strippedSpruceTop'],
 dark_oak_log: ['darkOakLog', 'darkOakLogTop'],
 stripped_dark_oak_log: ['strippedDarkOak', 'strippedDarkOakTop'],
 oak_log: ['oakLog', 'oakLogTop'],
 stripped_oak_log: ['strippedOak', 'strippedOakTop'],
 stripped_crimson_stem: ['strippedCrimson', 'strippedCrimsonTop'],
 stripped_crimson_hyphae: ['strippedCrimson', 'strippedCrimson'],
};

const DOOR_MAP = {
 spruce_door: ['spruceDoorLower', 'spruceDoorUpper'],
 dark_oak_door: ['darkOakDoorLower', 'darkOakDoorUpper'],
 crimson_door: ['crimsonDoorLower', 'crimsonDoorUpper'],
};

const BARS_MAP = {
 iron_bars: 'ironBars',
 copper_bars: 'copperBars',
 exposed_copper_bars: 'exposedCopperBars',
 weathered_copper_bars: 'weatheredCopperBars',
 oxidized_copper_bars: 'oxidizedCopperBars',
};

const CHAIN_MAP = {
 iron_chain: ['chain1', 'chain2'],
 copper_chain: ['copperChain1', 'copperChain2'],
 exposed_copper_chain: ['exposedCopperChain1', 'exposedCopperChain2'],
 weathered_copper_chain: ['weatheredCopperChain1', 'weatheredCopperChain2'],
 oxidized_copper_chain: ['oxidizedCopperChain1', 'oxidizedCopperChain2'],
};

const LANTERN_MAP = {
 lantern: 'lantern',
 soul_lantern: 'soulLantern',
 copper_lantern: 'copperLantern',
 exposed_copper_lantern: 'exposedCopperLantern',
 weathered_copper_lantern: 'weatheredCopperLantern',
 oxidized_copper_lantern: 'oxidizedCopperLantern',
};

const unwax = n => n.replace(/^waxed_/, '');

const keyOf = n =>
 n.includes('mud') ? 'mud' :
 n.includes('birch') ? 'birch' :
 n.includes('mosaic') ? 'mosaic' :
 n.includes('dark_oak') ? 'darkOak' :
 n.includes('spruce') ? 'spruce' :
 n.includes('crimson') ? 'crimson' :
 n.includes('red_nether') ? 'redNether' :
 n.includes('chiseled_nether') ? 'chiseledNether' :
 n.includes('nether_brick') ? 'netherBricks' :
 n.includes('chiseled_polished_blackstone') ? 'chiseledPolishedBlackstone' :
 n.includes('polished_blackstone') ? 'polishedBlackstoneBricks' :
 n.includes('oxidized_cut_copper') ? 'oxCopper' :
 n.includes('weathered_cut_copper') ? 'weatheredCopper' :
 n.includes('cut_copper') ? 'cutCopper' :
 n.includes('andesite') ? 'andesite' :
 n.includes('mangrove') ? 'mangrove' :
 n.includes('white_wool') ? 'whiteWool' :
 (n.includes('black_wool') || n === 'black_carpet') ? 'blackWool' :
 n.includes('light_gray_wool') ? 'lightGrayWool' :
 n.includes('blue_ice') ? 'blueIce' :
 n.includes('packed_ice') ? 'packedIce' :
 n.includes('snow') ? 'snow' :
 (n === 'glass' || n === 'glass_pane') ? 'clearGlass' :
 n.includes('brown_stained_glass') ? 'brownGlass' :
 n.includes('tinted_glass') ? 'tintedGlass' :
 n.includes('light_gray_stained_glass') ? 'lightGrayGlass' :
 n.includes('pink_stained_glass') ? 'pinkGlass' :
 n.includes('white_stained_glass') ? 'whiteGlass' :
 n.includes('red_stained_glass') ? 'redGlass' :
 n.includes('orange_stained_glass') ? 'orangeGlass' :
 n.includes('magenta_stained_glass') ? 'magentaGlass' :
 n.includes('purple_stained_glass') ? 'purpleGlass' :
 n.includes('yellow_stained_glass') ? 'yellowGlass' :
 n === 'glowstone' ? 'glowstone' :
 (farmKeyOf(n) || (n.includes('oak') ? 'wood' : 'bamboo'));

const NIGHT_LIGHT_LUT = new Float64Array(31);
for (let l = 1; l <= 30; l++) NIGHT_LIGHT_LUT[l] = Math.pow(0.65, (30 - l) / 2);

const _rotMat = new T.Matrix4();
const _rotQuat = new T.Quaternion();
const _rotAxisX = new T.Vector3(1, 0, 0);
const _upVec = new T.Vector3();

function stableStateKey(states) {
 if (!states) return '';
 const keys = Object.keys(states);
 if (!keys.length) return '';
 if (keys.length === 1) return keys[0] + '=' + states[keys[0]];
 keys.sort();
 let s = '';
 for (let i = 0; i < keys.length; i++) s += (i ? '|' : '') + keys[i] + '=' + states[keys[i]];
 return s;
}

function extractGroupSlice(g, start, count) {
 const srcIdx = g.index.array;
 const pos = g.attributes.position.array;
 const nrm = g.attributes.normal.array;
 const uv = g.attributes.uv.array;
 const remap = new Map();
 const vIds = [];
 const indices = new Uint16Array(count);
 for (let i = 0; i < count; i++) {
  const orig = srcIdx[start + i];
  let mapped = remap.get(orig);
  if (mapped === undefined) {
   mapped = vIds.length;
   remap.set(orig, mapped);
   vIds.push(orig);
  }
  indices[i] = mapped;
 }
 const vCount = vIds.length;
 const positions = new Float32Array(vCount * 3);
 const normals = new Float32Array(vCount * 3);
 const uvs = new Float32Array(vCount * 2);
 for (let i = 0; i < vCount; i++) {
  const o = vIds[i];
  const o3 = o * 3, i3 = i * 3;
  positions[i3] = pos[o3];
  positions[i3 + 1] = pos[o3 + 1];
  positions[i3 + 2] = pos[o3 + 2];
  normals[i3] = nrm[o3];
  normals[i3 + 1] = nrm[o3 + 1];
  normals[i3 + 2] = nrm[o3 + 2];
  const o2 = o * 2, i2 = i * 2;
  uvs[i2] = uv[o2];
  uvs[i2 + 1] = uv[o2 + 1];
 }
 return { positions, normals, uvs, indices, vCount };
}

export async function createBlockRenderer(blocks, scene) {
 const textureFiles = { ...TEXTURE_FILES };
 const textureAliases = { ...FARM_TEXTURE_ALIASES };
 const materialTints = { ...FARM_MATERIAL_TINTS };
 const cutKeys = new Set(CUT_KEYS);
 const glassKeys = new Set(GLASS_KEYS);
 const emissiveSpecs = { ...FULL_EMISSIVE_SPECS };
 const textures = {};
 const materials = {};
 const failures = [];
 const alphas = new Map();
 const images = {};
 const extraTextures = [];
 const nightAdaptation = { value: 0 };
 const pendingTextures = new Map();
 const icons = {};

 const textureLoader = new T.TextureLoader();
 let tgaLoader = null;

 function box(bounds, keys, rects, uvScale = 16) {
  const [x0, y0, z0, x1, y1, z1] = bounds;
  const g = new T.BoxGeometry((x1 - x0) / 16, (y1 - y0) / 16, (z1 - z0) / 16);
  g.translate((x0 + x1) / 32, (y0 + y1) / 32, (z0 + z1) / 32);
  const uv = g.attributes.uv;
  const defaults = [
   [16 - z1, 16 - y1, 16 - z0, 16 - y0],
   [z0, 16 - y1, z1, 16 - y0],
   [x0, z0, x1, z1],
   [x0, 16 - z1, x1, 16 - z0],
   [x0, 16 - y1, x1, 16 - y0],
   [16 - x1, 16 - y1, 16 - x0, 16 - y0],
  ];
  for (let f = 0; f < 6; f++) {
   const r = rects?.[f] || defaults[f];
   for (let j = f * 4; j < f * 4 + 4; j++) {
    uv.setXY(j, (r[0] + uv.getX(j) * (r[2] - r[0])) / uvScale, 1 - (r[1] + (1 - uv.getY(j)) * (r[3] - r[1])) / uvScale);
   }
  }
  const isFullBox = x0 === 0 && y0 === 0 && z0 === 0 && x1 === 16 && y1 === 16 && z1 === 16;
  return { g, keys: Array.isArray(keys) ? keys : Array(6).fill(keys), isFullBox };
 }

 function plane(w, h, rect, angle, center, key) {
  const g = new T.PlaneGeometry(w / 16, h / 16);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
   uv.setXY(i, (rect[0] + uv.getX(i) * (rect[2] - rect[0])) / 16, 1 - (rect[1] + (1 - uv.getY(i)) * (rect[3] - rect[1])) / 16);
  }
  g.rotateY(angle);
  g.translate(...center);
  g.addGroup(0, g.index.count, 0);
  return { g, keys: [key], isFullBox: false };
 }

 function rotate(partsList, axis, angle) {
  _rotMat.makeRotationAxis(axis, angle);
  for (const p of partsList) {
   p.g.translate(-0.5, -0.5, -0.5);
   p.g.applyMatrix4(_rotMat);
   p.g.translate(0.5, 0.5, 0.5);
  }
  return partsList;
 }

 function orient(partsList, dir, from = 'south') {
  _rotQuat.setFromUnitVectors(V[from], V[dir] || V[from]);
  _rotMat.makeRotationFromQuaternion(_rotQuat);
  for (const p of partsList) {
   p.g.translate(-0.5, -0.5, -0.5);
   p.g.applyMatrix4(_rotMat);
   p.g.translate(0.5, 0.5, 0.5);
  }
  return partsList;
 }

 function tiltTorch(outList, d) {
  const dir = V[d];
  if (!dir) return;
  _upVec.set(-dir.x * 0.5, 1, -dir.z * 0.5).normalize();
  _rotQuat.setFromUnitVectors(V.up, _upVec);
  for (const p of outList) {
   p.g.translate(-0.5, -0.5, -0.5);
   p.g.applyQuaternion(_rotQuat);
   p.g.translate(0.5 + dir.x * 0.3, 0.7, 0.5 + dir.z * 0.3);
  }
 }

 const _axisY = new T.Vector3(0, 1, 0);
 let wireCoordMap = null;
 let wireOpaqueSet = null;
 function wireMaskFor(b) {
  if (!wireCoordMap || b.name !== 'minecraft:redstone_wire') return 0;
  return computeWireMask(
   b,
   (x, y, z) => wireCoordMap.get(`${x},${y},${z}`),
   (x, y, z) => wireOpaqueSet.has(`${x},${y},${z}`)
  );
 }
 const CHEST_RIGHT_VEC = { south: [1, 0], north: [-1, 0], east: [0, -1], west: [0, 1] };
 function isMergeableChest(name) {
  return name === 'minecraft:chest' || name === 'minecraft:trapped_chest' || name.endsWith('copper_chest');
 }
 function chestPairFor(b) {
  if (!wireCoordMap || !isMergeableChest(b.name)) return 'single';
  const dir = b.states?.['minecraft:cardinal_direction'] || 'south';
  const [dx, dz] = CHEST_RIGHT_VEC[dir] || [1, 0];
  const rightNeighbor = wireCoordMap.get(`${b.x + dx},${b.y},${b.z + dz}`);
  if (rightNeighbor && rightNeighbor.name === b.name && (rightNeighbor.states?.['minecraft:cardinal_direction'] || 'south') === dir) {
   return 'left';
  }
  const leftNeighbor = wireCoordMap.get(`${b.x - dx},${b.y},${b.z - dz}`);
  if (leftNeighbor && leftNeighbor.name === b.name && (leftNeighbor.states?.['minecraft:cardinal_direction'] || 'south') === dir) {
   return 'right';
  }
  return 'single';
 }

 function parts(b, extra = {}) {
  const n = b.name.split(':')[1], uw = unwax(n), s = b.states || {}, out = [], key = keyOf(n);
  const add = (bounds, k = key, uv, uvScale = 16) => out.push(box(bounds, k, uv, uvScale));
  const resolvedExtra = { ...extra };
  if (resolvedExtra.wireMask === undefined && b.name === 'minecraft:redstone_wire') {
   resolvedExtra.wireMask = wireMaskFor(b);
  }
  if (resolvedExtra.chestPair === undefined && isMergeableChest(b.name)) {
   resolvedExtra.chestPair = chestPairFor(b);
  }
  const farmHelpers = { box, plane, rotate, orient, out, PlaneGeometry: T.PlaneGeometry, axisX: _rotAxisX, axisY: _axisY, tiltTorch };
  if (buildFarmPart(b, farmHelpers, resolvedExtra)) {
   if (b.waterlogged) out.push(box([0, 0, 0, 16, 14, 16], 'water'));
   return out;
  }
  const built = (() => {
  if (LOG_MAP[n]) {
   const [side, top] = LOG_MAP[n];
   add([0, 0, 0, 16, 16, 16], [side, side, top, top, side, side]);
   return orient(out, s.pillar_axis === 'x' ? 'east' : s.pillar_axis === 'z' ? 'south' : 'up', 'up');
  }
  if (n === 'bamboo') {
   const half = s.bamboo_stalk_thickness === 'thin' ? 1 : 1.5;
   const side = [0, 0, half * 2, 16], cap = [0, 0, half * 2, half * 2];
   add([8 - half, 0, 8 - half, 8 + half, 16, 8 + half], 'stem', [side, side, cap, cap, side, side]);
   const leaf = s.bamboo_leaf_size === 'large_leaves' ? 'leaf' : s.bamboo_leaf_size === 'small_leaves' ? 'smallLeaf' : null;
   if (leaf) {
    out.push(plane(16, 16, [0, 0, 16, 16], Math.PI / 4, [0.5, 0.5, 0.5], leaf), plane(16, 16, [0, 0, 16, 16], -Math.PI / 4, [0.5, 0.5, 0.5], leaf));
   }
   return out;
  }
  if (n === 'bamboo_fence_gate') {
   const drop = s.in_wall_bit ? 3 : 0;
   const postUV = [[0, 0, 2, 11], [0, 0, 2, 11], [0, 0, 2, 2], [0, 0, 2, 2], [8, 1, 10, 12], [8, 1, 10, 12]];
   const uprightUV = [[0, 0, 2, 9], [0, 0, 2, 9], [0, 0, 2, 2], [0, 0, 2, 2], [8, 1, 10, 10], [8, 1, 10, 10]];
   const railUV = [[0, 0, 2, 3], [0, 0, 2, 3], [3, 1, 7, 3], [3, 1, 7, 3], [3, 1, 7, 4], [3, 1, 7, 4]];
   add([0, 5 - drop, 7, 2, 16 - drop, 9], 'gate', postUV);
   add([14, 5 - drop, 7, 16, 16 - drop, 9], 'gate', postUV);
   if (s.open_bit) {
    for (const x of [0, 14]) {
     add([x, 6 - drop, 0, x + 2, 15 - drop, 2], 'gate', uprightUV);
     const uv = [railUV[4], railUV[5], railUV[2], railUV[3], railUV[0], railUV[1]];
     add([x, 6 - drop, 2, x + 2, 9 - drop, 6], 'gate', uv);
     add([x, 12 - drop, 2, x + 2, 15 - drop, 6], 'gate', uv);
    }
   } else {
    for (const x of [6, 8]) add([x, 6 - drop, 7, x + 2, 15 - drop, 9], 'gate', uprightUV);
    for (const x of [2, 10]) for (const y of [6, 12]) add([x, y - drop, 7, x + 4, y + 3 - drop, 9], 'gate', railUV);
   }
   return orient(out, s['minecraft:cardinal_direction'] ?? ['south', 'west', 'north', 'east'][s.direction ?? 0]);
  }
  if (n.endsWith('_stairs')) {
   for (const p of canonicalStairParts(s)) add(p);
   return orient(out, stairFacing[s.weirdo_direction ?? 0]);
  }
  if (n.endsWith('_slab') && !n.includes('double')) {
   const y = s['minecraft:vertical_half'] === 'top' ? 8 : 0;
   add([0, y, 0, 16, y + 8, 16]);
   return out;
  }
  if (n.endsWith('_carpet')) { add([0, 0, 0, 16, 1, 16], key); return out; }
  if (n.endsWith('_trapdoor') || n === 'trapdoor') {
   const tKey = { bamboo_trapdoor: 'trapdoor', spruce_trapdoor: 'spruceTrapdoor', dark_oak_trapdoor: 'darkOakTrapdoor', crimson_trapdoor: 'crimsonTrapdoor', trapdoor: 'oakTrapdoor' }[n] || 'trapdoor';
   const full = [0, 0, 16, 16], edge = [0, 0, 16, 3];
   if (s.open_bit) add([0, 0, 13, 16, 16, 16], tKey, [[0, 0, 3, 16], [0, 0, 3, 16], edge, edge, full, full]);
   else { const y = s.upside_down_bit ? 13 : 0; add([0, y, 0, 16, y + 3, 16], tKey, [edge, edge, full, full, edge, edge]); }
   return orient(out, ['west', 'east', 'north', 'south'][s.direction ?? 0]);
  }
  if (n === 'bamboo_fence' || n === 'spruce_fence' || n === 'dark_oak_fence' || n === 'crimson_fence') {
   const fKey = n === 'bamboo_fence' ? 'fence' : n === 'dark_oak_fence' ? 'darkOak' : n === 'crimson_fence' ? 'crimson' : 'spruce';
   const side = [0, 0, 4, 16], cap = [4, 0, 8, 4];
   add([6, 0, 6, 10, 16, 10], fKey, [side, side, cap, cap, side, side]);
   const railUV = [[4, 4, 12, 7], [4, 4, 12, 7], [0, 0, 2, 8], [0, 0, 2, 8], [0, 0, 2, 3], [0, 0, 2, 3]];
   for (const dir of ['north', 'south', 'west', 'east']) {
    if (s['minecraft:connection_' + dir]) {
     const ps = [box([7, 6, 8, 9, 9, 16], fKey, railUV), box([7, 12, 8, 9, 15, 16], fKey, railUV)];
     out.push(...orient(ps, dir));
    }
   }
   return out;
  }
  if (BARS_MAP[uw]) {
   const bKey = BARS_MAP[uw], dirs = ['north', 'south', 'west', 'east'].filter(d => s['minecraft:connection_' + d]);
   if (!dirs.length) {
    out.push(plane(3, 16, [7, 0, 10, 16], Math.PI / 4, [0.5, 0.5, 0.5], bKey), plane(3, 16, [7, 0, 10, 16], -Math.PI / 4, [0.5, 0.5, 0.5], bKey));
    return out;
   }
   for (const dir of dirs) out.push(...orient([plane(8, 16, [0, 0, 8, 16], Math.PI / 2, [0.5, 0.5, 12 / 16], bKey)], dir));
   return out;
  }
  if (n === 'glass_pane' || n.endsWith('_stained_glass_pane')) {
   const dirs = ['north', 'south', 'west', 'east'].filter(d => s['minecraft:connection_' + d]);
   add([7, 0, 7, 9, 16, 9], key);
   for (const dir of dirs) out.push(...orient([box([7, 0, 8, 9, 16, 16], key)], dir));
   return out;
  }
  if (n === 'pale_oak_shelf') { add([0, 0, 0, 16, 16, 5], 'paleOakShelf'); return orient(out, s['minecraft:cardinal_direction'] || 'south'); }
  if (n === 'snow_layer') { const h = 2 * ((s.height ?? 0) + 1); add([0, 0, 0, 16, h, 16], 'snow'); return out; }
  if (n === 'ladder') {
   const d = s.facing_direction ?? 2;
   const dir = { 2: 'north', 3: 'south', 4: 'west', 5: 'east' }[d] || 'north';
   out.push(plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 15 / 16], 'ladder'));
   return orient(out, dir, 'south');
  }
  if (n === 'barrel') {
   add([0, 0, 0, 16, 16, 16], ['barrelSide', 'barrelSide', 'barrelSide', 'barrelSide', 'barrelBottom', s.open_bit ? 'barrelTopOpen' : 'barrelTop']);
   const d = s.facing_direction ?? 1;
   if (d === 0) return orient(out, 'north', 'south');
   if (d === 1) return rotate(out, _rotAxisX, -Math.PI / 2);
   return orient(out, { 2: 'north', 3: 'south', 4: 'west', 5: 'east' }[d] || 'south');
  }
  if (DOOR_MAP[n]) {
   const [lo, hi] = DOOR_MAP[n], dKey = s.upper_block_bit ? hi : lo;
   const full = [0, 0, 16, 16], edge = [0, 0, 3, 16], cap = [0, 0, 16, 3];
   const bds = s.open_bit ? (s.door_hinge_bit ? [13, 0, 0, 16, 16, 16] : [0, 0, 0, 3, 16, 16]) : [0, 0, 0, 16, 16, 3];
   add(bds, dKey, s.open_bit ? [full, full, cap, cap, edge, edge] : [edge, edge, cap, cap, full, full]);
   return orient(out, s['minecraft:cardinal_direction'] || 'north', 'north');
  }
  if (n.endsWith('_wall')) {
   if (s.wall_post_bit) add([4, 0, 4, 12, 16, 12]);
   for (const dir of ['north', 'south', 'west', 'east']) {
    const v = s['wall_connection_type_' + dir];
    if (v && v !== 'none') out.push(...orient([box([5, 0, 8, 11, v === 'tall' ? 16 : 14, 16], key)], dir));
   }
   return out;
  }
  if (CHAIN_MAP[uw]) {
   const [c1, c2] = CHAIN_MAP[uw];
   out.push(plane(3, 16, [0, 0, 3, 16], Math.PI / 4, [0.5, 0.5, 0.5], c1), plane(3, 16, [0, 0, 3, 16], -Math.PI / 4, [0.5, 0.5, 0.5], c2));
   return orient(out, s.pillar_axis === 'x' ? 'east' : s.pillar_axis === 'z' ? 'south' : 'up', 'up');
  }
  if (LANTERN_MAP[uw]) {
   const lKey = LANTERN_MAP[uw], y = s.hanging ? 1 : 0, side = [0, 2, 6, 9], cap = [0, 9, 6, 15], neck = [1, 0, 5, 2], top = [1, 10, 5, 14];
   add([5, y, 5, 11, y + 7, 11], lKey, [side, side, cap, cap, side, side]);
   add([6, y + 7, 6, 10, y + 9, 10], lKey, [neck, neck, top, top, neck, neck]);
   out.push(plane(3, 6, [11, 6, 14, 12], Math.PI / 4, [0.5, (y + 12) / 16, 0.5], lKey), plane(3, 6, [11, 0, 14, 6], -Math.PI / 4, [0.5, (y + 12) / 16, 0.5], lKey));
   return out;
  }
  if (n === 'white_candle' || n === 'light_gray_candle') {
   const cnt = (s.candles ?? 0) + 1, lit = Boolean(s.lit);
   const cKey = n === 'light_gray_candle' ? (lit ? 'lightGrayCandleLit' : 'lightGrayCandle') : (lit ? 'whiteCandleLit' : 'whiteCandle');
   const wick = Array(6).fill([0, 5, 1, 6]), flame = Array(6).fill([2, 2, 14, 14]);
   const slots = [[[7, 0, 7, 6]], [[5, 0, 7, 6], [9, 0, 8, 5]], [[5, 0, 6, 6], [9, 0, 6, 5], [7, 0, 10, 4]], [[5, 0, 6, 6], [9, 0, 6, 5], [5, 0, 10, 4], [9, 0, 10, 3]]][cnt - 1];
   for (const [cx, y0, cz, h] of slots) {
    const sUV = [0, 14 - h, 2, 14], tUV = [0, 6, 2, 8];
    add([cx, y0, cz, cx + 2, y0 + h, cz + 2], cKey, [sUV, sUV, tUV, tUV, sUV, sUV]);
    add([cx + 0.6, y0 + h, cz + 0.6, cx + 1.4, y0 + h + 1, cz + 1.4], cKey, wick);
    if (lit) add([cx + 0.6, y0 + h + 1, cz + 0.6, cx + 1.4, y0 + h + 2, cz + 1.4], 'glowstone', flame);
   }
   return out;
  }
  if (n === 'sea_pickle') {
   const cnt = (s.cluster_count ?? 0) + 1, top = [4, 1, 8, 5], side = [4, 5, 8, 12];
   const slots = [[[6, 0, 6, 7]], [[4, 0, 5, 6], [9, 0, 8, 5]], [[4, 0, 5, 7], [9, 0, 5, 5], [6, 0, 9, 4]], [[4, 0, 4, 7], [9, 0, 4, 5], [4, 0, 9, 5], [9, 0, 9, 4]]][cnt - 1];
   for (const [px, y0, pz, h] of slots) add([px, y0, pz, px + 4, y0 + h, pz + 4], 'seaPickle', [side, side, top, top, side, side]);
   return out;
  }
  if (n === 'glow_lichen') {
   const bits = s.multi_face_direction_bits ?? 4;
   const addFace = rotX => rotX ? rotate([plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.5 - 0.49], 'glowLichen')], _rotAxisX, rotX) : plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.99], 'glowLichen');
   if (bits & 1) out.push(addFace(Math.PI / 2));
   if (bits & 2) out.push(addFace(-Math.PI / 2));
   if (bits & 4) out.push(plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.99], 'glowLichen'));
   if (bits & 8) out.push(...orient([plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.99], 'glowLichen')], 'west'));
   if (bits & 16) out.push(...orient([plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.99], 'glowLichen')], 'north'));
   if (bits & 32) out.push(...orient([plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.99], 'glowLichen')], 'east'));
   if (!out.length) out.push(plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.5], 'glowLichen'));
   return out;
  }
  if (n === 'torch') {
   add([7, 0, 7, 9, 10, 9], 'torch', [[7, 6, 9, 16], [7, 6, 9, 16], [7, 6, 9, 8], [7, 14, 9, 16], [7, 6, 9, 16], [7, 6, 9, 16]]);
   const d = s.torch_facing_direction;
   if (d && d !== 'top') tiltTorch(out, d);
   return out;
  }
  if (n === 'scaffolding') { add([0, 0, 0, 16, 16, 16], ['scaffold', 'scaffold', 'scaffoldTop', 'scaffoldBottom', 'scaffold', 'scaffold']); return out; }
  if (n === 'bell') {
   const face = [1, 0, 7, 7], top = [1, 1, 7, 7];
   add([5, 6, 5, 11, 13, 11], ['bell', 'bell', 'bellTop', 'bellBottom', 'bell', 'bell'], [face, face, top, top, face, face]);
   add([4, 4, 4, 12, 6, 12], ['bell', 'bell', 'bellTop', 'bellBottom', 'bell', 'bell'], [[0, 7, 8, 9], [0, 7, 8, 9], [0, 0, 8, 8], [0, 0, 8, 8], [0, 7, 8, 9], [0, 7, 8, 9]]);
   add([6, 13, 7, 10, 16, 9], 'wood');
   return orient(out, ['south', 'west', 'north', 'east'][s.direction ?? 0]);
  }
  add([0, 0, 0, 16, 16, 16], n === 'shroomlight' ? 'shroom' : key);
  return out;
  })();
  if (b.waterlogged) built.push(box([0, 0, 0, 16, 14, 16], 'water'));
  return built;
 }

 // --- Lazy texture & material registry (extensible for future Redstone blocks) ---
 function applyNightShader(mat) {
  mat.onBeforeCompile = shader => {
   shader.uniforms.nightAdaptation = nightAdaptation;
   shader.fragmentShader = 'uniform float nightAdaptation;\n' + shader.fragmentShader;
   shader.fragmentShader = shader.fragmentShader.replace(
    '#include <color_fragment>',
    `float nightLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(nightLuma),nightAdaptation);
 #include <color_fragment>`
   );
  };
  mat.customProgramCacheKey = () => 'night-adaptation-v1';
 }

 function attachEmissive(key, mat) {
  const texKey = textureAliases[key] || key;
  const tex = textures[texKey];
  const img = images[texKey];
  if (LANTERN_MASK_KEYS.has(key)) {
   const isSoul = key === 'soulLantern';
   const c = document.createElement('canvas');
   c.width = c.height = 16;
   const cx = c.getContext('2d');
   cx.drawImage(img, 0, 0);
   const px = cx.getImageData(0, 0, 16, 16);
   const p = px.data;
   for (let i = 0; i < p.length; i += 4) {
    const lit = isSoul ? (p[i + 2] > 130 && p[i + 1] > 100) : (p[i] > 150 && p[i + 1] > 65 && p[i] > p[i + 2] * 1.25);
    if (!lit) p[i] = p[i + 1] = p[i + 2] = 0;
   }
   cx.putImageData(px, 0, 0);
   const t = new T.CanvasTexture(c);
   t.colorSpace = T.SRGBColorSpace;
   t.magFilter = T.NearestFilter;
   extraTextures.push(t);
   mat.emissiveMap = t;
   mat.emissive.set(isSoul ? '#7ee8ff' : '#ffd29a');
   mat.emissiveIntensity = 0.5;
  } else if (key === 'torch') {
   const c = document.createElement('canvas');
   c.width = c.height = 16;
   const tc = c.getContext('2d');
   tc.drawImage(img, 0, 0);
   tc.clearRect(0, 9, 16, 7);
   const t = new T.CanvasTexture(c);
   t.colorSpace = T.SRGBColorSpace;
   t.magFilter = T.NearestFilter;
   extraTextures.push(t);
   mat.emissiveMap = t;
   mat.emissive.set('#ffad45');
   mat.emissiveIntensity = 0.15;
  } else if (emissiveSpecs[key]) {
   const spec = emissiveSpecs[key];
   mat.emissiveMap = tex;
   mat.emissive.set(spec.color);
   mat.emissiveIntensity = spec.intensity;
  }
 }

 async function ensureTexture(key) {
  if (textures[key]) return textures[key];
  let promise = pendingTextures.get(key);
  if (promise) return promise;
  const file = textureFiles[key];
  promise = (async () => {
   if (!file) {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const x = c.getContext('2d');
    x.fillStyle = '#bd9270';
    x.fillRect(0, 0, 16, 16);
    textures[key] = new T.CanvasTexture(c);
    images[key] = c;
    return textures[key];
   }
   try {
    let raw;
    if (file.endsWith('.tga')) {
     if (!tgaLoader) tgaLoader = new TGALoader();
     raw = await tgaLoader.loadAsync(ROOT + file);
    } else {
     raw = await textureLoader.loadAsync(ROOT + file);
    }
    const im = raw.image;
    const canvas = document.createElement('canvas');
    canvas.width = im.width;
    canvas.height = Math.min(im.width, im.height);
    const ctx = canvas.getContext('2d');
    if (im.data) {
     const full = document.createElement('canvas');
     full.width = im.width;
     full.height = im.height;
     full.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(im.data), im.width, im.height), 0, 0);
     ctx.drawImage(full, 0, 0);
    } else {
     ctx.drawImage(im, 0, 0);
    }
    const tx = new T.CanvasTexture(canvas);
    tx.colorSpace = T.SRGBColorSpace;
    tx.magFilter = T.NearestFilter;
    tx.minFilter = T.NearestMipmapLinearFilter;
    tx.anisotropy = 4;
    textures[key] = tx;
    images[key] = canvas;
    alphas.set(tx, ctx.getImageData(0, 0, canvas.width, canvas.height));
    raw.dispose();
    return tx;
   } catch {
    failures.push(file);
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const x = c.getContext('2d');
    x.fillStyle = '#bd9270';
    x.fillRect(0, 0, 16, 16);
    textures[key] = new T.CanvasTexture(c);
    images[key] = c;
    return textures[key];
   }
  })();
  pendingTextures.set(key, promise);
  return promise;
 }

 async function ensureMaterial(key) {
  if (materials[key]) return materials[key];
  const texKey = textureAliases[key] || key;
  const tx = await ensureTexture(texKey);
  if (materials[key]) return materials[key];
  const cut = cutKeys.has(key);
  const glass = glassKeys.has(key);
  const tint = materialTints[key];
  const mat = new T.MeshLambertMaterial({
   map: tx,
   color: tint ? new T.Color(tint) : 0xffffff,
   vertexColors: true,
   alphaTest: cut ? 0.5 : 0,
   side: cut || glass ? T.DoubleSide : T.FrontSide,
   transparent: glass,
   opacity: glass ? (key === 'water' ? 0.58 : 0.78) : 1,
   depthWrite: !glass,
  });
  applyNightShader(mat);
  attachEmissive(key, mat);
  materials[key] = mat;
  return mat;
 }

 async function ensureMaterials(keys) {
  await Promise.all([...keys].map(k => ensureMaterial(k)));
 }

 function registerAssets({ textures: extraFiles, aliases, tints, cut, glass, emissive } = {}) {
  if (extraFiles) Object.assign(textureFiles, extraFiles);
  if (aliases) Object.assign(textureAliases, aliases);
  if (tints) Object.assign(materialTints, tints);
  if (cut) for (const k of cut) cutKeys.add(k);
  if (glass) for (const k of glass) glassKeys.add(k);
  if (emissive) Object.assign(emissiveSpecs, emissive);
 }

 // --- Build unique (name, states) templates once ---
 const templateCache = new Map();
 const neededMaterialKeys = new Set();
 const uniqueBlockNames = new Map();

 function getTemplate(b, extra = {}) {
  const wireSuffix = b.name === 'minecraft:redstone_wire' && extra.wireMask !== undefined ? '|w=' + extra.wireMask : '';
  const chestSuffix = extra.chestPair && extra.chestPair !== 'single' ? '|cp=' + extra.chestPair : '';
  const wlSuffix = b.waterlogged ? '|wl=1' : '';
  const sig = b.name + '|' + stableStateKey(b.states) + wireSuffix + chestSuffix + wlSuffix;
  let tpl = templateCache.get(sig);
  if (tpl) return tpl;
  const partList = parts(b, extra);
  const isFullCube = partList.length === 1 && partList[0].isFullBox;
  let isOpaqueCube = isFullCube;
  if (isOpaqueCube) {
   for (const k of partList[0].keys) {
    if (cutKeys.has(k) || glassKeys.has(k)) {
     isOpaqueCube = false;
     break;
    }
   }
  }
  const slices = [];
  let solidMask = 0;
  const rayParts = [];
  for (const part of partList) {
   const g = part.g;
   g.computeBoundingBox();
   g.computeBoundingSphere();
   const isSolidPart = part.keys.every(k => !cutKeys.has(k) && (k === 'tintedGlass' || !glassKeys.has(k)));
   if (isSolidPart) {
    const a = g.boundingBox.min, c = g.boundingBox.max;
    for (let x = 0; x < 2; x++) {
     const px = (x + 0.5) / 2;
     if (px <= a.x + 1e-5 || px >= c.x - 1e-5) continue;
     for (let y = 0; y < 2; y++) {
      const py = (y + 0.5) / 2;
      if (py <= a.y + 1e-5 || py >= c.y - 1e-5) continue;
      for (let z = 0; z < 2; z++) {
       const pz = (z + 0.5) / 2;
       if (pz > a.z + 1e-5 && pz < c.z - 1e-5) {
        solidMask |= 1 << (x | (y << 1) | (z << 2));
       }
      }
     }
    }
   }
   const groups = g.groups.length ? g.groups : [{ start: 0, count: g.index.count, materialIndex: 0 }];
   for (const f of groups) {
    const key = part.keys[f.materialIndex] || part.keys[0];
    neededMaterialKeys.add(key);
    const slice = extractGroupSlice(g, f.start, f.count);
    let cullDir = null;
    if (isOpaqueCube && slice.normals.length >= 3) {
     cullDir = [Math.round(slice.normals[0]), Math.round(slice.normals[1]), Math.round(slice.normals[2])];
    }
    slices.push({ ...slice, key, cullDir });
   }
   rayParts.push({ g, keys: part.keys, materials: null });
  }
  tpl = { sig, slices, isFullCube, isOpaqueCube, solidMask, rayParts };
  templateCache.set(sig, tpl);
  return tpl;
 }

 const blockTemplates = new Array(blocks.length);
 const blockIndexMap = new Map();
 let needsNeighborPass = false;
 for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  blockIndexMap.set(b, i);
  if (!uniqueBlockNames.has(b.name)) uniqueBlockNames.set(b.name, b);
  if (b.name === 'minecraft:redstone_wire' || isMergeableChest(b.name)) needsNeighborPass = true;
  else blockTemplates[i] = getTemplate(b);
 }
 if (needsNeighborPass) {
  wireCoordMap = new Map();
  wireOpaqueSet = new Set();
  for (let i = 0; i < blocks.length; i++) {
   const b = blocks[i];
   const ck = `${b.x},${b.y},${b.z}`;
   wireCoordMap.set(ck, b);
   if (blockTemplates[i]?.isOpaqueCube) wireOpaqueSet.add(ck);
  }
  for (let i = 0; i < blocks.length; i++) {
   const b = blocks[i];
   if (b.name === 'minecraft:redstone_wire') {
    blockTemplates[i] = getTemplate(b, { wireMask: wireMaskFor(b) });
   } else if (isMergeableChest(b.name)) {
    blockTemplates[i] = getTemplate(b, { chestPair: chestPairFor(b) });
   }
  }
 }

 // Collect icon templates only for blocks without flat item icons.
 const iconEntries = [];
 for (const [name, sampleBlock] of uniqueBlockNames) {
  const shortId = name.split(':')[1];
  const unwaxedId = unwax(shortId);
  if (ITEM_ICON_FILES[shortId] || (shortId.startsWith('waxed_') && shortId.includes('copper_') && ITEM_ICON_FILES[unwaxedId])) {
   continue;
  }
  const sample = inventoryBlock(sampleBlock);
  const sampleParts = parts(sample, { wireMask: 0, chestPair: 'single' });
  for (const p of sampleParts) {
   for (const k of p.keys) neededMaterialKeys.add(k);
  }
  iconEntries.push({ name, parts: sampleParts });
 }

 // Determine which item icons actually appear in the model.
 const neededItemIcons = [];
 for (const [id, file] of Object.entries(ITEM_ICON_FILES)) {
  const fullName = 'minecraft:' + id;
  const waxedName = id.includes('copper_') ? 'minecraft:waxed_' + id : null;
  if (uniqueBlockNames.has(fullName) || (waxedName && uniqueBlockNames.has(waxedName))) {
   neededItemIcons.push([id, file]);
  }
 }

 // Load ONLY the textures and item icons required by this model in parallel.
 await Promise.all([
  ensureMaterials(neededMaterialKeys),
  ...neededItemIcons.map(async ([id, file]) => {
   try {
    const tx = await textureLoader.loadAsync(ROOT + file);
    const image = tx.image;
    const c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    c.getContext('2d').drawImage(image, 0, 0);
    const url = c.toDataURL();
    icons['minecraft:' + id] = url;
    if (id.includes('copper_')) icons['minecraft:waxed_' + id] = url;
    tx.dispose();
   } catch {
    failures.push(file);
   }
  }),
 ]);

 // Bind material arrays on cached rayParts.
 for (const tpl of templateCache.values()) {
  for (const rp of tpl.rayParts) {
   rp.materials = rp.keys.map(k => materials[k]);
  }
 }

 // --- Spatial lookup for opaque neighbor face culling ---
 let minX = Infinity, minY = Infinity, minZ = Infinity;
 let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
 for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  if (b.x < minX) minX = b.x;
  if (b.y < minY) minY = b.y;
  if (b.z < minZ) minZ = b.z;
  if (b.x > maxX) maxX = b.x;
  if (b.y > maxY) maxY = b.y;
  if (b.z > maxZ) maxZ = b.z;
 }
 const spanX = blocks.length ? maxX - minX + 1 : 1;
 const spanY = blocks.length ? maxY - minY + 1 : 1;
 const spanZ = blocks.length ? maxZ - minZ + 1 : 1;
 const opaqueGrid = new Int32Array(spanX * spanY * spanZ).fill(-1);
 const spanXY = spanX * spanY;
 for (let i = 0; i < blocks.length; i++) {
  if (!blockTemplates[i].isOpaqueCube) continue;
  const b = blocks[i];
  opaqueGrid[(b.x - minX) + (b.y - minY) * spanX + (b.z - minZ) * spanXY] = i;
 }

 function opaqueNeighborAt(x, y, z) {
  const lx = x - minX, ly = y - minY, lz = z - minZ;
  if (lx < 0 || ly < 0 || lz < 0 || lx >= spanX || ly >= spanY || lz >= spanZ) return -1;
  return opaqueGrid[lx + ly * spanX + lz * spanXY];
 }

 // --- Two-pass exact buffer packing per material batch (zero 6x cloning) ---
 const binMeta = new Map();
 for (let i = 0; i < blocks.length; i++) {
  const tpl = blockTemplates[i];
  for (let s = 0; s < tpl.slices.length; s++) {
   const slice = tpl.slices[s];
   let meta = binMeta.get(slice.key);
   if (!meta) {
    meta = { key: slice.key, vTotal: 0, iTotal: 0, sliceCount: 0 };
    binMeta.set(slice.key, meta);
   }
   meta.vTotal += slice.vCount;
   meta.iTotal += slice.indices.length;
   meta.sliceCount++;
  }
 }

 const binBuffers = new Map();
 for (const [key, meta] of binMeta) {
  binBuffers.set(key, {
   key,
   positions: new Float32Array(meta.vTotal * 3),
   normals: new Float32Array(meta.vTotal * 3),
   uvs: new Float32Array(meta.vTotal * 2),
   source: new Uint32Array(meta.iTotal),
   entries: new Array(meta.sliceCount),
   vCursor: 0,
   iCursor: 0,
   eCursor: 0,
  });
 }

 for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  const tpl = blockTemplates[i];
  const bx = b.x, by = b.y, bz = b.z;
  for (let s = 0; s < tpl.slices.length; s++) {
   const slice = tpl.slices[s];
   const buf = binBuffers.get(slice.key);
   const vStart = buf.vCursor;
   const iStart = buf.iCursor;
   const vCount = slice.vCount;
   const iCount = slice.indices.length;

   const sp = slice.positions, sn = slice.normals, su = slice.uvs, si = slice.indices;
   const dp = buf.positions, dn = buf.normals, du = buf.uvs, ds = buf.source;

   for (let v = 0; v < vCount; v++) {
    const s3 = v * 3, d3 = (vStart + v) * 3;
    dp[d3] = sp[s3] + bx;
    dp[d3 + 1] = sp[s3 + 1] + by;
    dp[d3 + 2] = sp[s3 + 2] + bz;
    dn[d3] = sn[s3];
    dn[d3 + 1] = sn[s3 + 1];
    dn[d3 + 2] = sn[s3 + 2];
    const s2 = v * 2, d2 = (vStart + v) * 2;
    du[d2] = su[s2];
    du[d2 + 1] = su[s2 + 1];
   }

   for (let k = 0; k < iCount; k++) {
    ds[iStart + k] = vStart + si[k];
   }

   const neighborIdx = slice.cullDir
    ? opaqueNeighborAt(bx + slice.cullDir[0], by + slice.cullDir[1], bz + slice.cullDir[2])
    : -1;

   buf.entries[buf.eCursor++] = { b, bIdx: i, neighborIdx, iStart, iCount, vStart, vCount };
   buf.vCursor += vCount;
   buf.iCursor += iCount;
  }
 }

 const batches = [];
 for (const buf of binBuffers.values()) {
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.BufferAttribute(buf.positions, 3));
  geometry.setAttribute('normal', new T.BufferAttribute(buf.normals, 3));
  geometry.setAttribute('uv', new T.BufferAttribute(buf.uvs, 2));

  const colors = new Float32Array(buf.vCursor * 3);
  colors.fill(1);
  const colorAttr = new T.BufferAttribute(colors, 3);
  colorAttr.setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('color', colorAttr);

  const activeIndices = new Uint32Array(buf.source.length);
  const indexAttr = new T.BufferAttribute(activeIndices, 1);
  indexAttr.setUsage(T.DynamicDrawUsage);
  geometry.setIndex(indexAttr);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const mesh = new T.Mesh(geometry, materials[buf.key]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = true;
  scene.add(mesh);

  const batch = {
   key: buf.key,
   mesh,
   source: buf.source,
   entries: buf.entries,
   activeRanges: [],
   triEnds: new Int32Array(buf.entries.length),
   entryBlocks: new Array(buf.entries.length),
   emittedEntries: 0,
   blockAtFace(faceIndex) {
    const n = this.emittedEntries;
    if (!n) return null;
    let lo = 0, hi = n - 1;
    while (lo < hi) {
     const mid = (lo + hi) >>> 1;
     if (faceIndex < this.triEnds[mid]) hi = mid;
     else lo = mid + 1;
    }
    return faceIndex < this.triEnds[lo] ? this.entryBlocks[lo] : null;
   },
  };
  mesh.userData.batch = batch;
  batches.push(batch);
 }

 const blockLight = createBlockLight(blocks, parts, materials, {
  solidMaskOf: b => blockTemplates[blockIndexMap.get(b)].solidMask,
 });
 let night = false;
 const visibleFlags = new Uint8Array(blocks.length);

 function colorize() {
  if (night) blockLight.ensurePropagated();
  const { field, occupied, min: lMin, sx, sy, sz, strideY, strideZ, scale } = blockLight.grid;
  const minX0 = lMin[0], minY0 = lMin[1], minZ0 = lMin[2];

  for (let bi = 0; bi < batches.length; bi++) {
   const batch = batches[bi];
   if (!batch.mesh.visible) continue;
   const attrs = batch.mesh.geometry.attributes;
   const pArr = attrs.position.array;
   const nArr = attrs.normal.array;
   const cAttr = attrs.color;
   const cArr = cAttr.array;
   const ranges = batch.activeRanges;

   for (let r = 0; r < ranges.length; r += 2) {
    const vStart = ranges[r];
    const vEnd = ranges[r + 1];
    for (let i = vStart; i < vEnd; i++) {
     const i3 = i * 3;
     const nx = nArr[i3], ny = nArr[i3 + 1], nz = nArr[i3 + 2];
     const sxPos = pArr[i3] + nx * 0.035;
     const syPos = pArr[i3 + 1] + ny * 0.035;
     const szPos = pArr[i3 + 2] + nz * 0.035;

     const ax = nx < 0 ? -nx : nx;
     const ay = ny < 0 ? -ny : ny;
     const az = nz < 0 ? -nz : nz;

     let blocked = 0;
     if (ax >= ay && ax >= az) {
      const ix = Math.floor((sxPos - minX0) * scale);
      if (ix >= 0 && ix < sx) {
       const baseX = ix;
       for (let dy = -1; dy <= 1; dy += 2) {
        const iy = Math.floor((syPos + dy * 0.15 - minY0) * scale);
        if (iy < 0 || iy >= sy) continue;
        const baseXY = baseX + iy * strideY;
        for (let dz = -1; dz <= 1; dz += 2) {
         const iz = Math.floor((szPos + dz * 0.15 - minZ0) * scale);
         if (iz >= 0 && iz < sz && occupied[baseXY + iz * strideZ] === 1) blocked++;
        }
       }
      }
     } else if (ay >= az) {
      const iy = Math.floor((syPos - minY0) * scale);
      if (iy >= 0 && iy < sy) {
       const baseY = iy * strideY;
       for (let dx = -1; dx <= 1; dx += 2) {
        const ix = Math.floor((sxPos + dx * 0.15 - minX0) * scale);
        if (ix < 0 || ix >= sx) continue;
        const baseXY = ix + baseY;
        for (let dz = -1; dz <= 1; dz += 2) {
         const iz = Math.floor((szPos + dz * 0.15 - minZ0) * scale);
         if (iz >= 0 && iz < sz && occupied[baseXY + iz * strideZ] === 1) blocked++;
        }
       }
      }
     } else {
      const iz = Math.floor((szPos - minZ0) * scale);
      if (iz >= 0 && iz < sz) {
       const baseZ = iz * strideZ;
       for (let dx = -1; dx <= 1; dx += 2) {
        const ix = Math.floor((sxPos + dx * 0.15 - minX0) * scale);
        if (ix < 0 || ix >= sx) continue;
        const baseXZ = ix + baseZ;
        for (let dy = -1; dy <= 1; dy += 2) {
         const iy = Math.floor((syPos + dy * 0.15 - minY0) * scale);
         if (iy >= 0 && iy < sy && occupied[baseXZ + iy * strideY] === 1) blocked++;
        }
       }
      }
     }

     const ao = 1 - blocked * 0.055;
     if (!night) {
      cArr[i3] = ao;
      cArr[i3 + 1] = ao;
      cArr[i3 + 2] = ao;
     } else {
      const lix = Math.floor((sxPos - minX0) * scale);
      const liy = Math.floor((syPos - minY0) * scale);
      const liz = Math.floor((szPos - minZ0) * scale);
      const level = (lix < 0 || liy < 0 || liz < 0 || lix >= sx || liy >= sy || liz >= sz)
       ? 0
       : field[lix + liy * strideY + liz * strideZ];
      const light = level ? NIGHT_LIGHT_LUT[level] : 0;
      const cool = light < 1 / 3 ? 1 - light * 3 : 0;
      cArr[i3] = ao * (0.92 - cool * 0.1 + light * 3.4);
      cArr[i3 + 1] = ao * (0.98 + light * 1.7);
      cArr[i3 + 2] = ao * (1.14 + cool * 0.18 + light * 0.38);
     }
    }
   }
   cAttr.needsUpdate = true;
  }
 }

 function setEnvironment(value) {
  night = value === 'night';
  nightAdaptation.value = night ? 0.12 : 0;
  for (const key of NIGHT_EMISSIVE_KEYS) {
   if (materials[key]) materials[key].emissiveIntensity = night ? 0.65 : 0.3;
  }
  colorize();
 }

 function filter(accept) {
  blockLight.bake(accept, { propagate: night });
  for (let i = 0; i < blocks.length; i++) {
   visibleFlags[i] = accept(blocks[i]) ? 1 : 0;
  }

  for (let bi = 0; bi < batches.length; bi++) {
   const b = batches[bi];
   const indexAttr = b.mesh.geometry.index;
   const dstArr = indexAttr.array;
   const srcArr = b.source;
   const entries = b.entries;
   const ranges = b.activeRanges;
   ranges.length = 0;

   let dst = 0;
   let emitted = 0;
   let rangeStart = -1;
   let rangeEnd = -1;

   for (let ei = 0; ei < entries.length; ei++) {
    const entry = entries[ei];
    if (!visibleFlags[entry.bIdx]) continue;
    if (entry.neighborIdx >= 0 && visibleFlags[entry.neighborIdx]) continue;

    const iStart = entry.iStart;
    const iCount = entry.iCount;
    dstArr.set(srcArr.subarray(iStart, iStart + iCount), dst);
    dst += iCount;

    b.triEnds[emitted] = dst / 3;
    b.entryBlocks[emitted] = entry.b;
    emitted++;

    if (rangeStart < 0) {
     rangeStart = entry.vStart;
     rangeEnd = entry.vStart + entry.vCount;
    } else if (entry.vStart === rangeEnd) {
     rangeEnd += entry.vCount;
    } else {
     ranges.push(rangeStart, rangeEnd);
     rangeStart = entry.vStart;
     rangeEnd = entry.vStart + entry.vCount;
    }
   }
   if (rangeStart >= 0) ranges.push(rangeStart, rangeEnd);

   b.emittedEntries = emitted;
   b.mesh.geometry.setDrawRange(0, dst);
   b.mesh.visible = dst > 0;
   if (dst > 0) {
    indexAttr.clearUpdateRanges();
    indexAttr.addUpdateRange(0, dst);
    indexAttr.needsUpdate = true;
   }
  }
  colorize();
 }

 function alphaHit(hit) {
  let m = hit.object.material;
  if (Array.isArray(m)) m = m[hit.face?.materialIndex ?? 0];
  if (!m || !m.alphaTest || !hit.uv) return true;
  const data = alphas.get(m.map);
  if (!data) return true;
  const u = Math.min(data.width - 1, Math.max(0, Math.floor(hit.uv.x * data.width)));
  const v = Math.min(data.height - 1, Math.max(0, Math.floor((1 - hit.uv.y) * data.height)));
  return data.data[(v * data.width + u) * 4 + 3] >= m.alphaTest;
 }

 // Fast single-block raycast for DDA voxel picking (preserves exact geometry & alphaHit).
 const _probeMesh = new T.Mesh();
 _probeMesh.matrixAutoUpdate = false;
 const _probeHits = [];

 function raycastBlock(raycaster, b) {
  const idx = blockIndexMap.get(b);
  if (idx === undefined) return null;
  const tpl = blockTemplates[idx];
  _probeMesh.matrixWorld.makeTranslation(b.x, b.y, b.z);
  _probeHits.length = 0;
  for (let i = 0; i < tpl.rayParts.length; i++) {
   const rp = tpl.rayParts[i];
   _probeMesh.geometry = rp.g;
   _probeMesh.material = rp.materials;
   _probeMesh.raycast(raycaster, _probeHits);
  }
  if (!_probeHits.length) return null;
  if (_probeHits.length > 1) _probeHits.sort((a, c) => a.distance - c.distance);
  for (let i = 0; i < _probeHits.length; i++) {
   if (alphaHit(_probeHits[i])) return _probeHits[i];
  }
  return null;
 }

 function isOpaqueFullCube(b) {
  const idx = blockIndexMap.get(b);
  return idx !== undefined ? blockTemplates[idx].isOpaqueCube : false;
 }

 function isFullCube(b) {
  const idx = blockIndexMap.get(b);
  return idx !== undefined ? blockTemplates[idx].isFullCube : false;
 }

 // Render 3D inventory icons only for blocks without flat item icons.
 if (iconEntries.length) {
  const iconScene = new T.Scene();
  const iconMaterials = {};
  for (const [key, m] of Object.entries(materials)) {
   iconMaterials[key] = new T.MeshBasicMaterial({
    map: m.map,
    color: m.color,
    alphaTest: m.alphaTest,
    transparent: m.transparent,
    opacity: m.opacity,
    side: m.side,
    vertexColors: true,
    toneMapped: false,
   });
  }
  const iconCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
  const ir = new T.WebGLRenderer({ alpha: true, antialias: false });
  ir.setSize(96, 96);
  ir.outputColorSpace = T.SRGBColorSpace;
  ir.toneMapping = T.NoToneMapping;

  for (const entry of iconEntries) {
   const group = new T.Group();
   for (const p of entry.parts) {
    const normal = p.g.attributes.normal;
    const colors = new Float32Array(normal.count * 3);
    for (let i = 0; i < normal.count; i++) {
     const shade = normal.getY(i) > 0.5 ? 1 : normal.getY(i) < -0.5 ? 0.5 : Math.abs(normal.getZ(i)) > 0.5 ? 0.8 : 0.6;
     colors.fill(shade, i * 3, i * 3 + 3);
    }
    p.g.setAttribute('color', new T.BufferAttribute(colors, 3));
    group.add(new T.Mesh(p.g, p.keys.map(k => iconMaterials[k])));
   }
   iconScene.add(group);
   const bounds = new T.Box3().setFromObject(group);
   const center = bounds.getCenter(new T.Vector3());
   const size = bounds.getSize(new T.Vector3());
   const span = Math.max(size.x, size.y, size.z) * 0.85;
   iconCamera.left = iconCamera.bottom = -span;
   iconCamera.right = iconCamera.top = span;
   iconCamera.position.copy(center).add(new T.Vector3(2, 1.6, 2.5));
   iconCamera.lookAt(center);
   iconCamera.updateProjectionMatrix();
   ir.render(iconScene, iconCamera);
   icons[entry.name] = ir.domElement.toDataURL();
   iconScene.remove(group);
   group.traverse(o => o.geometry?.dispose());
  }
  Object.values(iconMaterials).forEach(m => m.dispose());
  ir.dispose();
  ir.forceContextLoss();
 }

 function dispose() {
  for (const batch of batches) {
   scene.remove(batch.mesh);
   batch.mesh.geometry.dispose();
  }
  for (const tpl of templateCache.values()) {
   for (const rp of tpl.rayParts) rp.g.dispose();
  }
  templateCache.clear();
  for (const mat of Object.values(materials)) mat.dispose();
  for (const tx of Object.values(textures)) tx.dispose();
  for (const tx of extraTextures) tx.dispose();
  alphas.clear();
  pendingTextures.clear();
 }

 return {
  batches,
  filter,
  alphaHit,
  raycastBlock,
  isOpaqueFullCube,
  isFullCube,
  ensureMaterial,
  ensureMaterials,
  registerAssets,
  dispose,
  icons,
  materials,
  failures,
  parts,
  setEnvironment,
  blockLight,
  inventoryBlock,
 };
}

// Inventory items use their regular upright form; placed state remains untouched.
export function inventoryBlock(b) {
 const n = b.name.split(':')[1], uw = n.replace(/^waxed_/, ''), states = {};
 if (n.endsWith('_stairs')) Object.assign(states, { weirdo_direction: 3, upside_down_bit: 0, 'minecraft:corner': 'none' });
 if (n.endsWith('_slab')) states['minecraft:vertical_half'] = 'bottom';
 if (n.includes('bamboo_block') || n === 'iron_chain' || uw.endsWith('_copper_chain') || n.endsWith('_log') || n.endsWith('_stem') || n.endsWith('_hyphae') || n.endsWith('_froglight')) states.pillar_axis = 'y';
 if (n === 'torch') states.torch_facing_direction = 'top';
 if (n.endsWith('_trapdoor') || n === 'trapdoor') Object.assign(states, { open_bit: 1, direction: 3 });
 if (n === 'bamboo_fence_gate') Object.assign(states, { 'minecraft:cardinal_direction': 'south', open_bit: 0, in_wall_bit: 0 });
 if (n === 'bamboo') Object.assign(states, { bamboo_stalk_thickness: 'thick', bamboo_leaf_size: 'large_leaves' });
 if (n.endsWith('_fence') || n === 'iron_bars' || uw.endsWith('_copper_bars') || n === 'glass_pane' || n.endsWith('_stained_glass_pane')) Object.assign(states, { 'minecraft:connection_east': 1, 'minecraft:connection_west': 1 });
 if (n.endsWith('_wall')) Object.assign(states, { wall_post_bit: 1, wall_connection_type_east: 'short', wall_connection_type_west: 'short' });
 if (n === 'pale_oak_shelf') states['minecraft:cardinal_direction'] = 'south';
 if (n === 'snow_layer') states.height = 0;
 if (n === 'ladder') states.facing_direction = 3;
 if (n === 'barrel') Object.assign(states, { facing_direction: 1, open_bit: 0 });
 if (n.endsWith('_door')) Object.assign(states, { 'minecraft:cardinal_direction': 'north', open_bit: 0, upper_block_bit: 0 });
 if (n === 'glow_lichen') states.multi_face_direction_bits = 4;
 if (n === 'piston' || n === 'sticky_piston') states.facing_direction = 1;
 if (n === 'dispenser' || n === 'dropper') states.facing_direction = 3;
 if (n === 'observer') Object.assign(states, { 'minecraft:facing_direction': 'south', powered_bit: 0 });
 if (n === 'crafter') Object.assign(states, { orientation: 'south_up', crafting: 0, triggered_bit: 0 });
 if (n === 'hopper') Object.assign(states, { facing_direction: 0, toggle_bit: 0 });
 if (n === 'chest' || n === 'trapped_chest' || n === 'ender_chest' || uw.endsWith('copper_chest')) states['minecraft:cardinal_direction'] = 'south';
 if (n === 'chiseled_bookshelf') Object.assign(states, { direction: 0, books_stored: 0 });
 if (n === 'redstone_torch' || n === 'unlit_redstone_torch' || n === 'copper_torch' || n === 'soul_torch') states.torch_facing_direction = 'top';
 if (n.endsWith('_repeater')) Object.assign(states, { 'minecraft:cardinal_direction': 'north', repeater_delay: 0 });
 if (n.endsWith('_comparator')) Object.assign(states, { 'minecraft:cardinal_direction': 'north', output_lit_bit: 0, output_subtract_bit: 0 });
 if (n === 'lever') Object.assign(states, { lever_direction: 'up_north_south', open_bit: 0 });
 if (n.endsWith('_button')) Object.assign(states, { facing_direction: 1, button_pressed_bit: 0 });
 if (n === 'composter') states.composter_fill_level = 0;
 if (n === 'rail' || n === 'golden_rail' || n === 'detector_rail' || n === 'activator_rail') Object.assign(states, { rail_direction: 0, rail_data_bit: 0 });
 if (n === 'amethyst_cluster' || n.endsWith('_amethyst_bud')) states['minecraft:block_face'] = 'up';
 if (n === 'calibrated_sculk_sensor' || n === 'sculk_sensor') Object.assign(states, { 'minecraft:cardinal_direction': 'south', sculk_sensor_phase: 0 });
 if (uw.endsWith('lightning_rod')) Object.assign(states, { facing_direction: 1, powered_bit: 0 });
 if (n === 'rose_bush' || n === 'peony' || n === 'lilac' || n === 'sunflower') states.upper_block_bit = 1;
 if (n === 'cocoa') Object.assign(states, { direction: 0, age: 2 });
 if (uw.endsWith('copper_bulb')) Object.assign(states, { lit: 0, powered_bit: 0 });
 return { ...b, states, waterlogged: false };
}
