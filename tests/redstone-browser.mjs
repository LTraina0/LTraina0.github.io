import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.SITE_URL || 'http://127.0.0.1:4321';

// Showcase model exercising all Phase 1 Redstone, farm, fluid, crop, and 1.21+ blocks.
const showcaseBlocks = [
 { x: 0, y: 0, z: 0, name: 'minecraft:stone', states: {} },
 { x: 1, y: 0, z: 0, name: 'minecraft:cobblestone', states: {} },
 { x: 2, y: 0, z: 0, name: 'minecraft:smooth_stone', states: {} },
 { x: 3, y: 0, z: 0, name: 'minecraft:dirt', states: {} },
 { x: 4, y: 0, z: 0, name: 'minecraft:grass_block', states: {} },
 { x: 5, y: 0, z: 0, name: 'minecraft:farmland', states: { moisturized_amount: 7 } },
 { x: 6, y: 0, z: 0, name: 'minecraft:moss_block', states: {} },
 { x: 7, y: 0, z: 0, name: 'minecraft:budding_amethyst', states: {} },
 { x: 8, y: 0, z: 0, name: 'minecraft:amethyst_block', states: {} },
 { x: 9, y: 0, z: 0, name: 'minecraft:dried_kelp_block', states: {} },
 { x: 10, y: 0, z: 0, name: 'minecraft:obsidian', states: {} },
 { x: 11, y: 0, z: 0, name: 'minecraft:netherrack', states: {} },
 { x: 12, y: 0, z: 0, name: 'minecraft:magma', states: {} },
 { x: 13, y: 0, z: 0, name: 'minecraft:soul_sand', states: {} },
 { x: 14, y: 0, z: 0, name: 'minecraft:calcite', states: {} },
 { x: 15, y: 0, z: 0, name: 'minecraft:tuff', states: {} },

 { x: 0, y: 1, z: 0, name: 'minecraft:redstone_wire', states: { redstone_signal: 15 } },
 { x: 1, y: 1, z: 0, name: 'minecraft:redstone_wire', states: { redstone_signal: 0 } },
 { x: 2, y: 1, z: 0, name: 'minecraft:unpowered_repeater', states: { 'minecraft:cardinal_direction': 'south', repeater_delay: 2 } },
 { x: 3, y: 1, z: 0, name: 'minecraft:powered_repeater', states: { 'minecraft:cardinal_direction': 'east', repeater_delay: 3 } },
 { x: 4, y: 1, z: 0, name: 'minecraft:unpowered_comparator', states: { 'minecraft:cardinal_direction': 'west', output_lit_bit: false, output_subtract_bit: true } },
 { x: 5, y: 1, z: 0, name: 'minecraft:powered_comparator', states: { 'minecraft:cardinal_direction': 'north', output_lit_bit: true, output_subtract_bit: false } },
 { x: 6, y: 1, z: 0, name: 'minecraft:redstone_torch', states: { torch_facing_direction: 'top' } },
 { x: 7, y: 1, z: 0, name: 'minecraft:unlit_redstone_torch', states: { torch_facing_direction: 'top' } },
 { x: 8, y: 1, z: 0, name: 'minecraft:lever', states: { lever_direction: 'up_north_south', open_bit: true } },
 { x: 9, y: 1, z: 0, name: 'minecraft:stone_button', states: { facing_direction: 1, button_pressed_bit: false } },
 { x: 10, y: 1, z: 0, name: 'minecraft:stone_pressure_plate', states: { redstone_signal: 15 } },
 { x: 11, y: 1, z: 0, name: 'minecraft:rail', states: { rail_direction: 0 } },
 { x: 12, y: 1, z: 0, name: 'minecraft:golden_rail', states: { rail_direction: 1, rail_data_bit: true } },
 { x: 13, y: 1, z: 0, name: 'minecraft:detector_rail', states: { rail_direction: 0, rail_data_bit: false } },
 { x: 14, y: 1, z: 0, name: 'minecraft:activator_rail', states: { rail_direction: 0, rail_data_bit: true } },
 { x: 15, y: 1, z: 0, name: 'minecraft:composter', states: { composter_fill_level: 7 } },

 { x: 0, y: 0, z: 2, name: 'minecraft:piston', states: { facing_direction: 1 } },
 { x: 1, y: 0, z: 2, name: 'minecraft:sticky_piston', states: { facing_direction: 4 } },
 { x: 2, y: 0, z: 2, name: 'minecraft:observer', states: { 'minecraft:facing_direction': 'north', powered_bit: true } },
 { x: 3, y: 0, z: 2, name: 'minecraft:dispenser', states: { facing_direction: 3 } },
 { x: 4, y: 0, z: 2, name: 'minecraft:dropper', states: { facing_direction: 0 } },
 { x: 5, y: 0, z: 2, name: 'minecraft:crafter', states: { orientation: 'south_up', crafting: true } },
 { x: 6, y: 0, z: 2, name: 'minecraft:hopper', states: { facing_direction: 4, toggle_bit: false } },
 { x: 7, y: 0, z: 2, name: 'minecraft:redstone_block', states: {} },
 { x: 8, y: 0, z: 2, name: 'minecraft:redstone_lamp', states: {} },
 { x: 9, y: 0, z: 2, name: 'minecraft:lit_redstone_lamp', states: {} },
 { x: 10, y: 0, z: 2, name: 'minecraft:copper_bulb', states: { lit: false } },
 { x: 11, y: 0, z: 2, name: 'minecraft:exposed_copper_bulb', states: { lit: true } },
 { x: 12, y: 0, z: 2, name: 'minecraft:weathered_copper_bulb', states: { lit: true } },
 { x: 13, y: 0, z: 2, name: 'minecraft:oxidized_copper_bulb', states: { lit: true } },
 { x: 14, y: 0, z: 2, name: 'minecraft:target', states: {} },
 { x: 15, y: 0, z: 2, name: 'minecraft:noteblock', states: {} },

 { x: 0, y: 1, z: 2, name: 'minecraft:sculk_sensor', states: { sculk_sensor_phase: 1 } },
 { x: 1, y: 1, z: 2, name: 'minecraft:calibrated_sculk_sensor', states: { 'minecraft:cardinal_direction': 'east', sculk_sensor_phase: 0 } },
 { x: 2, y: 1, z: 2, name: 'minecraft:daylight_detector', states: { redstone_signal: 10 } },
 { x: 3, y: 1, z: 2, name: 'minecraft:daylight_detector_inverted', states: { redstone_signal: 5 } },
 { x: 4, y: 1, z: 2, name: 'minecraft:lightning_rod', states: { facing_direction: 1 } },
 { x: 5, y: 1, z: 2, name: 'minecraft:chest', states: { 'minecraft:cardinal_direction': 'south' } },
 { x: 6, y: 1, z: 2, name: 'minecraft:trapped_chest', states: { 'minecraft:cardinal_direction': 'south' } },
 { x: 7, y: 1, z: 2, name: 'minecraft:ender_chest', states: { 'minecraft:cardinal_direction': 'south' } },
 { x: 8, y: 1, z: 2, name: 'minecraft:chiseled_bookshelf', states: { direction: 0, books_stored: 5 } },
 { x: 9, y: 1, z: 2, name: 'minecraft:tnt', states: {} },
 { x: 10, y: 1, z: 2, name: 'minecraft:slime', states: {} },
 { x: 11, y: 1, z: 2, name: 'minecraft:honey_block', states: {} },
 { x: 12, y: 1, z: 2, name: 'minecraft:water', states: { liquid_depth: 0 } },
 { x: 13, y: 1, z: 2, name: 'minecraft:lava', states: { liquid_depth: 0 } },
 { x: 14, y: 1, z: 2, name: 'minecraft:azalea', states: {} },
 { x: 15, y: 1, z: 2, name: 'minecraft:flowering_azalea', states: {} },

 { x: 0, y: 2, z: 2, name: 'minecraft:amethyst_cluster', states: { 'minecraft:block_face': 'up' } },
 { x: 1, y: 2, z: 2, name: 'minecraft:large_amethyst_bud', states: { 'minecraft:block_face': 'up' } },
 { x: 2, y: 2, z: 2, name: 'minecraft:medium_amethyst_bud', states: { 'minecraft:block_face': 'up' } },
 { x: 3, y: 2, z: 2, name: 'minecraft:small_amethyst_bud', states: { 'minecraft:block_face': 'up' } },
 { x: 4, y: 2, z: 2, name: 'minecraft:jungle_log', states: { pillar_axis: 'y' } },
 { x: 5, y: 2, z: 2, name: 'minecraft:cocoa', states: { direction: 1, age: 2 } },
 { x: 6, y: 2, z: 2, name: 'minecraft:kelp', states: { kelp_age: 2 }, waterlogged: true },
 { x: 7, y: 2, z: 2, name: 'minecraft:reeds', states: { age: 0 } },
 { x: 8, y: 2, z: 2, name: 'minecraft:rose_bush', states: { upper_block_bit: true } },
 { x: 9, y: 2, z: 2, name: 'minecraft:peony', states: { upper_block_bit: true } },
 { x: 10, y: 2, z: 2, name: 'minecraft:lilac', states: { upper_block_bit: true } },
 { x: 11, y: 2, z: 2, name: 'minecraft:sunflower', states: { upper_block_bit: true } },
 { x: 12, y: 2, z: 2, name: 'minecraft:oak_leaves', states: {} },
 { x: 13, y: 2, z: 2, name: 'minecraft:spruce_leaves', states: {} },
 { x: 14, y: 2, z: 2, name: 'minecraft:azalea_leaves', states: {} },
 { x: 15, y: 2, z: 2, name: 'minecraft:azalea_leaves_flowered', states: {} },
];

const showcaseModel = {
 size: [16, 3, 4],
 worldOrigin: [0, 0, 0],
 blocks: showcaseBlocks,
 entities: [{ identifier: 'minecraft:hopper_minecart', position: [11.5, 1.0625, 0.5], rotation: [0, 0] }],
};

const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
try {
 const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
 page.on('pageerror', e => errors.push(e.message));
 await page.route('**/model.json*', route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(showcaseModel),
 }));
 await page.goto(root + '/?build=bamboo&theme=day');
 await page.waitForFunction(() => window.BuildsMineInspector?.snapshot().ready, { timeout: 90000 });
 const snap = await page.evaluate(() => BuildsMineInspector.snapshot());
 assert.equal(snap.blocks, showcaseBlocks.length);
 assert.deepEqual(snap.rendering.textureFailures, [], 'All farm/redstone textures must load without 404');
 // Test layer cut (Y=0)
 await page.evaluate(() => BuildsMineInspector.execute('buildsmine_view', { id: 'mode', value: 'layer' }));
 await page.evaluate(() => BuildsMineInspector.execute('buildsmine_view', { id: 'step', value: '0' }));
 const layer0 = await page.evaluate(() => BuildsMineInspector.snapshot());
 assert.equal(layer0.visible, showcaseBlocks.filter(b => b.y === 0).length);
 // Test picking/inspecting non-cubic redstone block
 await page.evaluate(() => BuildsMineInspector.execute('buildsmine_view', { id: 'mode', value: 'all' }));
 const sel = await page.evaluate(() => BuildsMineInspector.execute('buildsmine_select', { x: 6, y: 0, z: 2 }));
 assert.equal(sel.id, 'minecraft:hopper');
 const selText = await page.locator('#selection').innerText();
 assert.ok(selText.includes('Funil') && selText.includes('oeste'), 'Selection must display PT-BR label and direction');
 // Open materials list
 await page.getByRole('button', { name: 'Materiais', exact: true }).click();
 const matCount = await page.locator('#material-list .material-row').count();
 assert.ok(matCount >= 60, `Expected >= 60 distinct materials, got ${matCount}`);
 assert.deepEqual(errors, [], 'Zero page errors');
 console.log(JSON.stringify({ ok: true, blocks: snap.blocks, materials: matCount, textureFailures: snap.rendering.textureFailures }));
} finally {
 await browser.close();
}
