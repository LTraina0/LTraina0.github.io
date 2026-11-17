// Redstone, farm automation, fluid, crop, and Deep Freeze / 1.21+ Bedrock block
// definitions for BuildsMine's unified block-renderer.

const ALL_WOOL_COLORS = [
 'white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black',
];
const WOOL_FILE_COLOR = c => (c === 'light_gray' ? 'silver' : c);

export const FARM_TEXTURE_FILES = {
 // Redstone & mechanisms
 pistonTop: 'blocks/piston_top_normal.png',
 pistonTopSticky: 'blocks/piston_top_sticky.png',
 pistonSide: 'blocks/piston_side.png',
 pistonBottom: 'blocks/piston_bottom.png',
 pistonInner: 'blocks/piston_inner.png',
 observerFront: 'blocks/observer_front.png',
 observerBack: 'blocks/observer_back.png',
 observerBackLit: 'blocks/observer_back_lit.png',
 observerSide: 'blocks/observer_side.png',
 observerTop: 'blocks/observer_top.png',
 dispenserFrontH: 'blocks/dispenser_front_horizontal.png',
 dispenserFrontV: 'blocks/dispenser_front_vertical.png',
 dropperFrontH: 'blocks/dropper_front_horizontal.png',
 dropperFrontV: 'blocks/dropper_front_vertical.png',
 furnaceSide: 'blocks/furnace_side.png',
 furnaceTop: 'blocks/furnace_top.png',
 hopperOutside: 'blocks/hopper_outside.png',
 hopperTop: 'blocks/hopper_top.png',
 hopperInside: 'blocks/hopper_inside.png',
 redstoneDustLine: 'blocks/redstone_dust_line.png',
 redstoneDustCross: 'blocks/redstone_dust_cross.png',
 redstoneTorchOn: 'blocks/redstone_torch_on.png',
 redstoneTorchOff: 'blocks/redstone_torch_off.png',
 copperTorch: 'blocks/copper_torch.png',
 soulTorch: 'blocks/soul_torch.png',
 repeaterOff: 'blocks/repeater_off.png',
 repeaterOn: 'blocks/repeater_on.png',
 comparatorOff: 'blocks/comparator_off.png',
 comparatorOn: 'blocks/comparator_on.png',
 stoneSlabTop: 'blocks/stone_slab_top.png',
 stoneSlabSide: 'blocks/stone_slab_side.png',
 redstoneBlock: 'blocks/redstone_block.png',
 redstoneLampOff: 'blocks/redstone_lamp_off.png',
 redstoneLampOn: 'blocks/redstone_lamp_on.png',
 leverTex: 'blocks/lever.png',
 targetSide: 'blocks/target_side.png',
 targetTop: 'blocks/target_top.png',
 noteblock: 'blocks/noteblock.png',
 tntSide: 'blocks/tnt_side.png',
 tntTop: 'blocks/tnt_top.png',
 tntBottom: 'blocks/tnt_bottom.png',
 slimeTex: 'blocks/slime.png',
 honeySide: 'blocks/honey_side.png',
 honeyTop: 'blocks/honey_top.png',
 honeyBottom: 'blocks/honey_bottom.png',
 // 1.21+ / Trials / Garden / Deep Freeze blocks
 crafterTop: 'blocks/crafter_top.png',
 crafterBottom: 'blocks/crafter_bottom.png',
 crafterSouth: 'blocks/crafter_south.png',
 crafterNorth: 'blocks/crafter_north.png',
 crafterEast: 'blocks/crafter_east.png',
 crafterWest: 'blocks/crafter_west.png',
 copperBulb: 'blocks/copper_bulb.png',
 copperBulbLit: 'blocks/copper_bulb_lit.png',
 exposedCopperBulb: 'blocks/exposed_copper_bulb.png',
 exposedCopperBulbLit: 'blocks/exposed_copper_bulb_lit.png',
 weatheredCopperBulb: 'blocks/weathered_copper_bulb.png',
 weatheredCopperBulbLit: 'blocks/weathered_copper_bulb_lit.png',
 oxidizedCopperBulb: 'blocks/oxidized_copper_bulb.png',
 oxidizedCopperBulbLit: 'blocks/oxidized_copper_bulb_lit.png',
 sculkSensorBottom: 'blocks/sculk_sensor_bottom.png',
 sculkSensorSide: 'blocks/sculk_sensor_side.png',
 sculkSensorTop: 'blocks/sculk_sensor_top.png',
 sculkSensorTendrilOff: 'blocks/sculk_sensor_tendril_inactive.png',
 sculkSensorTendrilOn: 'blocks/sculk_sensor_tendril_active.png',
 calibratedSculkTop: 'blocks/calibrated_sculk_sensor_top.png',
 calibratedSculkAmethyst: 'blocks/calibrated_sculk_sensor_amethyst.png',
 chiseledBookshelfTop: 'blocks/chiseled_bookshelf_top.png',
 chiseledBookshelfSide: 'blocks/chiseled_bookshelf_side.png',
 chiseledBookshelfEmpty: 'blocks/chiseled_bookshelf_empty.png',
 chiseledBookshelfOccupied: 'blocks/chiseled_bookshelf_occupied.png',
 daylightTop: 'blocks/daylight_detector_top.png',
 daylightInvertedTop: 'blocks/daylight_detector_inverted_top.png',
 daylightSide: 'blocks/daylight_detector_side.png',
 lightningRod: 'blocks/lightning_rod.png',
 exposedLightningRod: 'blocks/exposed_lightning_rod.png',
 weatheredLightningRod: 'blocks/weathered_lightning_rod.png',
 oxidizedLightningRod: 'blocks/oxidized_lightning_rod.png',
 tripwireHook: 'blocks/trip_wire_source.png',
 tripwireTex: 'blocks/trip_wire.png',
 // Storage & Rails
 chestNormal: 'entity/chest/normal.png',
 chestTrapped: 'entity/chest/trapped.png',
 chestEnder: 'entity/chest/ender.png',
 composterSide: 'blocks/composter_side.png',
 composterBottom: 'blocks/composter_bottom.png',
 composterCompost: 'blocks/composter_top.png',
 composterReady: 'blocks/composter_top.png',
 railNormal: 'blocks/rail_normal.png',
 railTurned: 'blocks/rail_normal_turned.png',
 railGolden: 'blocks/rail_golden.png',
 railGoldenOn: 'blocks/rail_golden_powered.png',
 railDetector: 'blocks/rail_detector.png',
 railDetectorOn: 'blocks/rail_detector_powered.png',
 railActivator: 'blocks/rail_activator.png',
 railActivatorOn: 'blocks/rail_activator_powered.png',
 // Fluids & Farm blocks
 waterStill: 'blocks/water_still.png',
 lavaStill: 'blocks/lava_still.png',
 mossBlock: 'blocks/moss_block.png',
 azaleaTop: 'blocks/azalea_top.png',
 azaleaSide: 'blocks/azalea_side.png',
 azaleaPlant: 'blocks/azalea_plant.png',
 floweringAzaleaTop: 'blocks/flowering_azalea_top.png',
 floweringAzaleaSide: 'blocks/flowering_azalea_side.png',
 azaleaLeaves: 'blocks/azalea_leaves.png',
 azaleaLeavesFlowered: 'blocks/azalea_leaves_flowers.png',
 amethystBlock: 'blocks/amethyst_block.png',
 buddingAmethyst: 'blocks/budding_amethyst.png',
 amethystCluster: 'blocks/amethyst_cluster.png',
 largeAmethystBud: 'blocks/large_amethyst_bud.png',
 mediumAmethystBud: 'blocks/medium_amethyst_bud.png',
 smallAmethystBud: 'blocks/small_amethyst_bud.png',
 cocoa0: 'blocks/cocoa_stage_0.png',
 cocoa1: 'blocks/cocoa_stage_1.png',
 cocoa2: 'blocks/cocoa_stage_2.png',
 kelpTex: 'blocks/kelp_a.tga',
 kelpTopTex: 'blocks/kelp_top.tga',
 driedKelpSide: 'blocks/dried_kelp_side_a.png',
 driedKelpTop: 'blocks/dried_kelp_top.png',
 reedsTex: 'blocks/reeds.tga',
 roseBottom: 'blocks/double_plant_rose_bottom.png',
 roseTop: 'blocks/double_plant_rose_top.png',
 peonyBottom: 'blocks/double_plant_paeonia_bottom.png',
 peonyTop: 'blocks/double_plant_paeonia_top.png',
 lilacBottom: 'blocks/double_plant_syringa_bottom.tga',
 lilacTop: 'blocks/double_plant_syringa_top.tga',
 sunflowerBottom: 'blocks/double_plant_sunflower_bottom.png',
 sunflowerTop: 'blocks/double_plant_sunflower_top.png',
 // Natural / Building / Deep Freeze substrates
 dirt: 'blocks/dirt.png',
 coarseDirt: 'blocks/coarse_dirt.png',
 grassSide: 'blocks/grass_side_carried.png',
 grassTopTex: 'blocks/grass_top.png',
 farmlandDry: 'blocks/farmland_dry.png',
 farmlandWet: 'blocks/farmland_wet.png',
 stone: 'blocks/stone.png',
 cobblestone: 'blocks/cobblestone.png',
 stoneBricks: 'blocks/stonebrick.png',
 smoothStone: 'blocks/stone_slab_top.png',
 obsidian: 'blocks/obsidian.png',
 netherrack: 'blocks/netherrack.png',
 magma: 'blocks/magma.png',
 soulSand: 'blocks/soul_sand.png',
 ice: 'blocks/ice.png',
 calcite: 'blocks/calcite.png',
 tuff: 'blocks/tuff.png',
 deepslate: 'blocks/deepslate/deepslate.png',
 cobbledDeepslate: 'blocks/deepslate/cobbled_deepslate.png',
 deepslateBricks: 'blocks/deepslate/deepslate_bricks.png',
 polishedDeepslate: 'blocks/deepslate/polished_deepslate.png',
 ironBlock: 'blocks/iron_block.png',
 goldBlock: 'blocks/gold_block.png',
 quartzBlock: 'blocks/quartz_block_side.png',
 junglePlanks: 'blocks/planks_jungle.png',
 jungleLog: 'blocks/log_jungle.png',
 jungleLogTop: 'blocks/log_jungle_top.png',
 strippedJungleLog: 'blocks/stripped_jungle_log.png',
 strippedJungleLogTop: 'blocks/stripped_jungle_log_top.png',
 oakLeavesTex: 'blocks/leaves_oak_carried.tga',
 spruceLeavesTex: 'blocks/leaves_spruce_carried.tga',
 darkOakLeavesTex: 'blocks/leaves_big_oak_carried.tga',
 jungleLeavesTex: 'blocks/leaves_jungle_carried.tga',
 crimsonNyliumSide: 'blocks/crimson_nylium_side.png',
 crimsonNyliumTop: 'blocks/crimson_nylium_top.png',
 netherWartBlock: 'blocks/nether_wart_block.png',
 crimsonStem: 'blocks/huge_fungus/crimson_log_side.png',
 crimsonStemTop: 'blocks/huge_fungus/crimson_log_top.png',
 seaLantern: 'blocks/sea_lantern.png',
 ...Object.fromEntries(
  ALL_WOOL_COLORS.map(c => [`wool_${c}`, `blocks/wool_colored_${WOOL_FILE_COLOR(c)}.png`])
 ),
};

export const FARM_TEXTURE_ALIASES = {
 redstoneLineOff: 'redstoneDustLine',
 redstoneLineOn: 'redstoneDustLine',
 redstoneCrossOff: 'redstoneDustCross',
 redstoneCrossOn: 'redstoneDustCross',
 water: 'waterStill',
 grassTop: 'grassTopTex',
 kelp: 'kelpTex',
 kelpTop: 'kelpTopTex',
 reeds: 'reedsTex',
 oakLeaves: 'oakLeavesTex',
 spruceLeaves: 'spruceLeavesTex',
 darkOakLeaves: 'darkOakLeavesTex',
 jungleLeaves: 'jungleLeavesTex',
};

export const FARM_MATERIAL_TINTS = {
 redstoneLineOff: '#4f0808',
 redstoneLineOn: '#ff2828',
 redstoneCrossOff: '#4f0808',
 redstoneCrossOn: '#ff2828',
 water: '#b8d8ff',
 grassTop: '#7cbd6b',
 reeds: '#84c96b',
};

export const FARM_CUT_KEYS = [
 'hopperTop', 'redstoneLineOff', 'redstoneLineOn', 'redstoneCrossOff', 'redstoneCrossOn',
 'redstoneTorchOn', 'redstoneTorchOff', 'copperTorch', 'soulTorch',
 'sculkSensorTendrilOff', 'sculkSensorTendrilOn', 'calibratedSculkAmethyst',
 'lightningRod', 'exposedLightningRod', 'weatheredLightningRod', 'oxidizedLightningRod',
 'tripwireHook', 'tripwireTex',
 'railNormal', 'railTurned', 'railGolden', 'railGoldenOn', 'railDetector', 'railDetectorOn', 'railActivator', 'railActivatorOn',
 'azaleaSide', 'floweringAzaleaSide', 'azaleaPlant',
 'azaleaLeaves', 'azaleaLeavesFlowered', 'oakLeaves', 'spruceLeaves', 'darkOakLeaves', 'jungleLeaves',
 'amethystCluster', 'largeAmethystBud', 'mediumAmethystBud', 'smallAmethystBud',
 'cocoa0', 'cocoa1', 'cocoa2', 'kelp', 'kelpTop', 'reeds',
 'roseBottom', 'roseTop', 'peonyBottom', 'peonyTop', 'lilacBottom', 'lilacTop', 'sunflowerBottom', 'sunflowerTop',
];

export const FARM_GLASS_KEYS = ['water', 'ice', 'slimeTex', 'honeySide', 'honeyTop', 'honeyBottom'];

export const FARM_EMISSIVE_SPECS = {
 redstoneLineOn: { color: '#ff2424', intensity: 0.28 },
 redstoneCrossOn: { color: '#ff2424', intensity: 0.28 },
 redstoneTorchOn: { color: '#ff3b2f', intensity: 0.35 },
 copperTorch: { color: '#6eff9f', intensity: 0.25 },
 soulTorch: { color: '#6be8ff', intensity: 0.25 },
 redstoneLampOn: { color: '#ffd28a', intensity: 0.35 },
 copperBulbLit: { color: '#ffd394', intensity: 0.4 },
 exposedCopperBulbLit: { color: '#f2c082', intensity: 0.32 },
 weatheredCopperBulbLit: { color: '#cca478', intensity: 0.22 },
 oxidizedCopperBulbLit: { color: '#9e856c', intensity: 0.14 },
 lavaStill: { color: '#ff6e24', intensity: 0.55 },
 magma: { color: '#ff5c1a', intensity: 0.22 },
 seaLantern: { color: '#c4f4ff', intensity: 0.3 },
 amethystCluster: { color: '#c988ff', intensity: 0.16 },
};

export const FARM_NIGHT_EMISSIVE_KEYS = [
 'redstoneLampOn', 'copperBulbLit', 'exposedCopperBulbLit',
 'weatheredCopperBulbLit', 'oxidizedCopperBulbLit', 'lavaStill', 'seaLantern',
];

export const FARM_ITEM_ICON_FILES = {
 redstone_wire: 'items/redstone_dust.png',
 hopper: 'items/hopper.png',
 unpowered_repeater: 'items/repeater.png',
 powered_repeater: 'items/repeater.png',
 unpowered_comparator: 'items/comparator.png',
 powered_comparator: 'items/comparator.png',
 kelp: 'items/kelp.png',
 reeds: 'items/reeds.png',
 cocoa: 'items/dye_powder_brown.png',
};

const FACING_NAMES = ['down', 'up', 'north', 'south', 'west', 'east'];
export function parseFacing(v, fallback = 'south') {
 if (typeof v === 'number' && FACING_NAMES[v]) return FACING_NAMES[v];
 if (typeof v === 'string' && FACING_NAMES.includes(v)) return v;
 return fallback;
}

const OPPOSITE_CARDINAL = { north: 'south', south: 'north', east: 'west', west: 'east' };
const CARDINAL_LIST = ['south', 'west', 'north', 'east'];
const RAIL_DIRS = new Map([
 [0, { angle: 0, slope: 0, turned: false }],
 [1, { angle: Math.PI / 2, slope: 0, turned: false }],
 [2, { angle: Math.PI / 2, slope: 1, turned: false }],
 [3, { angle: -Math.PI / 2, slope: 1, turned: false }],
 [4, { angle: Math.PI, slope: 1, turned: false }],
 [5, { angle: 0, slope: 1, turned: false }],
 [6, { angle: 0, slope: 0, turned: true }],
 [7, { angle: -Math.PI / 2, slope: 0, turned: true }],
 [8, { angle: Math.PI, slope: 0, turned: true }],
 [9, { angle: Math.PI / 2, slope: 0, turned: true }],
]);

const REDSTONE_CONNECTABLE = new Set([
 'minecraft:redstone_wire', 'minecraft:redstone_torch', 'minecraft:unlit_redstone_torch',
 'minecraft:unpowered_repeater', 'minecraft:powered_repeater',
 'minecraft:unpowered_comparator', 'minecraft:powered_comparator',
 'minecraft:redstone_block', 'minecraft:lever', 'minecraft:target',
 'minecraft:trapped_chest', 'minecraft:daylight_detector', 'minecraft:daylight_detector_inverted',
 'minecraft:tripwire_hook', 'minecraft:sculk_sensor', 'minecraft:calibrated_sculk_sensor',
 'minecraft:lectern', 'minecraft:observer', 'minecraft:lightning_rod',
 'minecraft:exposed_lightning_rod', 'minecraft:weathered_lightning_rod', 'minecraft:oxidized_lightning_rod',
 'minecraft:waxed_lightning_rod', 'minecraft:waxed_exposed_lightning_rod',
 'minecraft:waxed_weathered_lightning_rod', 'minecraft:waxed_oxidized_lightning_rod',
 'minecraft:crafter', 'minecraft:piston', 'minecraft:sticky_piston',
 'minecraft:dispenser', 'minecraft:dropper', 'minecraft:hopper',
 'minecraft:redstone_lamp', 'minecraft:lit_redstone_lamp', 'minecraft:noteblock',
]);

function isRedstoneNeighbor(b, dx = 0, dz = 0) {
 if (!b) return false;
 if (b.name === 'minecraft:unpowered_repeater' || b.name === 'minecraft:powered_repeater') {
  const cd = b.states?.['minecraft:cardinal_direction'] || 'north';
  return (cd === 'north' || cd === 'south') ? dx === 0 : dz === 0;
 }
 if (REDSTONE_CONNECTABLE.has(b.name)) return true;
 const n = b.name.split(':')[1] || '';
 return n.endsWith('_button') || n.endsWith('_pressure_plate') || n.endsWith('copper_bulb');
}

export function computeWireMask(b, blockAt, isOpaqueAt) {
 const x = b.x, y = b.y, z = b.z;
 let mask = 0;
 const dirs = [
  [0, -1, 1], // N
  [0, 1, 2],  // S
  [1, 0, 4],  // E
  [-1, 0, 8], // W
 ];
 const aboveOpaque = isOpaqueAt(x, y + 1, z);
 for (const [dx, dz, bit] of dirs) {
  const side = blockAt(x + dx, y, z + dz);
  if (isRedstoneNeighbor(side, dx, dz)) { mask |= bit; continue; }
  if (!aboveOpaque && blockAt(x + dx, y + 1, z + dz)?.name === 'minecraft:redstone_wire') {
   mask |= bit | (bit << 4);
   continue;
  }
  if (!isOpaqueAt(x + dx, y, z + dz) && blockAt(x + dx, y - 1, z + dz)?.name === 'minecraft:redstone_wire') {
   mask |= bit;
  }
 }
 return mask;
}

export function farmKeyOf(raw) {
 const n = raw.includes(':') ? raw.split(':')[1] : raw;
 const uw = n.replace(/^waxed_/, '');
 if (uw.startsWith('wool_') || n.endsWith('_wool') || n.endsWith('_carpet')) {
  for (const c of ALL_WOOL_COLORS) {
   if (n.startsWith(c + '_wool') || n.startsWith(c + '_carpet')) return 'wool_' + c;
  }
 }
 if (n === 'dirt') return 'dirt';
 if (n === 'coarse_dirt') return 'coarseDirt';
 if (n === 'stone' || n === 'normal_stone_slab' || n === 'normal_stone_stairs') return 'stone';
 if (n === 'smooth_stone' || n === 'smooth_stone_slab' || n === 'smooth_stone_double_slab') return 'smoothStone';
 if (n === 'cobblestone' || n.startsWith('cobblestone_') || n === 'stone_stairs') return 'cobblestone';
 if (n === 'stone_bricks' || n.startsWith('stone_brick_')) return 'stoneBricks';
 if (n === 'obsidian') return 'obsidian';
 if (n === 'netherrack') return 'netherrack';
 if (n === 'magma') return 'magma';
 if (n === 'soul_sand') return 'soulSand';
 if (n === 'ice') return 'ice';
 if (n === 'calcite') return 'calcite';
 if (n === 'tuff') return 'tuff';
 if (n === 'cobbled_deepslate' || n.startsWith('cobbled_deepslate_')) return 'cobbledDeepslate';
 if (n === 'deepslate_bricks' || n.startsWith('deepslate_brick_')) return 'deepslateBricks';
 if (n === 'polished_deepslate' || n.startsWith('polished_deepslate_')) return 'polishedDeepslate';
 if (n.includes('deepslate')) return 'deepslate';
 if (n === 'iron_block') return 'ironBlock';
 if (n === 'gold_block') return 'goldBlock';
 if (n.startsWith('quartz')) return 'quartzBlock';
 if (n.startsWith('jungle_')) return 'junglePlanks';
 if (n === 'moss_block' || n === 'moss_carpet') return 'mossBlock';
 if (n === 'amethyst_block') return 'amethystBlock';
 if (n === 'budding_amethyst') return 'buddingAmethyst';
 if (n === 'nether_wart_block') return 'netherWartBlock';
 if (n === 'sea_lantern') return 'seaLantern';
 if (n === 'redstone_block') return 'redstoneBlock';
 if (n === 'noteblock') return 'noteblock';
 return null;
}

export const FARM_LOG_MAP = {
 jungle_log: ['jungleLog', 'jungleLogTop'],
 stripped_jungle_log: ['strippedJungleLog', 'strippedJungleLogTop'],
 crimson_stem: ['crimsonStem', 'crimsonStemTop'],
 crimson_hyphae: ['crimsonStem', 'crimsonStem'],
};

const CHEST_UV_64 = {
 base: [
  [0, 33, 14, 43],
  [28, 33, 42, 43],
  [14, 19, 28, 33],
  [28, 19, 42, 33],
  [14, 33, 28, 43],
  [42, 33, 56, 43],
 ],
 lid: [
  [0, 14, 14, 19],
  [28, 14, 42, 19],
  [14, 0, 28, 14],
  [28, 0, 42, 14],
  [14, 14, 28, 19],
  [42, 14, 56, 19],
 ],
 latch: [
  [0, 1, 2, 5],
  [4, 1, 6, 5],
  [1, 0, 3, 1],
  [3, 0, 5, 1],
  [1, 1, 3, 5],
  [3, 1, 5, 5],
 ],
};

const BULB_KEYS = {
 copper_bulb: ['copperBulb', 'copperBulbLit'],
 exposed_copper_bulb: ['exposedCopperBulb', 'exposedCopperBulbLit'],
 weathered_copper_bulb: ['weatheredCopperBulb', 'weatheredCopperBulbLit'],
 oxidized_copper_bulb: ['oxidizedCopperBulb', 'oxidizedCopperBulbLit'],
};

const ROD_KEYS = {
 lightning_rod: 'lightningRod',
 exposed_lightning_rod: 'exposedLightningRod',
 weathered_lightning_rod: 'weatheredLightningRod',
 oxidized_lightning_rod: 'oxidizedLightningRod',
};

const DOUBLE_PLANTS = {
 rose_bush: ['roseBottom', 'roseTop'],
 peony: ['peonyBottom', 'peonyTop'],
 lilac: ['lilacBottom', 'lilacTop'],
 sunflower: ['sunflowerBottom', 'sunflowerTop'],
};

const LEAVES_KEYS = {
 oak_leaves: 'oakLeaves',
 spruce_leaves: 'spruceLeaves',
 dark_oak_leaves: 'darkOakLeaves',
 jungle_leaves: 'jungleLeaves',
 azalea_leaves: 'azaleaLeaves',
 azalea_leaves_flowered: 'azaleaLeavesFlowered',
};

export function buildFarmPart(b, h, extra = {}) {
 const { box, plane, rotate, orient, out } = h;
 const add = (bounds, k, uv, uvScale = 16) => out.push(box(bounds, k, uv, uvScale));
 const n = b.name.split(':')[1];
 const uw = n.replace(/^waxed_/, '');
 const s = b.states || {};

 // Pistons (0=down,1=up,2=north,3=south,4=west,5=east)
 if (n === 'piston' || n === 'sticky_piston') {
  const topKey = n === 'sticky_piston' ? 'pistonTopSticky' : 'pistonTop';
  add([0, 0, 0, 16, 16, 16], ['pistonSide', 'pistonSide', 'pistonSide', 'pistonSide', topKey, 'pistonBottom']);
  orient(out, parseFacing(s.facing_direction, 'up'), 'south');
  return true;
 }
 if (n === 'piston_arm_collision' || n === 'sticky_piston_arm_collision') {
  const topKey = n.includes('sticky') ? 'pistonTopSticky' : 'pistonTop';
  add([6, 6, 0, 10, 10, 12], 'pistonSide');
  add([0, 0, 12, 16, 16, 16], ['pistonSide', 'pistonSide', 'pistonSide', 'pistonSide', topKey, 'pistonInner']);
  orient(out, parseFacing(s.facing_direction, 'up'), 'south');
  return true;
 }

 // Observer: minecraft:facing_direction points toward the DETECTING face (front)
 if (n === 'observer') {
  const back = s.powered_bit ? 'observerBackLit' : 'observerBack';
  add([0, 0, 0, 16, 16, 16], ['observerSide', 'observerSide', 'observerTop', 'observerTop', 'observerFront', back]);
  orient(out, parseFacing(s['minecraft:facing_direction'] ?? s.facing_direction, 'north'), 'south');
  return true;
 }

 // Dispenser / Dropper
 if (n === 'dispenser' || n === 'dropper') {
  const dir = parseFacing(s.facing_direction, 'north');
  const vert = dir === 'up' || dir === 'down';
  const frontKey = n === 'dispenser'
   ? (vert ? 'dispenserFrontV' : 'dispenserFrontH')
   : (vert ? 'dropperFrontV' : 'dropperFrontH');
  add([0, 0, 0, 16, 16, 16], ['furnaceSide', 'furnaceSide', 'furnaceTop', 'furnaceTop', frontKey, 'furnaceSide']);
  orient(out, dir, 'south');
  return true;
 }

 // Crafter (1.21+): orientation e.g. 'north_up', 'up_north'
 if (n === 'crafter') {
  const primary = String(s.orientation || 'north_up').split('_')[0];
  add([0, 0, 0, 16, 16, 16], ['crafterEast', 'crafterWest', 'crafterTop', 'crafterBottom', 'crafterSouth', 'crafterNorth']);
  orient(out, parseFacing(primary, 'north'), 'south');
  return true;
 }

 // Hopper: bowl + funnel + directional spout (0=down, 2=north, 3=south, 4=west, 5=east)
 if (n === 'hopper') {
  const dir = parseFacing(s.facing_direction, 'down');
  add([0, 10, 0, 16, 16, 16], ['hopperOutside', 'hopperOutside', 'hopperTop', 'hopperOutside', 'hopperOutside', 'hopperOutside']);
  add([4, 4, 4, 12, 10, 12], 'hopperOutside');
  if (dir === 'down' || dir === 'up') {
   add([6, 0, 6, 10, 4, 10], 'hopperOutside');
  } else {
   const spout = [box([6, 4, 12, 10, 8, 16], 'hopperOutside')];
   out.push(...orient(spout, dir, 'south'));
  }
  return true;
 }

 // Redstone Wire: horizontal line (ewOnly) / rotated N-S (nsOnly) or selective cross arms + vertical climb
 if (n === 'redstone_wire') {
  const on = (s.redstone_signal ?? 0) > 0;
  const lineK = on ? 'redstoneLineOn' : 'redstoneLineOff';
  const crossK = on ? 'redstoneCrossOn' : 'redstoneCrossOff';
  const mask = extra.wireMask ?? 0;
  const nBit = mask & 1, sBit = mask & 2, eBit = mask & 4, wBit = mask & 8;
  const nsOnly = (nBit || sBit) && !eBit && !wBit;
  const ewOnly = (eBit || wBit) && !nBit && !sBit;
  if (nsOnly || ewOnly) {
   const pg = new h.PlaneGeometry(1, 1);
   pg.rotateX(-Math.PI / 2);
   // blocks/redstone_dust_line.png runs horizontally along U (east-west)
   if (nsOnly) pg.rotateY(Math.PI / 2);
   pg.translate(0.5, 0.02, 0.5);
   pg.addGroup(0, pg.index.count, 0);
   out.push({ g: pg, keys: [lineK], isFullBox: false });
  } else {
   const addPatch = (x0, z0, x1, z1) => {
    const pg = new h.PlaneGeometry((x1 - x0) / 16, (z1 - z0) / 16);
    const uv = pg.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
     uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / 16, 1 - (z0 + (1 - uv.getY(i)) * (z1 - z0)) / 16);
    }
    pg.rotateX(-Math.PI / 2);
    pg.translate((x0 + x1) / 32, 0.02, (z0 + z1) / 32);
    pg.addGroup(0, pg.index.count, 0);
    out.push({ g: pg, keys: [crossK], isFullBox: false });
   };
   addPatch(5, 5, 11, 11);
   if (nBit) addPatch(5, 0, 11, 5);
   if (sBit) addPatch(5, 11, 11, 16);
   if (wBit) addPatch(0, 5, 5, 11);
   if (eBit) addPatch(11, 5, 16, 11);
  }
  // Vertical climb strips on adjacent solid sides
  const climbs = [
   [16, 'north'],
   [32, 'south'],
   [64, 'east'],
   [128, 'west'],
  ];
  for (const [cBit, dir] of climbs) {
   if (mask & cBit) {
    out.push(...orient([plane(16, 16, [0, 0, 16, 16], 0, [0.5, 0.5, 0.98], lineK)], dir, 'south'));
   }
  }
  return true;
 }

 // Redstone / Copper / Soul Torches
 if (n === 'redstone_torch' || n === 'unlit_redstone_torch' || n === 'copper_torch' || n === 'soul_torch') {
  const k = n === 'unlit_redstone_torch' ? 'redstoneTorchOff'
   : n === 'redstone_torch' ? 'redstoneTorchOn'
   : n === 'copper_torch' ? 'copperTorch' : 'soulTorch';
  add([7, 0, 7, 9, 10, 9], k, [[7, 6, 9, 16], [7, 6, 9, 16], [7, 6, 9, 8], [7, 14, 9, 16], [7, 6, 9, 16], [7, 6, 9, 16]]);
  const d = s.torch_facing_direction;
  if (d && d !== 'top' && d !== 'unknown') {
   h.tiltTorch(out, d);
  }
  return true;
 }

 // Repeaters (in Bedrock, minecraft:cardinal_direction is the OUTPUT direction)
 if (n === 'unpowered_repeater' || n === 'powered_repeater') {
  const topK = n === 'powered_repeater' ? 'repeaterOn' : 'repeaterOff';
  const pinK = n === 'powered_repeater' ? 'redstoneTorchOn' : 'redstoneTorchOff';
  const delay = Math.max(0, Math.min(3, s.repeater_delay ?? 0));
  add([0, 0, 0, 16, 2, 16], ['stoneSlabSide', 'stoneSlabSide', topK, 'stoneSlabTop', 'stoneSlabSide', 'stoneSlabSide']);
  const torchUV = Array(6).fill([7, 6, 9, 11]);
  add([7, 2, 2, 9, 7, 4], pinK, torchUV);
  const z2 = 6 + 2 * delay;
  add([7, 2, z2, 9, 7, z2 + 2], pinK, torchUV);
  const outDir = s['minecraft:cardinal_direction'] || 'north';
  orient(out, outDir, 'north');
  return true;
 }

 // Comparators (in Bedrock, minecraft:cardinal_direction is the OUTPUT direction)
 if (n === 'unpowered_comparator' || n === 'powered_comparator') {
  const powered = n === 'powered_comparator' || Boolean(s.output_lit_bit);
  const sub = Boolean(s.output_subtract_bit);
  const topK = powered ? 'comparatorOn' : 'comparatorOff';
  const backPinK = powered ? 'redstoneTorchOn' : 'redstoneTorchOff';
  const frontPinK = sub ? 'redstoneTorchOn' : 'redstoneTorchOff';
  add([0, 0, 0, 16, 2, 16], ['stoneSlabSide', 'stoneSlabSide', topK, 'stoneSlabTop', 'stoneSlabSide', 'stoneSlabSide']);
  const torchUV = Array(6).fill([7, 6, 9, 11]);
  add([4, 2, 11, 6, 7, 13], backPinK, torchUV);
  add([10, 2, 11, 12, 7, 13], backPinK, torchUV);
  add([7, 2, 2, 9, sub ? 5 : 7, 4], frontPinK, torchUV);
  const outDir = s['minecraft:cardinal_direction'] || 'north';
  orient(out, outDir, 'north');
  return true;
 }

 // Redstone Lamp & Copper Bulbs
 if (n === 'redstone_lamp' || n === 'lit_redstone_lamp') {
  add([0, 0, 0, 16, 16, 16], n === 'lit_redstone_lamp' ? 'redstoneLampOn' : 'redstoneLampOff');
  return true;
 }
 if (BULB_KEYS[uw]) {
  const [unlitK, litK] = BULB_KEYS[uw];
  add([0, 0, 0, 16, 16, 16], s.lit ? litK : unlitK);
  return true;
 }

 // Lever (pivot handle at base center y=2/16 so it never floats out of base)
 if (n === 'lever') {
  const ld = String(s.lever_direction || 'up_north_south');
  add([5, 0, 4, 11, 3, 12], 'cobblestone');
  const handle = box([7, 2, 7, 9, 11, 9], 'leverTex', Array(6).fill([7, 6, 9, 16]));
  handle.g.translate(-0.5, -2 / 16, -0.5);
  handle.g.rotateX(s.open_bit ? -0.65 : 0.65);
  handle.g.translate(0.5, 2 / 16, 0.5);
  out.push(handle);
  if (ld === 'up_east_west') rotate(out, h.axisY, Math.PI / 2);
  else if (ld === 'down_north_south') rotate(out, h.axisX, Math.PI);
  else if (ld === 'down_east_west') { rotate(out, h.axisX, Math.PI); rotate(out, h.axisY, Math.PI / 2); }
  else if (ld === 'north' || ld === 'south' || ld === 'east' || ld === 'west') {
   rotate(out, h.axisX, -Math.PI / 2);
   orient(out, ld, 'north');
  }
  return true;
 }

 // Buttons
 if (n.endsWith('_button')) {
  const bKey = n.includes('stone') ? 'stone' : n.includes('blackstone') ? 'polishedBlackstoneBricks'
   : n.includes('spruce') ? 'spruce' : n.includes('dark_oak') ? 'darkOak'
   : n.includes('crimson') ? 'crimson' : n.includes('birch') ? 'birch'
   : n.includes('bamboo') ? 'bamboo' : 'wood';
  const t = s.button_pressed_bit ? 1 : 2;
  add([5, 0, 6, 11, t, 10], bKey);
  const d = parseFacing(s.facing_direction, 'up');
  if (d === 'down') rotate(out, h.axisX, Math.PI);
  else if (d !== 'up') orient(out, d, 'up');
  return true;
 }

 // Pressure plates
 if (n.endsWith('_pressure_plate')) {
  const pKey = n.includes('stone') ? 'stone' : n.includes('blackstone') ? 'polishedBlackstoneBricks'
   : n.includes('light_weighted') ? 'goldBlock' : n.includes('heavy_weighted') ? 'ironBlock'
   : n.includes('spruce') ? 'spruce' : n.includes('dark_oak') ? 'darkOak'
   : n.includes('crimson') ? 'crimson' : n.includes('birch') ? 'birch'
   : n.includes('bamboo') ? 'bamboo' : 'wood';
  add([1, 0, 1, 15, (s.redstone_signal ?? 0) > 0 ? 0.5 : 1, 15], pKey);
  return true;
 }

 // Target, TNT, Slime, Honey
 if (n === 'target') {
  add([0, 0, 0, 16, 16, 16], ['targetSide', 'targetSide', 'targetTop', 'targetTop', 'targetSide', 'targetSide']);
  return true;
 }
 if (n === 'tnt' || n === 'underwater_tnt') {
  add([0, 0, 0, 16, 16, 16], ['tntSide', 'tntSide', 'tntTop', 'tntBottom', 'tntSide', 'tntSide']);
  return true;
 }
 if (n === 'slime') {
  add([3, 3, 3, 13, 13, 13], 'slimeTex');
  add([0, 0, 0, 16, 16, 16], 'slimeTex');
  return true;
 }
 if (n === 'honey_block') {
  add([1, 1, 1, 15, 15, 15], ['honeySide', 'honeySide', 'honeyTop', 'honeyBottom', 'honeySide', 'honeySide']);
  add([0, 0, 0, 16, 16, 16], ['honeySide', 'honeySide', 'honeyTop', 'honeyBottom', 'honeySide', 'honeySide']);
  return true;
 }

 // Chiseled bookshelf
 if (n === 'chiseled_bookshelf') {
  const frontK = (s.books_stored ?? 0) > 0 ? 'chiseledBookshelfOccupied' : 'chiseledBookshelfEmpty';
  add([0, 0, 0, 16, 16, 16], ['chiseledBookshelfSide', 'chiseledBookshelfSide', 'chiseledBookshelfTop', 'chiseledBookshelfTop', frontK, 'chiseledBookshelfSide']);
  orient(out, s['minecraft:cardinal_direction'] ?? CARDINAL_LIST[s.direction ?? 0], 'south');
  return true;
 }

 // Sculk Sensor & Calibrated Sculk Sensor
 if (n === 'sculk_sensor' || n === 'calibrated_sculk_sensor') {
  const active = (s.sculk_sensor_phase ?? 0) > 0;
  const topK = n === 'calibrated_sculk_sensor' ? 'calibratedSculkTop' : 'sculkSensorTop';
  const tendrilK = active ? 'sculkSensorTendrilOn' : 'sculkSensorTendrilOff';
  add([0, 0, 0, 16, 8, 16], ['sculkSensorSide', 'sculkSensorSide', topK, 'sculkSensorBottom', 'sculkSensorSide', 'sculkSensorSide']);
  for (const [cx, cz] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
   out.push(plane(6, 6, [0, 0, 16, 16], Math.PI / 4, [cx, 11 / 16, cz], tendrilK));
   out.push(plane(6, 6, [0, 0, 16, 16], -Math.PI / 4, [cx, 11 / 16, cz], tendrilK));
  }
  if (n === 'calibrated_sculk_sensor') {
   out.push(
    plane(10, 10, [0, 0, 16, 16], Math.PI / 4, [0.5, 13 / 16, 0.5], 'calibratedSculkAmethyst'),
    plane(10, 10, [0, 0, 16, 16], -Math.PI / 4, [0.5, 13 / 16, 0.5], 'calibratedSculkAmethyst')
   );
   orient(out, s['minecraft:cardinal_direction'] || 'south', 'south');
  }
  return true;
 }

 // Daylight Detector
 if (n === 'daylight_detector' || n === 'daylight_detector_inverted') {
  const topK = n === 'daylight_detector_inverted' ? 'daylightInvertedTop' : 'daylightTop';
  add([0, 0, 0, 16, 6, 16], ['daylightSide', 'daylightSide', topK, 'daylightSide', 'daylightSide', 'daylightSide']);
  return true;
 }

 // Lightning Rod
 if (ROD_KEYS[uw]) {
  const rKey = ROD_KEYS[uw];
  add([6, 12, 6, 10, 16, 10], rKey, Array(6).fill([0, 0, 4, 4]));
  add([7, 0, 7, 9, 12, 9], rKey, Array(6).fill([0, 4, 2, 16]));
  const d = parseFacing(s.facing_direction, 'up');
  if (d === 'down') rotate(out, h.axisX, Math.PI);
  else if (d !== 'up') orient(out, d, 'up');
  return true;
 }

 // Chest / Trapped Chest / Ender Chest / Copper Chests (joins adjacent double chests seamlessly)
 if (n === 'chest' || n === 'trapped_chest' || n === 'ender_chest' || uw.endsWith('copper_chest')) {
  const cKey = n === 'trapped_chest' ? 'chestTrapped' : n === 'ender_chest' ? 'chestEnder' : 'chestNormal';
  const pair = extra.chestPair || 'single'; // 'left' (+X seam), 'right' (-X seam), or 'single' in canonical south frame
  const x0 = pair === 'right' ? 0 : 1;
  const x1 = pair === 'left' ? 16 : 15;
  const latchX0 = pair === 'left' ? 15 : pair === 'right' ? 0 : 7;
  const latchX1 = pair === 'left' ? 16 : pair === 'right' ? 1 : 9;
  if (uw.endsWith('copper_chest')) {
   const ck = uw.startsWith('oxidized') ? 'oxCopper' : uw.startsWith('weathered') ? 'weatheredCopper' : 'cutCopper';
   add([x0, 0, 1, x1, 14, 15], ck);
   add([latchX0, 7, 15, latchX1, 11, 16], 'ironBlock');
  } else {
   add([x0, 0, 1, x1, 10, 15], cKey, CHEST_UV_64.base, 64);
   add([x0, 10, 1, x1, 14, 15], cKey, CHEST_UV_64.lid, 64);
   add([latchX0, 7, 15, latchX1, 11, 16], cKey, CHEST_UV_64.latch, 64);
  }
  orient(out, s['minecraft:cardinal_direction'] || 'south', 'south');
  return true;
 }

 // Composter (hollow walls + bottom + fill layer)
 if (n === 'composter') {
  add([0, 0, 0, 16, 2, 16], 'composterBottom');
  add([0, 2, 0, 2, 16, 16], 'composterSide');
  add([14, 2, 0, 16, 16, 16], 'composterSide');
  add([2, 2, 0, 14, 16, 2], 'composterSide');
  add([2, 2, 14, 14, 16, 16], 'composterSide');
  const lvl = s.composter_fill_level ?? 0;
  if (lvl > 0) {
   const topY = Math.min(15, 2 + lvl * 1.6);
   add([2, 2, 2, 14, topY, 14], lvl >= 8 ? 'composterReady' : 'composterCompost');
  }
  return true;
 }

 // Rails
 if (n === 'rail' || n === 'golden_rail' || n === 'detector_rail' || n === 'activator_rail') {
  const rd = s.rail_direction ?? 0;
  const spec = RAIL_DIRS.get(rd) || RAIL_DIRS.get(0);
  const on = Boolean(s.rail_data_bit);
  const rKey = n === 'rail' ? (spec.turned ? 'railTurned' : 'railNormal')
   : n === 'golden_rail' ? (on ? 'railGoldenOn' : 'railGolden')
   : n === 'detector_rail' ? (on ? 'railDetectorOn' : 'railDetector')
   : (on ? 'railActivatorOn' : 'railActivator');
  const pg = new h.PlaneGeometry(1, spec.slope ? Math.SQRT2 : 1);
  pg.rotateX(-Math.PI / 2);
  if (spec.slope) {
   pg.translate(0, 0, 0);
   pg.rotateX(-Math.PI / 4);
   pg.translate(0.5, 0.52, 0.5);
  } else {
   pg.translate(0.5, 0.04, 0.5);
  }
  if (spec.angle) {
   pg.translate(-0.5, 0, -0.5);
   pg.rotateY(spec.angle);
   pg.translate(0.5, 0, 0.5);
  }
  pg.addGroup(0, pg.index.count, 0);
  out.push({ g: pg, keys: [rKey], isFullBox: false });
  return true;
 }

 // Fluids
 if (n === 'water' || n === 'flowing_water' || n === 'lava' || n === 'flowing_lava') {
  const k = n.includes('lava') ? 'lavaStill' : 'water';
  const depth = s.liquid_depth ?? 0;
  const h16 = depth >= 8 ? 16 : Math.max(2, 14 - depth * 1.7);
  add([0, 0, 0, 16, h16, 16], k);
  return true;
 }

 // Azalea bushes (full 16x16 canopy with alpha cutout + crossed internal stem)
 if (n === 'azalea' || n === 'flowering_azalea') {
  const topK = n === 'flowering_azalea' ? 'floweringAzaleaTop' : 'azaleaTop';
  const sideK = n === 'flowering_azalea' ? 'floweringAzaleaSide' : 'azaleaSide';
  add([0, 0, 0, 16, 16, 16], [sideK, sideK, topK, sideK, sideK, sideK]);
  out.push(
   plane(16, 16, [0, 0, 16, 16], Math.PI / 4, [0.5, 0.5, 0.5], 'azaleaPlant'),
   plane(16, 16, [0, 0, 16, 16], -Math.PI / 4, [0.5, 0.5, 0.5], 'azaleaPlant')
  );
  return true;
 }

 // Leaves (alpha cutout)
 if (LEAVES_KEYS[n]) {
  add([0, 0, 0, 16, 16, 16], LEAVES_KEYS[n]);
  return true;
 }

 // Amethyst clusters & buds
 if (n === 'amethyst_cluster' || n === 'large_amethyst_bud' || n === 'medium_amethyst_bud' || n === 'small_amethyst_bud') {
  const k = n === 'amethyst_cluster' ? 'amethystCluster'
   : n === 'large_amethyst_bud' ? 'largeAmethystBud'
   : n === 'medium_amethyst_bud' ? 'mediumAmethystBud' : 'smallAmethystBud';
  out.push(
   plane(16, 16, [0, 0, 16, 16], Math.PI / 4, [0.5, 0.5, 0.5], k),
   plane(16, 16, [0, 0, 16, 16], -Math.PI / 4, [0.5, 0.5, 0.5], k)
  );
  const face = parseFacing(s['minecraft:block_face'], 'up');
  if (face === 'down') rotate(out, h.axisX, Math.PI);
  else if (face !== 'up') orient(out, face, 'up');
  return true;
 }

 // Cocoa pod on jungle log
 if (n === 'cocoa') {
  const age = Math.min(2, Math.max(0, s.age ?? 0));
  const cKey = age === 0 ? 'cocoa0' : age === 1 ? 'cocoa1' : 'cocoa2';
  const dims = [[6, 5, 11, 10, 10, 15], [5, 4, 9, 11, 11, 15], [4, 3, 7, 12, 12, 15]][age];
  add(dims, cKey);
  orient(out, CARDINAL_LIST[s.direction ?? 0], 'south');
  return true;
 }

 // Kelp & Sugar Cane & Tall Flowers
 if (n === 'kelp' || n === 'reeds') {
  const k = n === 'kelp' ? 'kelp' : 'reeds';
  out.push(
   plane(16, 16, [0, 0, 16, 16], Math.PI / 4, [0.5, 0.5, 0.5], k),
   plane(16, 16, [0, 0, 16, 16], -Math.PI / 4, [0.5, 0.5, 0.5], k)
  );
  return true;
 }
 if (DOUBLE_PLANTS[n]) {
  const [lo, hi] = DOUBLE_PLANTS[n];
  const k = s.upper_block_bit ? hi : lo;
  out.push(
   plane(16, 16, [0, 0, 16, 16], Math.PI / 4, [0.5, 0.5, 0.5], k),
   plane(16, 16, [0, 0, 16, 16], -Math.PI / 4, [0.5, 0.5, 0.5], k)
  );
  return true;
 }

 // Grass block, Farmland, Dried Kelp, Crimson Nylium
 if (n === 'grass_block') {
  add([0, 0, 0, 16, 16, 16], ['grassSide', 'grassSide', 'grassTop', 'dirt', 'grassSide', 'grassSide']);
  return true;
 }
 if (n === 'farmland') {
  const wet = (s.moisturized_amount ?? 0) > 0;
  add([0, 0, 0, 16, 15, 16], ['dirt', 'dirt', wet ? 'farmlandWet' : 'farmlandDry', 'dirt', 'dirt', 'dirt']);
  return true;
 }
 if (n === 'dried_kelp_block') {
  add([0, 0, 0, 16, 16, 16], ['driedKelpSide', 'driedKelpSide', 'driedKelpTop', 'driedKelpTop', 'driedKelpSide', 'driedKelpSide']);
  return true;
 }
 if (n === 'crimson_nylium') {
  add([0, 0, 0, 16, 16, 16], ['crimsonNyliumSide', 'crimsonNyliumSide', 'crimsonNyliumTop', 'netherrack', 'crimsonNyliumSide', 'crimsonNyliumSide']);
  return true;
 }

 return false;
}

export const FARM_LABELS = {
 piston: 'Pistão',
 sticky_piston: 'Pistão grudento',
 piston_arm_collision: 'Braço de pistão',
 sticky_piston_arm_collision: 'Braço de pistão grudento',
 observer: 'Observador',
 dispenser: 'Ejetor',
 dropper: 'Liberador',
 crafter: 'Bancada automática',
 hopper: 'Funil',
 redstone_wire: 'Pó de Redstone',
 redstone_torch: 'Tocha de Redstone',
 unlit_redstone_torch: 'Tocha de Redstone apagada',
 copper_torch: 'Tocha de cobre',
 soul_torch: 'Tocha das almas',
 unpowered_repeater: 'Repetidor de Redstone',
 powered_repeater: 'Repetidor energizado',
 unpowered_comparator: 'Comparador de Redstone',
 powered_comparator: 'Comparador energizado',
 redstone_block: 'Bloco de Redstone',
 redstone_lamp: 'Lâmpada de Redstone',
 lit_redstone_lamp: 'Lâmpada de Redstone acesa',
 copper_bulb: 'Lâmpada de cobre',
 exposed_copper_bulb: 'Lâmpada de cobre exposto',
 weathered_copper_bulb: 'Lâmpada de cobre desgastado',
 oxidized_copper_bulb: 'Lâmpada de cobre oxidado',
 waxed_copper_bulb: 'Lâmpada de cobre encerado',
 waxed_exposed_copper_bulb: 'Lâmpada de cobre exposto encerado',
 waxed_weathered_copper_bulb: 'Lâmpada de cobre desgastado encerado',
 waxed_oxidized_copper_bulb: 'Lâmpada de cobre oxidado encerado',
 lever: 'Alavanca',
 stone_button: 'Botão de pedra',
 wooden_button: 'Botão de carvalho',
 spruce_button: 'Botão de abeto',
 dark_oak_button: 'Botão de carvalho escuro',
 crimson_button: 'Botão carmesim',
 birch_button: 'Botão de bétula',
 bamboo_button: 'Botão de bambu',
 polished_blackstone_button: 'Botão de pedra-negra polida',
 stone_pressure_plate: 'Placa de pressão de pedra',
 wooden_pressure_plate: 'Placa de pressão de madeira',
 light_weighted_pressure_plate: 'Placa de pressão de ouro',
 heavy_weighted_pressure_plate: 'Placa de pressão de ferro',
 target: 'Alvo',
 noteblock: 'Bloco musical',
 tnt: 'Dinamite',
 slime: 'Bloco de slime',
 honey_block: 'Bloco de mel',
 chiseled_bookshelf: 'Estante cinzelada',
 sculk_sensor: 'Sensor de vibrações (Sculk)',
 calibrated_sculk_sensor: 'Sensor de vibrações calibrado',
 daylight_detector: 'Detector de luz solar',
 daylight_detector_inverted: 'Detector de luz solar invertido',
 lightning_rod: 'Para-raios',
 chest: 'Baú',
 trapped_chest: 'Baú com armadilha',
 ender_chest: 'Baú do Ender',
 copper_chest: 'Baú de cobre',
 composter: 'Composteira',
 rail: 'Trilho',
 golden_rail: 'Trilho elétrico',
 detector_rail: 'Trilho detector',
 activator_rail: 'Trilho ativador',
 water: 'Água',
 flowing_water: 'Água corrente',
 lava: 'Lava',
 flowing_lava: 'Lava corrente',
 moss_block: 'Bloco de musgo',
 moss_carpet: 'Carpete de musgo',
 azalea: 'Azaleia',
 flowering_azalea: 'Azaleia florida',
 azalea_leaves: 'Folhas de azaleia',
 azalea_leaves_flowered: 'Folhas de azaleia florida',
 amethyst_block: 'Bloco de ametista',
 budding_amethyst: 'Drusa de ametista',
 amethyst_cluster: 'Agregado de ametista',
 large_amethyst_bud: 'Cristal de ametista grande',
 medium_amethyst_bud: 'Cristal de ametista médio',
 small_amethyst_bud: 'Cristal de ametista pequeno',
 cocoa: 'Cacau',
 jungle_log: 'Tora da selva',
 stripped_jungle_log: 'Tora da selva descascada',
 jungle_planks: 'Tábuas da selva',
 jungle_leaves: 'Folhas da selva',
 oak_leaves: 'Folhas de carvalho',
 spruce_leaves: 'Folhas de abeto',
 dark_oak_leaves: 'Folhas de carvalho escuro',
 kelp: 'Alga',
 dried_kelp_block: 'Bloco de algas secas',
 reeds: 'Cana-de-açúcar',
 rose_bush: 'Roseira',
 peony: 'Peônia',
 lilac: 'Lilás',
 sunflower: 'Girassol',
 dirt: 'Terra',
 coarse_dirt: 'Terra infértil',
 grass_block: 'Bloco de grama',
 farmland: 'Terra arada',
 stone: 'Pedra',
 cobblestone: 'Pedregulho',
 smooth_stone: 'Pedra lisa',
 smooth_stone_slab: 'Laje de pedra lisa',
 stone_bricks: 'Tijolos de pedra',
 stone_brick_slab: 'Laje de tijolos de pedra',
 stone_brick_stairs: 'Escadas de tijolos de pedra',
 stone_brick_wall: 'Muro de tijolos de pedra',
 obsidian: 'Obsidiana',
 netherrack: 'Netherrack',
 magma: 'Bloco de magma',
 soul_sand: 'Areia das almas',
 ice: 'Gelo',
 calcite: 'Calcita',
 tuff: 'Tufo',
 deepslate: 'Ardosiabissal',
 cobbled_deepslate: 'Pedregulho de ardosiabissal',
 deepslate_bricks: 'Tijolos de ardosiabissal',
 polished_deepslate: 'Ardosiabissal polida',
 iron_block: 'Bloco de ferro',
 gold_block: 'Bloco de ouro',
 quartz_block: 'Bloco de quartzo',
 crimson_stem: 'Caule carmesim',
 crimson_nylium: 'Nicélio carmesim',
 nether_wart_block: 'Bloco de fungos do Nether',
 sea_lantern: 'Lanterna do mar',
};
