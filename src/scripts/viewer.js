import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createBlockRenderer } from './block-renderer.js';
import { FARM_LABELS, parseFacing } from './redstone-blocks.js';
import { createFarmDemo } from './farm-demo.js';
import { createAtmosphere } from './atmosphere.js';
import { installFlightControls } from './wasd-controls.js';
import { installTouchpadControls } from './touchpad-controls.js';

const modelUrls = {
 'bamboo-tower': '/model-tower-v1.json',
 'andorinha-v1': '/model-andorinha-v1.json',
 'andorinha-v1-teste-a': '/model-andorinha-v1-teste-a.json',
 'andorinha-v1-teste-b': '/model-andorinha-v1-teste-b.json',
 'andorinha-v3': '/model-andorinha-v3.json',
 'andorinha-estudos': '/model-andorinha-estudos.json',
 'farm-musgo-v1': '/model-farm-musgo-v1.json',
 'farm-musgo': '/model-farm-musgo.json',
};

const $ = s => document.querySelector(s);
const buildId = $('#build').value;
const resolvedModelUrl = modelUrls[buildId] || '/model.json';
const model = await (await fetch(resolvedModelUrl, { cache: 'no-cache' })).json();
const blocks = model.blocks.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
blocks.forEach((b, i) => { b.order = i; });

const height = model.size[1];
const modelCenter = new THREE.Vector3(...model.size.map(v => v / 2));
const modules = model.modules ?? [];
const front = new THREE.Vector3(...(model.orientation?.front ?? [0, 0, 1])).normalize();

if (modules.length) {
 $('#part').replaceChildren(new Option('Todas as partes', 'all'), ...modules.map(m => new Option(m.label, m.id)));
} else if (buildId !== 'bamboo') {
 $('#part').replaceChildren(new Option('Todas as partes', 'all'));
 $('#part').disabled = true;
}
$('#step').max = blocks.length;
$('#step').value = blocks.length;

const counts = new Map();
for (const b of blocks) counts.set(b.name, (counts.get(b.name) || 0) + 1);

const labels = {
 ...FARM_LABELS,
 mud_brick_stairs: 'Escada de tijolos de barro', bamboo_trapdoor: 'Alçapão de bambu', bamboo_slab: 'Laje de bambu',
 bamboo_mosaic_slab: 'Laje de mosaico de bambu', bamboo_block: 'Bloco de bambu', birch_slab: 'Laje de bétula',
 mud_bricks: 'Tijolos de barro', stripped_bamboo_block: 'Bloco de bambu descascado', bamboo_stairs: 'Escada de bambu',
 bamboo_mosaic: 'Mosaico de bambu', bamboo_planks: 'Tábuas de bambu', birch_planks: 'Tábuas de bétula',
 lantern: 'Lanterna', iron_chain: 'Corrente de ferro', iron_bars: 'Grades de ferro', torch: 'Tocha',
 mud_brick_wall: 'Muro de tijolos de barro', bamboo_fence: 'Cerca de bambu', shroomlight: 'Luz de fungo',
 scaffolding: 'Andaime', mud_brick_slab: 'Laje de tijolos de barro', bamboo_double_slab: 'Laje dupla de bambu',
 birch_double_slab: 'Laje dupla de bétula', bell: 'Sino', bamboo: 'Bambu', bamboo_fence_gate: 'Portão de bambu',
 stripped_birch_log: 'Tronco de bétula descascado', ochre_froglight: 'Anfibrilho ocre',
 pearlescent_froglight: 'Anfibrilho perolado', mud_brick_double_slab: 'Laje dupla de tijolos de barro',
 spruce_planks: 'Tábuas de abeto', spruce_stairs: 'Escadas de abeto', spruce_slab: 'Laje de abeto',
 spruce_trapdoor: 'Alçapão de abeto', spruce_log: 'Tora de abeto', stripped_spruce_log: 'Tora de abeto descascada',
 spruce_fence: 'Cerca de abeto', spruce_door: 'Porta de abeto', dark_oak_door: 'Porta de carvalho escuro',
 dark_oak_planks: 'Tábuas de carvalho escuro', dark_oak_stairs: 'Escadas de carvalho escuro',
 dark_oak_slab: 'Laje de carvalho escuro', dark_oak_trapdoor: 'Alçapão de carvalho escuro',
 dark_oak_log: 'Tora de carvalho escuro', stripped_dark_oak_log: 'Tora de carvalho escuro descascada',
 dark_oak_fence: 'Cerca de carvalho escuro', pale_oak_shelf: 'Prateleira de carvalho pálido',
 oak_log: 'Tora de carvalho', stripped_oak_log: 'Tora de carvalho descascada', oak_stairs: 'Escadas de carvalho',
 oak_slab: 'Laje de carvalho', trapdoor: 'Alçapão de carvalho', crimson_planks: 'Tábuas carmesins',
 crimson_stairs: 'Escadas carmesins', crimson_slab: 'Laje carmesim', crimson_trapdoor: 'Alçapão carmesim',
 crimson_fence: 'Cerca carmesim', crimson_door: 'Porta carmesim',
 stripped_crimson_stem: 'Caule carmesim descascado', stripped_crimson_hyphae: 'Hifas carmesins descascadas',
 red_nether_brick: 'Tijolos vermelhos do Nether', red_nether_brick_slab: 'Laje de tijolos vermelhos do Nether',
 red_nether_brick_stairs: 'Escadas de tijolos vermelhos do Nether',
 red_nether_brick_wall: 'Muro de tijolos vermelhos do Nether', nether_brick_wall: 'Muro de tijolos do Nether',
 chiseled_nether_bricks: 'Tijolos do Nether cinzelados',
 polished_blackstone_bricks: 'Tijolos de pedra-negra polida',
 polished_blackstone_brick_slab: 'Laje de tijolos de pedra-negra polida',
 polished_blackstone_brick_stairs: 'Escadas de tijolos de pedra-negra polida',
 polished_blackstone_brick_wall: 'Muro de tijolos de pedra-negra polida',
 chiseled_polished_blackstone: 'Pedra-negra polida cinzelada',
 oxidized_cut_copper: 'Cobre lapidado oxidado', oxidized_cut_copper_stairs: 'Escadas de cobre lapidado oxidado',
 waxed_oxidized_cut_copper_slab: 'Laje de cobre lapidado oxidado encerado',
 waxed_weathered_cut_copper: 'Cobre lapidado desgastado encerado',
 waxed_cut_copper_slab: 'Laje de cobre lapidado encerado', copper_bars: 'Grades de cobre',
 exposed_copper_bars: 'Grades de cobre exposto', weathered_copper_bars: 'Grades de cobre desgastado',
 oxidized_copper_bars: 'Grades de cobre oxidado', waxed_copper_bars: 'Grades de cobre encerado',
 waxed_exposed_copper_bars: 'Grades de cobre exposto encerado',
 waxed_weathered_copper_bars: 'Grades de cobre desgastado encerado',
 waxed_oxidized_copper_bars: 'Grades de cobre oxidado encerado',
 copper_chain: 'Corrente de cobre', exposed_copper_chain: 'Corrente de cobre exposto',
 weathered_copper_chain: 'Corrente de cobre desgastado', oxidized_copper_chain: 'Corrente de cobre oxidado',
 waxed_copper_chain: 'Corrente de cobre encerado', waxed_exposed_copper_chain: 'Corrente de cobre exposto encerado',
 waxed_weathered_copper_chain: 'Corrente de cobre desgastado encerado',
 waxed_oxidized_copper_chain: 'Corrente de cobre oxidado encerado',
 copper_lantern: 'Lanterna de cobre', exposed_copper_lantern: 'Lanterna de cobre exposto',
 weathered_copper_lantern: 'Lanterna de cobre desgastado', oxidized_copper_lantern: 'Lanterna de cobre oxidado',
 waxed_copper_lantern: 'Lanterna de cobre encerado', waxed_exposed_copper_lantern: 'Lanterna de cobre exposto encerado',
 waxed_weathered_copper_lantern: 'Lanterna de cobre desgastado encerado',
 waxed_oxidized_copper_lantern: 'Lanterna de cobre oxidado encerado',
 soul_lantern: 'Lanterna das almas', white_candle: 'Vela branca', light_gray_candle: 'Vela cinza-clara',
 sea_pickle: 'Pepino-do-mar', glow_lichen: 'Líquen brilhante', andesite_stairs: 'Escadas de andesito',
 mangrove_stairs: 'Escadas de mangue', white_wool: 'Lã branca', white_wool_slab: 'Laje de lã branca',
 black_wool: 'Lã preta', black_carpet: 'Carpete preto', light_gray_wool: 'Lã cinza-clara',
 light_gray_wool_slab: 'Laje de lã cinza-clara', blue_ice: 'Gelo azul', packed_ice: 'Gelo compactado',
 snow_layer: 'Camada de neve', brown_stained_glass: 'Vidro tingido de marrom', glass: 'Vidro transparente',
 glass_pane: 'Vidraça transparente', tinted_glass: 'Vidro fumê',
 light_gray_stained_glass: 'Vidro tingido de cinza-claro',
 light_gray_stained_glass_pane: 'Vidraça tingida de cinza-claro',
 pink_stained_glass: 'Vidro tingido de rosa', pink_stained_glass_pane: 'Vidraça tingida de rosa',
 white_stained_glass: 'Vidro tingido de branco', white_stained_glass_pane: 'Vidraça tingida de branco',
 red_stained_glass: 'Vidro tingido de vermelho', red_stained_glass_pane: 'Vidraça tingida de vermelho',
 orange_stained_glass: 'Vidro tingido de laranja', orange_stained_glass_pane: 'Vidraça tingida de laranja',
 magenta_stained_glass: 'Vidro tingido de magenta', magenta_stained_glass_pane: 'Vidraça tingida de magenta',
 purple_stained_glass: 'Vidro tingido de roxo', purple_stained_glass_pane: 'Vidraça tingida de roxo',
 yellow_stained_glass: 'Vidro tingido de amarelo', yellow_stained_glass_pane: 'Vidraça tingida de amarelo',
 glowstone: 'Pedra luminosa', ladder: 'Escada de mão', barrel: 'Barril',
};

const id = b => b.name.split(':')[1];
const label = b => labels[id(b)] || id(b);
const coord = new Map(blocks.map(b => [`${b.x},${b.y},${b.z}`, b]));

// Flat 3D voxel index for O(1) zero-allocation DDA raycasting.
let gridMinX = Infinity, gridMinY = Infinity, gridMinZ = Infinity;
let gridMaxX = -Infinity, gridMaxY = -Infinity, gridMaxZ = -Infinity;
for (let i = 0; i < blocks.length; i++) {
 const b = blocks[i];
 if (b.x < gridMinX) gridMinX = b.x;
 if (b.y < gridMinY) gridMinY = b.y;
 if (b.z < gridMinZ) gridMinZ = b.z;
 if (b.x > gridMaxX) gridMaxX = b.x;
 if (b.y > gridMaxY) gridMaxY = b.y;
 if (b.z > gridMaxZ) gridMaxZ = b.z;
}
const gridSpanX = blocks.length ? gridMaxX - gridMinX + 1 : 1;
const gridSpanY = blocks.length ? gridMaxY - gridMinY + 1 : 1;
const gridSpanZ = blocks.length ? gridMaxZ - gridMinZ + 1 : 1;
const gridSpanXY = gridSpanX * gridSpanY;
const voxelGrid = new Int32Array(gridSpanX * gridSpanY * gridSpanZ).fill(-1);
for (let i = 0; i < blocks.length; i++) {
 const b = blocks[i];
 voxelGrid[(b.x - gridMinX) + (b.y - gridMinY) * gridSpanX + (b.z - gridMinZ) * gridSpanXY] = i;
}
function voxelAt(x, y, z) {
 const lx = x - gridMinX, ly = y - gridMinY, lz = z - gridMinZ;
 if (lx < 0 || ly < 0 || lz < 0 || lx >= gridSpanX || ly >= gridSpanY || lz >= gridSpanZ) return null;
 const idx = voxelGrid[lx + ly * gridSpanX + lz * gridSpanXY];
 return idx >= 0 ? blocks[idx] : null;
}

let renderer;
try {
 renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (error) {
 $('#loading').textContent = 'Não foi possível iniciar o 3D neste navegador. Verifique a aceleração gráfica e tente novamente.';
 throw error;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setClearColor(0xdfe6df);
$('#canvas').append(renderer.domElement);
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('aria-label', 'Modelo 3D. Arraste para girar, use roda para zoom e botão direito para mover.');

const scene = new THREE.Scene();
const perspective = new THREE.PerspectiveCamera(37, 1, 0.1, 2000);
const ortho = new THREE.OrthographicCamera(-30, 30, 30, -30, 0.1, 2000);
let camera = perspective;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.target.copy(modelCenter);
controls.screenSpacePanning = true;
controls.minDistance = 0.5;
controls.maxDistance = 500;

const maxSpan = Math.max(80, model.size[0] + 40, model.size[2] + 40);
const sky = new THREE.HemisphereLight(0xffffff, 0xbdc6c7, 2.1);
scene.add(sky);
const sun = new THREE.DirectionalLight(0xfff7e9, 1.9);
sun.position.set(-maxSpan * 0.4, maxSpan * 0.7, maxSpan * 0.3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -maxSpan * 0.6, right: maxSpan * 0.6, top: maxSpan * 0.6, bottom: -maxSpan * 0.6, near: 1, far: maxSpan * 2.4 });
sun.shadow.bias = -0.00005;
sun.shadow.normalBias = 0.018;
sun.target.position.set(modelCenter.x, 0, modelCenter.z);
scene.add(sun, sun.target);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(maxSpan * 2, maxSpan * 2), new THREE.ShadowMaterial({ opacity: 0.16 }));
floor.rotation.x = -Math.PI / 2;
floor.position.set(modelCenter.x, -0.06, modelCenter.z);
floor.receiveShadow = true;
scene.add(floor);

const gridSize = Math.ceil(maxSpan / 2) * 2;
const grid = new THREE.GridHelper(gridSize, gridSize, 0x78888b, 0x78888b);
grid.position.set(Math.floor(modelCenter.x), -0.03, Math.floor(modelCenter.z));
grid.material.transparent = true;
grid.material.opacity = 0.32;
grid.visible = false;
scene.add(grid);

const outline = new THREE.Group();
const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x253326, transparent: true, opacity: 0.8, depthTest: true });
outline.visible = false;
scene.add(outline);

const edgeCache = new Map();
function stableStateSig(b) {
 const s = b.states;
 if (!s) return b.name;
 const ks = Object.keys(s);
 if (!ks.length) return b.name;
 ks.sort();
 return b.name + '|' + ks.map(k => k + '=' + s[k]).join('|');
}
function outlineBlock(b) {
 outline.clear();
 const sig = stableStateSig(b);
 let edgeGeoms = edgeCache.get(sig);
 if (!edgeGeoms) {
  edgeGeoms = [];
  for (const { g } of blockRenderer.parts(b)) {
   edgeGeoms.push(new THREE.EdgesGeometry(g, 25));
   g.dispose();
  }
  edgeCache.set(sig, edgeGeoms);
 }
 for (let i = 0; i < edgeGeoms.length; i++) {
  outline.add(new THREE.LineSegments(edgeGeoms[i], outlineMaterial));
 }
 outline.position.set(b.x, b.y, b.z);
 outline.visible = true;
}

const blockRenderer = await createBlockRenderer(blocks, scene);
const { batches, icons, materials, failures: textureFailures } = blockRenderer;
const atmosphere = createAtmosphere(scene, blocks);

// Cushions and farm minecarts are Bedrock entities, normalized against worldOrigin.
let cushionTexture = null;
let cushionMaterial = null;
let cushionGeometry = null;
let minecartMaterial = null;
let minecartGeometry = null;
let cushions = [];
const minecarts = [];
if (model.entities?.length) {
 const originVec = model.worldOrigin ?? [0, 0, 0];
 const cushionEntities = model.entities.filter(e => !e.identifier || e.identifier.includes('cushion'));
 const cartEntities = model.entities.filter(e => e.identifier && e.identifier.includes('minecart'));

 if (cushionEntities.length) {
  try {
   cushionTexture = await new THREE.TextureLoader().loadAsync('https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.60.5/resource_pack/textures/entity/cushion/green_cushion.png');
  } catch {
   textureFailures.push('entity/cushion/green_cushion.png');
   const canvas = document.createElement('canvas');
   canvas.width = canvas.height = 64;
   const ctx = canvas.getContext('2d');
   ctx.fillStyle = '#56751a';
   ctx.fillRect(0, 0, 64, 64);
   cushionTexture = new THREE.CanvasTexture(canvas);
  }
  cushionTexture.colorSpace = THREE.SRGBColorSpace;
  cushionTexture.magFilter = THREE.NearestFilter;
  cushionTexture.minFilter = THREE.NearestFilter;
  cushionMaterial = new THREE.MeshLambertMaterial({ map: cushionTexture });
  cushionGeometry = new THREE.BoxGeometry(15.98 / 16, 3.98 / 16, 15.98 / 16);
  const cushionUV = cushionGeometry.attributes.uv;
  const cushionRects = [[32, 16, 48, 20], [0, 16, 16, 20], [16, 0, 32, 16], [32, 0, 48, 16], [16, 16, 32, 20], [48, 16, 64, 20]];
  for (let f = 0; f < 6; f++) {
   const r = cushionRects[f];
   for (let j = f * 4; j < f * 4 + 4; j++) {
    cushionUV.setXY(j, (r[0] + cushionUV.getX(j) * (r[2] - r[0])) / 64, 1 - (r[1] + (1 - cushionUV.getY(j)) * (r[3] - r[1])) / 64);
   }
  }
  cushions = cushionEntities.map(entity => {
   const [x, y, z] = entity.position;
   const support = coord.get(`${Math.floor(x) - originVec[0]},${Math.floor(y) - originVec[1]},${Math.floor(z) - originVec[2]}`);
   if (!support) throw Error('Almofada sem escada de apoio');
   const mesh = new THREE.Mesh(cushionGeometry, cushionMaterial);
   mesh.position.set(x - originVec[0], y - originVec[1] - 0.125 / 16 + 3.98 / 32, z - originVec[2]);
   mesh.rotation.y = -THREE.MathUtils.degToRad(entity.rotation?.[0] ?? 0);
   mesh.castShadow = true;
   mesh.receiveShadow = true;
   scene.add(mesh);
   return { entity, support, mesh };
  });
 }

 if (cartEntities.length) {
  minecartMaterial = new THREE.MeshLambertMaterial({ color: 0x5c646d });
  minecartGeometry = new THREE.BoxGeometry(0.95, 0.56, 0.78);
  const hopperTopMat = new THREE.MeshLambertMaterial({ color: 0x3f4348 });
  const hopperTopGeo = new THREE.BoxGeometry(0.76, 0.28, 0.62);
  const chestTopMat = new THREE.MeshLambertMaterial({ color: 0x9c6e2c });
  const chestTopGeo = new THREE.BoxGeometry(0.72, 0.34, 0.6);
  for (const entity of cartEntities) {
   const [x, y, z] = entity.position;
   const lx = x - originVec[0], ly = y - originVec[1], lz = z - originVec[2];
   const group = new THREE.Group();
   const hull = new THREE.Mesh(minecartGeometry, minecartMaterial);
   hull.position.set(0, 0.32, 0);
   hull.castShadow = true;
   hull.receiveShadow = true;
   group.add(hull);
   if (entity.identifier.includes('hopper')) {
    const top = new THREE.Mesh(hopperTopGeo, hopperTopMat);
    top.position.set(0, 0.58, 0);
    top.castShadow = true;
    group.add(top);
   } else if (entity.identifier.includes('chest')) {
    const top = new THREE.Mesh(chestTopGeo, chestTopMat);
    top.position.set(0, 0.62, 0);
    top.castShadow = true;
    group.add(top);
   }
   group.position.set(lx, ly, lz);
   group.rotation.y = -THREE.MathUtils.degToRad(entity.rotation?.[0] ?? 0);
   scene.add(group);
   const support = coord.get(`${Math.floor(lx)},${Math.floor(ly)},${Math.floor(lz)}`) ?? coord.get(`${Math.floor(lx)},${Math.floor(ly) - 1},${Math.floor(lz)}`);
   minecarts.push({ entity, support, localY: Math.floor(ly), mesh: group });
  }
 }
}

if (textureFailures.length) {
 $('#texture-status').textContent = `${textureFailures.length} texturas não carregaram. Recarregue para conferir a aparência.`;
}

const moduleOf = b => b.module ?? (modules.length || buildId !== 'bamboo' ? 'all' : (b.z < 14 ? 'north' : b.z > 22 ? 'south' : b.x > 8 ? 'east' : 'house'));
let part = 'all';
let mode = 'all';
let step = blocks.length;

// Cache scoped blocks, block order, bounding boxes, and material counts per module.
let scopedCache = blocks;
const scopedOrder = new Int32Array(blocks.length);
const moduleBoxCache = new Map();
let materialsDirty = true;

function getScopeBox(scopePart) {
 let box = moduleBoxCache.get(scopePart);
 if (box) return box;
 box = new THREE.Box3();
 for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  if (scopePart === 'all' || moduleOf(b) === scopePart) {
   if (b.x < box.min.x) box.min.x = b.x;
   if (b.y < box.min.y) box.min.y = b.y;
   if (b.z < box.min.z) box.min.z = b.z;
   if (b.x + 1 > box.max.x) box.max.x = b.x + 1;
   if (b.y + 1 > box.max.y) box.max.y = b.y + 1;
   if (b.z + 1 > box.max.z) box.max.z = b.z + 1;
  }
 }
 moduleBoxCache.set(scopePart, box);
 return box;
}

function rebuildScope() {
 if (part === 'all') {
  scopedCache = blocks;
  for (let i = 0; i < blocks.length; i++) scopedOrder[i] = i;
 } else {
  scopedCache = [];
  for (let i = 0; i < blocks.length; i++) {
   const b = blocks[i];
   if (moduleOf(b) === part) {
    scopedOrder[i] = scopedCache.length;
    scopedCache.push(b);
   } else {
    scopedOrder[i] = -1;
   }
  }
 }
 materialsDirty = true;
}
rebuildScope();

function scopedBlocks() { return scopedCache; }
function scopeBox() { return getScopeBox(part); }

function drawMaterials() {
 const scoped = scopedCache;
 const byId = new Map();
 for (let i = 0; i < scoped.length; i++) {
  const name = scoped[i].name;
  byId.set(name, (byId.get(name) || 0) + 1);
 }
 const list = $('#material-list');
 const frag = document.createDocumentFragment();
 $('#material-summary').textContent = `${byId.size} materiais · ${scoped.length} blocos`;
 for (const [name, n] of [...byId].sort((a, b) => b[1] - a[1])) {
  const row = document.createElement('div');
  row.className = 'material-row';
  const slot = document.createElement('span');
  slot.className = 'item-slot';
  const img = document.createElement('img');
  img.src = icons[name];
  img.alt = '';
  slot.append(img);
  const nameEl = document.createElement('span');
  const num = document.createElement('strong');
  nameEl.className = 'item-name';
  nameEl.textContent = labels[name.split(':')[1]] || name;
  num.textContent = n;
  num.setAttribute('aria-label', `${n} unidades`);
  row.append(slot, nameEl, num);
  frag.append(row);
 }
 list.replaceChildren(frag);
 materialsDirty = false;
}

let demoHiddenSet = null;

function isBlockVisible(b) {
 if (part !== 'all' && moduleOf(b) !== part) return false;
 if (mode === 'all') return true;
 if (mode === 'block') return scopedOrder[b.order] < step;
 return b.y <= step;
}

function isRenderedBlockVisible(b) {
 return isBlockVisible(b) && (!demoHiddenSet || !demoHiddenSet.has(b));
}

function syncFilteredMeshes() {
 const accepts = isRenderedBlockVisible;
 blockRenderer.filter(accepts);
 atmosphere.filter(accepts);
 for (let i = 0; i < cushions.length; i++) cushions[i].mesh.visible = accepts(cushions[i].support);
 for (let i = 0; i < minecarts.length; i++) {
  const mc = minecarts[i];
  mc.mesh.visible = mc.support ? accepts(mc.support) : (mode !== 'layer' || mc.localY <= step);
 }
}

function update() {
 const scoped = scopedCache;
 syncFilteredMeshes();
 let visible = 0;
 if (mode === 'all') {
  visible = scoped.length;
 } else if (mode === 'block') {
  visible = Math.max(0, Math.min(scoped.length, step));
 } else {
  for (let i = 0; i < scoped.length; i++) if (scoped[i].y <= step) visible++;
 }
 if (!$('#material-dialog').hidden && materialsDirty) drawMaterials();
 $('#progress').textContent = `${visible} de ${scoped.length} blocos`;
 $('#step').disabled = mode === 'all';
 $('#prev').disabled = mode === 'all';
 $('#next').disabled = mode === 'all';
 $('#step-label').textContent = mode === 'all' ? 'Completa' : mode === 'layer' ? `Camada ${step + 1} de ${height}` : `${step} de ${scoped.length}`;
 clearSelection();
 renderer.shadowMap.needsUpdate = true;
 invalidate();
}

const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null, origin = null, pinned = false;

function clearSelection() {
 selected = null;
 pinned = false;
 outline.visible = false;
 $('#selection').hidden = true;
}

function ddaPick(raycaster) {
 const box = scopeBox();
 if (box.isEmpty()) return null;
 const ro = raycaster.ray.origin, rd = raycaster.ray.direction;

 let tMin = 0, tMax = Infinity;
 if (Math.abs(rd.x) < 1e-12) {
  if (ro.x < box.min.x || ro.x > box.max.x) return null;
 } else {
  let t1 = (box.min.x - ro.x) / rd.x, t2 = (box.max.x - ro.x) / rd.x;
  if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
  if (t1 > tMin) tMin = t1;
  if (t2 < tMax) tMax = t2;
  if (tMin > tMax) return null;
 }
 if (Math.abs(rd.y) < 1e-12) {
  if (ro.y < box.min.y || ro.y > box.max.y) return null;
 } else {
  let t1 = (box.min.y - ro.y) / rd.y, t2 = (box.max.y - ro.y) / rd.y;
  if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
  if (t1 > tMin) tMin = t1;
  if (t2 < tMax) tMax = t2;
  if (tMin > tMax) return null;
 }
 if (Math.abs(rd.z) < 1e-12) {
  if (ro.z < box.min.z || ro.z > box.max.z) return null;
 } else {
  let t1 = (box.min.z - ro.z) / rd.z, t2 = (box.max.z - ro.z) / rd.z;
  if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
  if (t1 > tMin) tMin = t1;
  if (t2 < tMax) tMax = t2;
  if (tMin > tMax) return null;
 }
 if (tMax < 0) return null;

 const tEntry = Math.min(tMax, tMin + 1e-5);
 let vx = Math.floor(ro.x + rd.x * tEntry);
 let vy = Math.floor(ro.y + rd.y * tEntry);
 let vz = Math.floor(ro.z + rd.z * tEntry);
 const originVx = Math.floor(ro.x), originVy = Math.floor(ro.y), originVz = Math.floor(ro.z);

 const stepX = rd.x > 0 ? 1 : rd.x < 0 ? -1 : 0;
 const stepY = rd.y > 0 ? 1 : rd.y < 0 ? -1 : 0;
 const stepZ = rd.z > 0 ? 1 : rd.z < 0 ? -1 : 0;
 const tDeltaX = stepX ? Math.abs(1 / rd.x) : Infinity;
 const tDeltaY = stepY ? Math.abs(1 / rd.y) : Infinity;
 const tDeltaZ = stepZ ? Math.abs(1 / rd.z) : Infinity;
 let tMaxX = stepX ? ((stepX > 0 ? vx + 1 : vx) - ro.x) / rd.x : Infinity;
 let tMaxY = stepY ? ((stepY > 0 ? vy + 1 : vy) - ro.y) / rd.y : Infinity;
 let tMaxZ = stepZ ? ((stepZ > 0 ? vz + 1 : vz) - ro.z) / rd.z : Infinity;
 let t = tEntry;
 const maxSteps = (gridSpanX + gridSpanY + gridSpanZ) * 2 + 8;

 for (let s = 0; s < maxSteps && t <= tMax + 1e-4; s++) {
  const b = voxelAt(vx, vy, vz);
  if (b && isBlockVisible(b)) {
   const insideOrigin = tMin === 0 && vx === originVx && vy === originVy && vz === originVz;
   if (!insideOrigin && blockRenderer.isOpaqueFullCube(b)) {
    return b;
   }
   if (blockRenderer.raycastBlock(raycaster, b)) {
    return b;
   }
  }
  if (tMaxX < tMaxY) {
   if (tMaxX < tMaxZ) { vx += stepX; t = tMaxX; tMaxX += tDeltaX; }
   else { vz += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; }
  } else {
   if (tMaxY < tMaxZ) { vy += stepY; t = tMaxY; tMaxY += tDeltaY; }
   else { vz += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; }
  }
 }
 return null;
}

function pick(e, pin = false) {
 const rect = renderer.domElement.getBoundingClientRect();
 pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
 ray.setFromCamera(pointer, camera);
 const b = ddaPick(ray);
 if (!b) {
  clearSelection();
  invalidate();
  return;
 }
 pinned = pin;
 showSelection(b);
}

function showSelection(b) {
 if (selected !== b) outlineBlock(b);
 selected = b;
 const panel = $('#selection');
 panel.replaceChildren();
 const close = document.createElement('button');
 close.className = 'selection-close';
 close.setAttribute('aria-label', 'Limpar seleção');
 close.textContent = '×';
 close.onclick = () => { clearSelection(); invalidate(); };
 panel.append(close);

 const strong = document.createElement('strong');
 const details = document.createElement('span');
 const small = document.createElement('small');
 strong.textContent = label(b);
 details.textContent = `${counts.get(b.name)} na construção · local X ${b.x}, Y ${b.y}, Z ${b.z}`;
 if (origin) {
  const world = document.createElement('small');
  world.textContent = `Mundo: X ${origin[0] + b.x}, Y ${origin[1] + b.y}, Z ${origin[2] + b.z}`;
  details.append(world);
 }
 const st = b.states || {}, descriptions = [];
 const dirNamesPT = { down: 'baixo', up: 'cima', north: 'norte', south: 'sul', west: 'oeste', east: 'leste' };
 if (st['minecraft:vertical_half']) descriptions.push(st['minecraft:vertical_half'] === 'top' ? 'metade superior' : 'metade inferior');
 if ('open_bit' in st) descriptions.push(st.open_bit ? 'aberto' : 'fechado');
 if ('upside_down_bit' in st) descriptions.push(st.upside_down_bit ? 'invertido' : 'normal');
 if (st.pillar_axis) descriptions.push('eixo ' + st.pillar_axis.toUpperCase());
 if (st['minecraft:corner'] && st['minecraft:corner'] !== 'none') descriptions.push('canto ' + st['minecraft:corner']);
 if (st.hanging) descriptions.push('pendurada');
 if ('facing_direction' in st || 'minecraft:facing_direction' in st) {
  const d = parseFacing(st['minecraft:facing_direction'] ?? st.facing_direction, '');
  if (d) descriptions.push('aponta para ' + (dirNamesPT[d] || d));
 }
 if (st['minecraft:cardinal_direction']) {
  const cd = st['minecraft:cardinal_direction'];
  descriptions.push('direção ' + (dirNamesPT[cd] || cd));
 }
 if (st.torch_facing_direction) descriptions.push('fixada em ' + (st.torch_facing_direction === 'top' ? 'topo' : (dirNamesPT[st.torch_facing_direction] || st.torch_facing_direction)));
 if (st['minecraft:block_face']) descriptions.push('face ' + (dirNamesPT[st['minecraft:block_face']] || st['minecraft:block_face']));
 if (st.orientation) descriptions.push('orientação ' + st.orientation);
 if ('repeater_delay' in st) descriptions.push(`atraso ${(st.repeater_delay ?? 0) + 1} tick(s) redstone`);
 if ('output_subtract_bit' in st) descriptions.push(st.output_subtract_bit ? 'modo subtração' : 'modo comparação');
 if ('redstone_signal' in st) descriptions.push(`sinal ${st.redstone_signal}/15`);
 if (st.powered_bit) descriptions.push('energizado');
 if (st.lit) descriptions.push('aceso');
 if (st.triggered_bit) descriptions.push('acionado');
 if (st.toggle_bit) descriptions.push(b.name === 'minecraft:hopper' ? 'travado' : 'alternado');
 if ('rail_direction' in st) descriptions.push('trilho dir. ' + st.rail_direction + (st.rail_data_bit ? ' (ativo)' : ''));
 if ('composter_fill_level' in st) descriptions.push(`nível ${st.composter_fill_level}/8`);
 if (st.lever_direction) descriptions.push('alavanca ' + st.lever_direction);
 if ('liquid_depth' in st) descriptions.push(st.liquid_depth === 0 ? 'bloco fonte' : `fluxo prof. ${st.liquid_depth}`);
 if ('age' in st) descriptions.push(`estágio ${st.age}`);
 if (b.waterlogged) descriptions.push('alagado (waterlogged)');
 if (descriptions.length) {
  const state = document.createElement('small');
  state.textContent = descriptions.join(' · ');
  panel.append(strong, details, state);
 } else panel.append(strong, details);

 small.textContent = `${b.name} · ${JSON.stringify(b.states)}`;
 const technical = document.createElement('details');
 const summary = document.createElement('summary');
 summary.textContent = 'Detalhes técnicos';
 technical.append(summary, small);
 panel.append(technical);

 const help = document.createElement('small');
 help.textContent = pinned ? 'Seleção fixada · Esc para limpar' : 'Clique para fixar a seleção';
 help.className = 'selection-help';
 panel.append(help);
 panel.hidden = false;
 invalidate();
}

let down = null, hoverTimer = 0;
renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointercancel', () => { down = null; });
renderer.domElement.addEventListener('pointerup', e => {
 if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) pick(e, true);
 down = null;
});
renderer.domElement.addEventListener('pointermove', e => {
 if (e.pointerType === 'mouse' && !e.buttons && !pinned && !flight.isActive()) {
  const now = performance.now();
  if (now - hoverTimer > 45) { hoverTimer = now; pick(e); }
 }
});
renderer.domElement.addEventListener('pointerleave', () => {
 if (!pinned) { clearSelection(); invalidate(); }
});

let pending = 0, dirty = false, frames = 0;
function invalidate() {
 dirty = true;
 if (!pending && !document.hidden) pending = requestAnimationFrame(frame);
}
function frame() {
 pending = 0;
 if (document.hidden) return;
 const changed = controls.update();
 if (dirty || changed) {
  renderer.render(scene, camera);
  frames++;
  dirty = false;
 }
 if (changed) invalidate();
}
controls.addEventListener('change', invalidate);
const onVisibilityChange = () => {
 if (document.hidden) { cancelAnimationFrame(pending); pending = 0; }
 else invalidate();
};
document.addEventListener('visibilitychange', onVisibilityChange);

const flight = installFlightControls({ controls, getCamera: () => camera, domElement: renderer.domElement, onMove: invalidate, getSpan: () => Math.max(...model.size) });
installTouchpadControls({ controls, getCamera: () => camera, domElement: renderer.domElement, onMove: invalidate, toggleButton: $('#drag-mode') });

let currentView = 'perspective', previousAspect = null;
const _corner = new THREE.Vector3();

function resize() {
 const w = $('#canvas').clientWidth, h = $('#canvas').clientHeight;
 if (!w || !h) return;
 renderer.setSize(w, h, false);
 const aspect = w / h;
 if (previousAspect && camera === perspective) {
  const factor = Math.max(1, 1 / aspect) / Math.max(1, 1 / previousAspect);
  const offset = perspective.position.clone().sub(controls.target).multiplyScalar(factor);
  perspective.position.copy(controls.target).add(offset);
  controls.update();
 }
 previousAspect = aspect;
 perspective.aspect = aspect;
 perspective.updateProjectionMatrix();

 ortho.updateMatrixWorld(true);
 let half = 1;
 const box = scopeBox();
 if (!box.isEmpty()) {
  const xs = [box.min.x, box.max.x], ys = [box.min.y, box.max.y], zs = [box.min.z, box.max.z];
  for (let ix = 0; ix < 2; ix++) for (let iy = 0; iy < 2; iy++) for (let iz = 0; iz < 2; iz++) {
   _corner.set(xs[ix], ys[iy], zs[iz]).applyMatrix4(ortho.matrixWorldInverse);
   half = Math.max(half, Math.abs(_corner.y), Math.abs(_corner.x) / aspect);
  }
 }
 const span = half * 2.3;
 ortho.left = -span * aspect / 2;
 ortho.right = span * aspect / 2;
 ortho.top = span / 2;
 ortho.bottom = -span / 2;
 ortho.updateProjectionMatrix();
 invalidate();
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe($('#canvas'));

function setView(view) {
 currentView = view;
 const sphere = scopeBox().getBoundingSphere(new THREE.Sphere()), target = sphere.center;
 const aspect = $('#canvas').clientWidth / $('#canvas').clientHeight;
 const angle = Math.atan(Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2)) * Math.min(1, aspect));
 const d = Math.max(8, sphere.radius / Math.sin(angle) * 1.12);
 const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), front);
 const dirs = {
  perspective: front.clone().multiplyScalar(1.3).add(right).add(new THREE.Vector3(0, 0.8, 0)),
  front,
  back: front.clone().negate(),
  left: right.clone().negate(),
  right,
  top: new THREE.Vector3(0, 1, 0.001),
  bottom: new THREE.Vector3(0, -1, 0.001),
 };
 const next = view === 'perspective' ? perspective : ortho;
 camera = next;
 controls.object = next;
 controls.target.copy(target);
 next.position.copy(target).add(dirs[view].clone().normalize().multiplyScalar(d));
 next.up.set(0, 1, 0);
 next.lookAt(target);
 controls.update();
 atmosphere.clouds.visible = atmosphere.backdrop === 'editor' && view !== 'top' && view !== 'bottom';
 resize();
 invalidate();
}

const initialBackdrop = new URLSearchParams(location.search).get('fundo') || new URLSearchParams(location.search).get('backdrop');
if (initialBackdrop && ['editor', 'classic'].includes(initialBackdrop) && $('#backdrop')) $('#backdrop').value = initialBackdrop;

function syncEnvironment(night = document.body.classList.contains('dark')) {
 const backdrop = $('#backdrop')?.value || 'editor';
 atmosphere.setBackdrop(backdrop);
 atmosphere.setEnvironment(night);
 sky.color.set(night ? 0xa6c1e8 : 0xffffff);
 sky.groundColor.set(night ? 0x8fa6cb : backdrop === 'editor' ? 0xc4dcfb : 0xbdc6c7);
 sky.intensity = night ? 1.65 : 2.05;
 sun.color.set(night ? 0xd5dfeb : 0xfff8ec);
 sun.intensity = night ? 0.8 : 1.9;
 floor.material.opacity = night ? (backdrop === 'editor' ? 0.05 : 0.10) : (backdrop === 'editor' ? 0.06 : 0.16);
 grid.material.color.set(night ? 0x7f929e : backdrop === 'editor' ? 0x7493bd : 0x78888b);
 grid.material.opacity = night ? 0.23 : 0.32;
 outlineMaterial.color.set(night ? 0xe8d8a3 : 0x253326);
 for (const k of ['lantern', 'soulLantern', 'copperLantern', 'exposedCopperLantern', 'weatheredCopperLantern', 'oxidizedCopperLantern']) {
  if (materials[k]) materials[k].emissiveIntensity = night ? 0.95 : 0.35;
 }
 if (materials.torch) materials.torch.emissiveIntensity = night ? 0.4 : 0.15;
 if (materials.shroom) materials.shroom.emissiveIntensity = night ? 0.45 : 0.2;
 blockRenderer.setEnvironment(night ? 'night' : 'day');
 invalidate();
}

$('#view').onchange = e => setView(e.target.value);
$('#fit').onclick = () => { $('#view').value = 'perspective'; setView('perspective'); };
$('#grid').onclick = e => { grid.visible = !grid.visible; e.currentTarget.setAttribute('aria-pressed', grid.visible); invalidate(); };
$('#theme').onclick = () => {
 const night = document.body.classList.toggle('dark');
 $('#theme').setAttribute('aria-pressed', String(night));
 $('#theme span').textContent = night ? 'Noite' : 'Dia';
 syncEnvironment(night);
};
if ($('#backdrop')) $('#backdrop').onchange = () => syncEnvironment();
syncEnvironment(false);

let farmDemo = null;
const isFarm = Boolean(model.demo) || $('#build').selectedOptions[0]?.dataset.category === 'farms';
if (isFarm) {
 $('#theme').hidden = true;
 document.body.classList.remove('dark');
 if ($('#backdrop')) $('#backdrop').value = 'editor';
 syncEnvironment(false);
}
if (model.bedrockNotes?.summary && $('.note')) {
 $('.note').textContent = model.bedrockNotes.summary + (model.bedrockNotes.taxaInfo ? ' ' + model.bedrockNotes.taxaInfo : '');
}
if (model.demo) {
 const bar = $('#portal-controls');
 bar.hidden = false;
 const demoBtn = document.createElement('button');
 demoBtn.type = 'button';
 demoBtn.id = 'demo-toggle';
 demoBtn.setAttribute('aria-pressed', 'false');
 demoBtn.textContent = 'Demonstração funcional';
 const stepBtn = document.createElement('button');
 stepBtn.type = 'button';
 stepBtn.id = 'demo-step';
 stepBtn.textContent = 'Próximo passo';
 const statusEl = document.createElement('span');
 statusEl.id = 'demo-status';
 statusEl.className = 'mechanism-hint';
 statusEl.textContent = 'Modo inspeção estática · clique em "Demonstração funcional" para animar o ciclo Redstone Bedrock.';
 bar.replaceChildren(demoBtn, stepBtn, statusEl);
 farmDemo = createFarmDemo({
  scene,
  blockRenderer,
  model,
  onFrame: invalidate,
  onHideBlocks(hidden) {
   demoHiddenSet = hidden && hidden.size ? hidden : null;
   syncFilteredMeshes();
   renderer.shadowMap.needsUpdate = true;
   invalidate();
  },
  onPhase(phase) {
   demoBtn.setAttribute('aria-pressed', String(Boolean(farmDemo?.running)));
   demoBtn.textContent = farmDemo?.running ? 'Pausar demonstração' : 'Demonstração funcional';
   statusEl.textContent = phase
    ? phase.label
    : 'Modo inspeção estática · clique em "Demonstração funcional" para animar o ciclo Redstone Bedrock.';
  },
 });
 const resetFullViewForDemo = () => {
  if (part !== 'all' || mode !== 'all') {
   part = 'all';
   mode = 'all';
   $('#part').value = 'all';
   $('#mode').value = 'all';
   rebuildScope();
   $('#step').max = blocks.length;
   step = blocks.length;
   $('#step').value = step;
   update();
  }
 };
 demoBtn.onclick = async () => {
  resetFullViewForDemo();
  await farmDemo.toggle();
 };
 stepBtn.onclick = async () => {
  resetFullViewForDemo();
  await farmDemo.stepNext();
 };
}

function fitPart() { $('#view').value = 'perspective'; setView('perspective'); }

$('#part').onchange = e => {
 farmDemo?.stop();
 part = e.target.value;
 rebuildScope();
 const max = mode === 'layer' ? height - 1 : scopedCache.length;
 $('#step').max = max;
 step = max;
 $('#step').value = step;
 update();
 fitPart();
};
$('#mode').onchange = e => {
 farmDemo?.stop();
 mode = e.target.value;
 const range = $('#step');
 range.max = mode === 'layer' ? height - 1 : scopedCache.length;
 step = Number(range.max);
 range.value = step;
 update();
};
$('#step').oninput = e => { step = Number(e.target.value); update(); };
for (const [selector, d] of [['#prev', -1], ['#next', 1]]) {
 $(selector).onclick = () => {
  step = Math.max(0, Math.min(Number($('#step').max), step + d));
  $('#step').value = step;
  update();
 };
}
$('#origin-form').onsubmit = e => {
 e.preventDefault();
 const fields = ['#origin-x', '#origin-y', '#origin-z'].map(x => $(x).value.trim());
 if (fields.every(x => x === '')) {
  origin = null;
  $('#origin-status').textContent = 'Origem removida.';
 } else if (fields.some(x => x === '' || !Number.isSafeInteger(Number(x)))) {
  $('#origin-status').textContent = 'Preencha os três valores inteiros.';
  return;
 } else {
  origin = fields.map(Number);
  $('#origin-status').textContent = 'Origem aplicada nesta sessão.';
 }
 if (selected) showSelection(selected);
};
document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && !$('#material-dialog').hidden) {
  $('#material-dialog').hidden = true;
  $('#materials').setAttribute('aria-expanded', 'false');
  $('#materials').focus();
 } else if (e.key === 'Escape') {
  clearSelection();
  invalidate();
 }
});
$('#materials').onclick = () => {
 const panel = $('#material-dialog');
 if (panel.hidden && materialsDirty) drawMaterials();
 panel.hidden = !panel.hidden;
 $('#materials').setAttribute('aria-expanded', String(!panel.hidden));
};
$('#close-materials').onclick = () => {
 $('#material-dialog').hidden = true;
 $('#materials').setAttribute('aria-expanded', 'false');
};

function dispose() {
 cancelAnimationFrame(pending);
 pending = 0;
 resizeObserver.disconnect();
 document.removeEventListener('visibilitychange', onVisibilityChange);
 flight.stop();
 controls.dispose();
 outline.clear();
 for (const geoms of edgeCache.values()) for (const g of geoms) g.dispose();
 edgeCache.clear();
 outlineMaterial.dispose();
 floor.geometry.dispose();
 floor.material.dispose();
 grid.geometry.dispose();
 grid.material.dispose();
 cushionGeometry?.dispose();
 cushionMaterial?.dispose();
 cushionTexture?.dispose();
 minecartGeometry?.dispose();
 minecartMaterial?.dispose();
 atmosphere.dispose();
 farmDemo?.dispose();
 blockRenderer.dispose();
 renderer.dispose();
}

window.studio = {
 model,
 cushions,
 inspectBlock(b) { pinned = true; showSelection(b); invalidate(); },
 renderer,
 scene,
 blocks,
 batches,
 ray,
 grid,
 outline,
 controls,
 atmosphere,
 textureFailures,
 icons,
 materials,
 blockRenderer,
 dispose,
 get selected() { return selected; },
 get frames() { return frames; },
 get camera() { return camera; },
 get mode() { return mode; },
 get step() { return step; },
};

setView('perspective');
update();
$('#loading').hidden = true;
