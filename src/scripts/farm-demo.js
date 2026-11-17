import * as THREE from 'three';

// Authentic Bedrock 1.21+ functional demonstration for BuildsMine's v3 Stone-Gen Moss Farm.
// Swaps dynamic redstone/lever/observer/composter blocks cleanly via
// onHideBlocks(Set) using real blockRenderer.parts() geometry (zero z-fighting).

const MOSS_CONVERT_POSITIONS = [
 [5, 5], [6, 5], [8, 5], [9, 5],
 [5, 6], [6, 6], [8, 6], [9, 6],
 [5, 8], [6, 8], [8, 8], [9, 8],
 [5, 9], [6, 9], [8, 9], [9, 9],
];

const MOSS_CARPET_POSITIONS = [
 [5, 4], [7, 4], [8, 4],
 [5, 5], [6, 5], [9, 5],
 [6, 6], [7, 6], [8, 6],
 [5, 8], [7, 8], [9, 8],
 [6, 9], [8, 9],
 [5, 10], [7, 10], [9, 10],
];

const AZALEA_POSITIONS = [
 [5, 6, false], [8, 5, true], [6, 8, false], [9, 9, true], [7, 5, false],
];

const PHASES = [
 { id: 'pulse', label: '1/5 · Alavanca ON: clock 4.0s dispara farinha de osso no musgo central e converte pedra' },
 { id: 'grow', label: '2/5 · Observador pulsa pistões encharcados: pedra nova esmaga o musgo convertido' },
 { id: 'flush', label: '3/5 · Comporta oeste abre (pistões grudentos recuam) e água varre tudo para o leste' },
 { id: 'retract', label: '4/5 · Comporta veda seco; calha leste (X=10) leva os itens aos funis das composteiras' },
 { id: 'compost', label: '5/5 · Composteiras reciclam até trava 96un no ejetor; excedente vai ao baú duplo leste' },
];

export function createFarmDemo({ scene, blockRenderer, model, onHideBlocks, onPhase, onFrame }) {
 const spec = model.demo;
 if (!spec) return null;
 if (spec.type === 'moss-bonemeal-farm-v1') {
  return createFarmV1Demo({ scene, blockRenderer, model, onHideBlocks, onPhase, onFrame });
 }
 if (spec.type !== 'moss-bonemeal-farm') return null;

 const coordMap = new Map(model.blocks.map(b => [`${b.x},${b.y},${b.z}`, b]));
 const blockAt = ([x, y, z]) => coordMap.get(`${x},${y},${z}`) || null;

 const root = new THREE.Group();
 root.visible = false;
 scene.add(root);

 let built = false;
 let running = false;
 let phaseIdx = 0;
 let timer = null;
 let rafId = 0;
 let phaseStart = 0;

 const disposables = [];
 const trackGeo = g => { disposables.push(g); return g; };
 const trackMat = m => { disposables.push(m); return m; };

 function buildBlockGroup(coords, overrideFn) {
  const group = new THREE.Group();
  const hidden = [];
  const mats = blockRenderer.materials;
  for (const pos of coords) {
   const orig = blockAt(pos);
   if (!orig) continue;
   hidden.push(orig);
   const next = overrideFn(orig);
   for (const p of blockRenderer.parts(next)) {
    const nrm = p.g.attributes.normal;
    const cols = new Float32Array(nrm.count * 3);
    for (let i = 0; i < nrm.count; i++) {
     const ny = nrm.getY(i), nz = nrm.getZ(i);
     const shade = ny > 0.5 ? 1.0 : ny < -0.5 ? 0.65 : Math.abs(nz) > 0.5 ? 0.88 : 0.78;
     cols.fill(shade, i * 3, i * 3 + 3);
    }
    p.g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    trackGeo(p.g);
    const mesh = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    mesh.position.set(orig.x, orig.y, orig.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
   }
  }
  return { group, hidden };
 }

 let leverActive = null;
 let branchA = null;
 let branchB = null;
 let floodgateLit = null;
 let observerLit = null;
 let torchesAOn = null;
 let torchesIdleFlipped = null;
 let torchesFloodOff = null;
 let gatesExtended = null;
 let gatesRetracted = null;
 let compostersMid = null;
 let compostersFull = null;

 const convertedMossGroup = new THREE.Group();
 const carpetGroup = new THREE.Group();
 const azaleaGroup = new THREE.Group();
 const bonemealParticles = new THREE.Group();
 const flushGroup = new THREE.Group();
 const itemGroup = new THREE.Group();
 const elevItemsGroup = new THREE.Group();
 const chestItemsGroup = new THREE.Group();
 let updateFlushSheet = null;

 async function ensureBuilt() {
  if (built) return;
  built = true;
  await blockRenderer.ensureMaterials([
   'redstoneLineOn', 'redstoneCrossOn', 'redstoneTorchOn', 'redstoneTorchOff',
   'repeaterOn', 'comparatorOn', 'stoneSlabSide', 'stoneSlabTop', 'smoothStone',
   'observerBackLit', 'observerFront', 'observerSide', 'observerTop',
   'leverTex', 'cobblestone', 'mossBlock', 'azaleaTop', 'azaleaSide', 'azaleaPlant',
   'floweringAzaleaTop', 'floweringAzaleaSide', 'water',
   'composterSide', 'composterBottom', 'composterCompost', 'composterReady',
  ]);
  const mats = blockRenderer.materials;

  leverActive = buildBlockGroup([spec.lever], b => ({
   ...b,
   states: { ...b.states, open_bit: true },
  }));

  branchA = buildBlockGroup(
   [...(spec.wirePhaseA || []), ...(spec.repeatersPhaseA || [])],
   b => b.name === 'minecraft:unpowered_repeater'
    ? { ...b, name: 'minecraft:powered_repeater' }
    : { ...b, states: { ...b.states, redstone_signal: 15 } }
  );

  branchB = buildBlockGroup(
   [...(spec.wirePhaseB || []), ...(spec.repeatersPhaseB || [])],
   b => b.name === 'minecraft:unpowered_repeater'
    ? { ...b, name: 'minecraft:powered_repeater' }
    : { ...b, states: { ...b.states, redstone_signal: 15 } }
  );

  floodgateLit = buildBlockGroup(
   [...(spec.floodgateWire || []), ...(spec.floodgateRepeaters || [])],
   b => b.name === 'minecraft:unpowered_repeater'
    ? { ...b, name: 'minecraft:powered_repeater' }
    : { ...b, states: { ...b.states, redstone_signal: 15 } }
  );

  observerLit = buildBlockGroup([spec.observer], b => ({
   ...b,
   states: { ...b.states, powered_bit: true },
  }));

  torchesAOn = buildBlockGroup(spec.torchesPhaseA || [], b => ({
   ...b,
   name: 'minecraft:redstone_torch',
  }));
  torchesIdleFlipped = buildBlockGroup(spec.torchesIdleOff || [], b => ({
   ...b,
   name: 'minecraft:unlit_redstone_torch',
  }));
  torchesFloodOff = buildBlockGroup(spec.torchesFloodOff || [], b => ({
   ...b,
   name: 'minecraft:unlit_redstone_torch',
  }));

  // Floodgate Gate blocks sit at Y=6 when closed (DRY) and Y=5 (flush with floor) during FLUSH
  const gateCoords = (spec.floodgatePistons || []).map(([x, y, z]) => [x, y + 1, z]);
  gatesExtended = buildBlockGroup(gateCoords, b => ({
   ...b,
   y: b.y + 1,
  }));
  for (const ch of gatesExtended.group.children) ch.position.y += 1;
  gatesRetracted = buildBlockGroup(gateCoords, b => ({ ...b }));

  compostersMid = buildBlockGroup(spec.composters, b => ({
   ...b,
   states: { ...b.states, composter_fill_level: 5 },
  }));
  compostersFull = buildBlockGroup(spec.composters, b => ({
   ...b,
   states: { ...b.states, composter_fill_level: 8 },
  }));

  // Converted stone -> moss_block overlay at Y=5
  for (const [mx, mz] of MOSS_CONVERT_POSITIONS) {
   const orig = blockAt([mx, spec.centerMoss[1], mz]);
   if (!orig) continue;
   const dummy = { name: 'minecraft:moss_block', x: mx, y: spec.centerMoss[1], z: mz, states: {} };
   for (const p of blockRenderer.parts(dummy)) {
    const nrm = p.g.attributes.normal;
    const cols = new Float32Array(nrm.count * 3).fill(0.95);
    p.g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    trackGeo(p.g);
    const m = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    m.position.set(mx, spec.centerMoss[1] + 0.005, mz);
    m.castShadow = true;
    m.receiveShadow = true;
    convertedMossGroup.add(m);
   }
  }

  // Sprouted moss carpets & azaleas at Y=6
  for (const [cx, cz] of MOSS_CARPET_POSITIONS) {
   const dummy = { name: 'minecraft:moss_carpet', x: cx, y: spec.platformBounds.y, z: cz, states: {} };
   for (const p of blockRenderer.parts(dummy)) {
    const nrm = p.g.attributes.normal;
    const cols = new Float32Array(nrm.count * 3).fill(0.95);
    p.g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    trackGeo(p.g);
    const m = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    m.position.set(cx, spec.platformBounds.y, cz);
    carpetGroup.add(m);
   }
  }

  for (const [ax, az, flowered] of AZALEA_POSITIONS) {
   const dummy = { name: flowered ? 'minecraft:flowering_azalea' : 'minecraft:azalea', x: ax, y: spec.platformBounds.y, z: az, states: {} };
   for (const p of blockRenderer.parts(dummy)) {
    const nrm = p.g.attributes.normal;
    const cols = new Float32Array(nrm.count * 3).fill(1);
    p.g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    trackGeo(p.g);
    const m = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    m.position.set(ax, spec.platformBounds.y, az);
    azaleaGroup.add(m);
   }
  }

  // Bone meal particle burst above central (7,5,7) moss block
  const bmMatGreen = trackMat(new THREE.MeshBasicMaterial({ color: 0x72db52 }));
  const bmMatPale = trackMat(new THREE.MeshBasicMaterial({ color: 0xc8f7b8 }));
  const bmGeo = trackGeo(new THREE.BoxGeometry(0.075, 0.075, 0.075));
  for (let i = 0; i < 18; i++) {
   const p = new THREE.Mesh(bmGeo, i % 3 === 0 ? bmMatPale : bmMatGreen);
   const ring = i < 6 ? 0.55 : i < 12 ? 1.45 : 2.25;
   const a = (i / 6) * Math.PI * 2 + (i % 3) * 0.4;
   p.userData.base = [
    spec.centerMoss[0] + 0.5 + Math.cos(a) * ring,
    spec.centerMoss[1] + 1.08 + (i % 3) * 0.14,
    spec.centerMoss[2] + 0.5 + Math.sin(a) * ring,
   ];
   p.userData.phaseOffset = (i % 5) * 0.16;
   p.position.set(...p.userData.base);
   bonemealParticles.add(p);
  }

  // Eastward sloped water flush sheet (from X=4 Floodgate across X=5..9 into X=10 Gutter)
  const { x0, x1, y, z0, z1 } = spec.platformBounds;
  const flushX0 = x0 - 1;
  const zStart = z0;
  const zEnd = z1 + 1;
  const sheetD = zEnd - zStart;
  if (mats.water?.map) {
   mats.water.map.wrapS = THREE.RepeatWrapping;
   mats.water.map.wrapT = THREE.RepeatWrapping;
   mats.water.map.needsUpdate = true;
  }
  const sheetGeo = trackGeo(new THREE.BufferGeometry());
  const positions = new Float32Array(12 * 3);
  const normals = new Float32Array([
   0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
   1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
   0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
  ]);
  const uvs = new Float32Array(12 * 2);
  const cols = new Float32Array(12 * 3).fill(1);
  sheetGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  sheetGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  sheetGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  sheetGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  sheetGeo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11]);
  const sheetMesh = new THREE.Mesh(sheetGeo, mats.water);
  updateFlushSheet = (progress) => {
   const len = Math.max(0.3, progress * (x1 + 1 - flushX0));
   const xF = flushX0 + len;
   const h0 = y + 14 / 16;
   const hF = y + Math.max(2.5, 14 - len * 1.64) / 16;
   const p = sheetGeo.attributes.position.array;
   const u = sheetGeo.attributes.uv.array;
   p.set([flushX0, h0, zStart, xF, hF, zStart, xF, hF, zEnd, flushX0, h0, zEnd], 0);
   u.set([0, 0, len, 0, len, sheetD, 0, sheetD], 0);
   p.set([xF, hF, zStart, xF, y, zStart, xF, y, zEnd, xF, hF, zEnd], 12);
   u.set([0, 1, 0, 0, sheetD, 0, sheetD, 1], 8);
   p.set([flushX0, h0, zEnd, xF, hF, zEnd, xF, y, zEnd, flushX0, y, zEnd], 24);
   u.set([0, 1, len, 1, len, 0, 0, 0], 16);
   sheetGeo.attributes.position.needsUpdate = true;
   sheetGeo.attributes.uv.needsUpdate = true;
   sheetGeo.computeBoundingSphere();
  };
  updateFlushSheet(1);
  flushGroup.add(sheetMesh);

  // Swept broken moss block + azalea item drops
  const dropGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24));
  dropGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(dropGeo.attributes.normal.count * 3).fill(1), 3));
  for (let i = 0; i < 9; i++) {
   const d = new THREE.Mesh(dropGeo, i % 3 === 0 ? mats.floweringAzaleaTop : mats.mossBlock);
   d.userData.laneZ = 4.5 + (i % 7);
   d.userData.offset = (i % 3) * 0.45;
   itemGroup.add(d);
  }

  // Recycled bonemeal riding Dropper Chain (8,1..4,7) + overflow into East Double Chest
  const mealMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xf4efe0 }));
  const mealGeo = trackGeo(new THREE.BoxGeometry(0.2, 0.2, 0.2));
  for (let i = 0; i < 3; i++) {
   const m = new THREE.Mesh(mealGeo, mealMat);
   m.userData.offset = i * 0.32;
   elevItemsGroup.add(m);
  }
  chestItemsGroup.add(new THREE.Mesh(mealGeo, mealMat));

  root.add(
   leverActive.group, branchA.group, branchB.group, floodgateLit.group, observerLit.group,
   torchesAOn.group, torchesIdleFlipped.group, torchesFloodOff.group,
   gatesExtended.group, gatesRetracted.group,
   compostersMid.group, compostersFull.group,
   convertedMossGroup, carpetGroup, azaleaGroup, bonemealParticles,
   flushGroup, itemGroup, elevItemsGroup, chestItemsGroup
  );
 }

 function applyPhase(idx) {
  phaseIdx = idx % PHASES.length;
  phaseStart = performance.now();
  const id = PHASES[phaseIdx].id;

  const hidden = new Set([
   ...leverActive.hidden,
   ...torchesIdleFlipped.hidden,
  ]);
  leverActive.group.visible = true;
  torchesIdleFlipped.group.visible = true;

  const isPulse = id === 'pulse';
  const isGrow = id === 'grow';
  const isFlush = id === 'flush';
  const isRetract = id === 'retract';
  const isCompost = id === 'compost';

  branchA.group.visible = isPulse;
  if (isPulse) for (const b of branchA.hidden) hidden.add(b);

  torchesAOn.group.visible = isPulse;
  if (isPulse) for (const b of torchesAOn.hidden) hidden.add(b);

  branchB.group.visible = isGrow;
  observerLit.group.visible = isGrow;
  if (isGrow) {
   for (const b of branchB.hidden) hidden.add(b);
   for (const b of observerLit.hidden) hidden.add(b);
  }

  // Floodgate sealed UP except during FLUSH phase
  const gateOpen = isFlush;
  gatesRetracted.group.visible = gateOpen;
  gatesExtended.group.visible = !gateOpen;
  for (const b of gatesExtended.hidden) hidden.add(b);
  floodgateLit.group.visible = !gateOpen;
  if (!gateOpen) for (const b of floodgateLit.hidden) hidden.add(b);
  torchesFloodOff.group.visible = gateOpen;
  if (gateOpen) for (const b of torchesFloodOff.hidden) hidden.add(b);

  if (isCompost) {
   compostersMid.group.visible = true;
   compostersFull.group.visible = false;
   for (const b of compostersMid.hidden) hidden.add(b);
  } else {
   compostersMid.group.visible = false;
   compostersFull.group.visible = false;
  }

  bonemealParticles.visible = isPulse;
  convertedMossGroup.visible = isPulse || isGrow;
  carpetGroup.visible = isPulse || isGrow;
  azaleaGroup.visible = isPulse || isGrow;
  flushGroup.visible = isFlush;
  itemGroup.visible = isGrow || isFlush || isRetract;
  elevItemsGroup.visible = isCompost;
  chestItemsGroup.visible = isCompost;

  onHideBlocks?.(hidden);
  onPhase?.(PHASES[phaseIdx]);
  onFrame?.();
 }

 function tickAnim(now) {
  if (!root.visible) { rafId = 0; return; }
  const t = Math.min(1, (now - phaseStart) / 1350);
  const id = PHASES[phaseIdx].id;

  if (id === 'pulse') {
   for (const p of bonemealParticles.children) {
    const [bx, by, bz] = p.userData.base;
    const localT = (t + (p.userData.phaseOffset || 0)) % 1;
    p.position.set(bx, by + Math.sin(localT * Math.PI) * 0.35, bz);
    p.scale.setScalar(0.55 + Math.sin(localT * Math.PI) * 0.55);
   }
   const s = Math.min(1, t * 2.0);
   carpetGroup.scale.set(1, s, 1);
   carpetGroup.position.y = (1 - s) * spec.platformBounds.y;
   azaleaGroup.scale.set(1, s, 1);
   azaleaGroup.position.y = (1 - s) * spec.platformBounds.y;
  } else if (id === 'grow') {
   carpetGroup.scale.set(1, 1, 1);
   carpetGroup.position.y = 0;
   azaleaGroup.scale.set(1, 1, 1);
   azaleaGroup.position.y = 0;
   for (let i = 0; i < itemGroup.children.length; i++) {
    const d = itemGroup.children[i];
    d.position.set(5.5 + (i % 4), spec.platformBounds.y + 0.25 + Math.sin(t * Math.PI) * 0.2, d.userData.laneZ);
    d.rotation.y = t * Math.PI * 2;
   }
  } else if (id === 'flush') {
   updateFlushSheet?.(Math.min(1, t / 0.72));
   for (let i = 0; i < itemGroup.children.length; i++) {
    const d = itemGroup.children[i];
    const x = Math.min(spec.gutterBounds.x + 0.5, 5.2 + t * 5.2 + d.userData.offset * 0.4);
    d.position.set(x, spec.platformBounds.y + 0.25, d.userData.laneZ);
    d.rotation.y = t * Math.PI * 2;
   }
  } else if (id === 'retract') {
   for (let i = 0; i < itemGroup.children.length; i++) {
    const d = itemGroup.children[i];
    const z = Math.min(spec.gutterBounds.z1 + 0.5, 4.4 + t * 6.0 + d.userData.offset * 0.4);
    d.position.set(spec.gutterBounds.x + 0.5, spec.gutterBounds.y + 0.25, z);
    d.rotation.y = t * Math.PI * 2;
   }
  } else if (id === 'compost') {
   const secondHalf = t > 0.5;
   compostersMid.group.visible = !secondHalf;
   compostersFull.group.visible = secondHalf;
   for (let i = 0; i < elevItemsGroup.children.length; i++) {
    const m = elevItemsGroup.children[i];
    const p = (t + m.userData.offset) % 1;
    m.position.set(8.5, 1.4 + p * 3.1, 7.5);
    m.rotation.y = p * Math.PI * 2;
   }
   chestItemsGroup.children[0].position.set(10.4 + t * 1.1, 2.35, 10.5);
   chestItemsGroup.children[0].rotation.y = t * Math.PI * 2;
  }

  onFrame?.();
  if (running || t < 1) rafId = requestAnimationFrame(tickAnim);
  else rafId = 0;
 }

 async function start() {
  await ensureBuilt();
  running = true;
  root.visible = true;
  applyPhase(0);
  if (!rafId) rafId = requestAnimationFrame(tickAnim);
  clearInterval(timer);
  timer = setInterval(() => {
   if (!running) return;
   applyPhase((phaseIdx + 1) % PHASES.length);
  }, 1600);
 }

 function stop() {
  running = false;
  clearInterval(timer);
  timer = null;
  cancelAnimationFrame(rafId);
  rafId = 0;
  root.visible = false;
  onHideBlocks?.(null);
  onPhase?.(null);
  onFrame?.();
 }

 async function stepNext() {
  await ensureBuilt();
  running = false;
  clearInterval(timer);
  timer = null;
  if (!root.visible) {
   root.visible = true;
   applyPhase(0);
  } else {
   applyPhase((phaseIdx + 1) % PHASES.length);
  }
  if (!rafId) rafId = requestAnimationFrame(tickAnim);
 }

 async function toggle() {
  if (root.visible && running) stop();
  else await start();
 }

 function dispose() {
  stop();
  scene.remove(root);
  for (const d of disposables) d.dispose();
 }

 return {
  start,
  stop,
  stepNext,
  toggle,
  dispose,
  get active() { return root.visible; },
  get running() { return running; },
 };
}

const V1_PHASES = [
 { id: 'pulse', label: '1/4 · V1 (Referência): relógio aciona ejetor central (6,4,6)' },
 { id: 'grow', label: '2/4 · Plataforma 7×7 estática: brotam carpetes e azaleias sobre o musgo' },
 { id: 'flush', label: '3/4 · Observador aciona 3 ejetores de água (X=4,6,8) varrendo para o sul' },
 { id: 'compost', label: '4/4 · Calha Z=10 -> 2 composteiras -> torre de 4 liberadores / baú leste' },
];

function createFarmV1Demo({ scene, blockRenderer, model, onHideBlocks, onPhase, onFrame }) {
 const spec = model.demo;
 const coordMap = new Map(model.blocks.map(b => [`${b.x},${b.y},${b.z}`, b]));
 const blockAt = ([x, y, z]) => coordMap.get(`${x},${y},${z}`) || null;
 const root = new THREE.Group();
 root.visible = false;
 scene.add(root);

 let built = false, running = false, phaseIdx = 0, timer = null, rafId = 0, phaseStart = 0;
 const disposables = [];
 const trackGeo = g => { disposables.push(g); return g; };

 function buildGroup(coords, overrideFn) {
  const group = new THREE.Group();
  const hidden = [];
  const mats = blockRenderer.materials;
  for (const pos of coords) {
   const orig = blockAt(pos);
   if (!orig) continue;
   hidden.push(orig);
   for (const p of blockRenderer.parts(overrideFn(orig))) {
    const nrm = p.g.attributes.normal;
    const cols = new Float32Array(nrm.count * 3).fill(0.92);
    p.g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    trackGeo(p.g);
    const mesh = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    mesh.position.set(orig.x, orig.y, orig.z);
    group.add(mesh);
   }
  }
  return { group, hidden };
 }

 let leverActive, observerLit, wireA, wireB, compostersFull, flushMesh;
 const carpetGroup = new THREE.Group();
 const itemGroup = new THREE.Group();

 async function ensureBuilt() {
  if (built) return;
  built = true;
  await blockRenderer.ensureMaterials([
   'redstoneLineOn', 'redstoneCrossOn', 'observerBackLit', 'leverTex',
   'mossBlock', 'water', 'composterReady',
  ]);
  const mats = blockRenderer.materials;
  leverActive = buildGroup([spec.lever], b => ({ ...b, states: { ...b.states, open_bit: true } }));
  observerLit = buildGroup([spec.observer], b => ({ ...b, states: { ...b.states, powered_bit: true } }));
  wireA = buildGroup(spec.wirePhaseA || [], b => ({ ...b, states: { ...b.states, redstone_signal: 15 } }));
  wireB = buildGroup(spec.wirePhaseB || [], b => ({ ...b, states: { ...b.states, redstone_signal: 15 } }));
  compostersFull = buildGroup(spec.composters || [], b => ({ ...b, states: { ...b.states, composter_fill_level: 8 } }));

  for (const [cx, cz] of [[4, 4], [6, 4], [8, 5], [5, 7], [7, 8], [4, 8]]) {
   for (const p of blockRenderer.parts({ name: 'minecraft:moss_carpet', x: cx, y: 6, z: cz, states: {} })) {
    p.g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(p.g.attributes.normal.count * 3).fill(0.95), 3));
    trackGeo(p.g);
    const m = new THREE.Mesh(p.g, p.keys.map(k => mats[k]));
    m.position.set(cx, 6, cz);
    carpetGroup.add(m);
   }
  }
  const sheetGeo = trackGeo(new THREE.BoxGeometry(7, 0.25, 7));
  sheetGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(sheetGeo.attributes.normal.count * 3).fill(1), 3));
  flushMesh = new THREE.Mesh(sheetGeo, mats.water);
  flushMesh.position.set(6.5, 6.15, 6.5);
  const dropGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24));
  dropGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(dropGeo.attributes.normal.count * 3).fill(1), 3));
  for (let i = 0; i < 6; i++) {
   const d = new THREE.Mesh(dropGeo, mats.mossBlock);
   d.userData.x = 3.5 + i;
   itemGroup.add(d);
  }
  root.add(leverActive.group, observerLit.group, wireA.group, wireB.group, compostersFull.group, carpetGroup, flushMesh, itemGroup);
 }

 function applyPhase(idx) {
  phaseIdx = idx % V1_PHASES.length;
  phaseStart = performance.now();
  const id = V1_PHASES[phaseIdx].id;
  const hidden = new Set(leverActive.hidden);
  leverActive.group.visible = true;
  wireA.group.visible = id === 'pulse';
  if (wireA.group.visible) for (const b of wireA.hidden) hidden.add(b);
  wireB.group.visible = id === 'flush';
  observerLit.group.visible = id === 'flush';
  if (id === 'flush') {
   for (const b of wireB.hidden) hidden.add(b);
   for (const b of observerLit.hidden) hidden.add(b);
  }
  compostersFull.group.visible = id === 'compost';
  if (id === 'compost') for (const b of compostersFull.hidden) hidden.add(b);
  carpetGroup.visible = id === 'grow';
  flushMesh.visible = id === 'flush';
  itemGroup.visible = id === 'flush' || id === 'compost';
  onHideBlocks?.(hidden);
  onPhase?.(V1_PHASES[phaseIdx]);
  onFrame?.();
 }

 function tick(now) {
  if (!root.visible) { rafId = 0; return; }
  const t = Math.min(1, (now - phaseStart) / 1300);
  const id = V1_PHASES[phaseIdx].id;
  if (id === 'flush') {
   for (const d of itemGroup.children) d.position.set(d.userData.x, 6.25, 4 + t * 6);
  } else if (id === 'compost') {
   for (const d of itemGroup.children) d.position.set(7.5, 1.4 + t * 3.1, 8.5);
  }
  onFrame?.();
  if (running || t < 1) rafId = requestAnimationFrame(tick);
  else rafId = 0;
 }

 async function start() {
  await ensureBuilt();
  running = true;
  root.visible = true;
  applyPhase(0);
  if (!rafId) rafId = requestAnimationFrame(tick);
  clearInterval(timer);
  timer = setInterval(() => { if (running) applyPhase((phaseIdx + 1) % V1_PHASES.length); }, 1550);
 }
 function stop() {
  running = false; clearInterval(timer); timer = null; cancelAnimationFrame(rafId); rafId = 0;
  root.visible = false; onHideBlocks?.(null); onPhase?.(null); onFrame?.();
 }
 async function stepNext() {
  await ensureBuilt();
  running = false; clearInterval(timer); timer = null;
  if (!root.visible) { root.visible = true; applyPhase(0); } else applyPhase((phaseIdx + 1) % V1_PHASES.length);
  if (!rafId) rafId = requestAnimationFrame(tick);
 }
 async function toggle() { if (root.visible && running) stop(); else await start(); }
 function dispose() { stop(); scene.remove(root); for (const d of disposables) d.dispose(); }

 return { start, stop, stepNext, toggle, dispose, get active() { return root.visible; }, get running() { return running; } };
}
