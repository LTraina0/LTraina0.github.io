// Approximate static block light on a half-block lattice. Full cubes and the
// occupied halves of stairs/slabs stop propagation; alpha-cut blocks transmit.
// This is a visual approximation, not Bedrock's light engine.
const LIGHT_SOURCE_NAMES = new Set([
 'minecraft:lantern',
 'minecraft:soul_lantern',
 'minecraft:copper_lantern',
 'minecraft:exposed_copper_lantern',
 'minecraft:weathered_copper_lantern',
 'minecraft:oxidized_copper_lantern',
 'minecraft:waxed_copper_lantern',
 'minecraft:waxed_exposed_copper_lantern',
 'minecraft:waxed_weathered_copper_lantern',
 'minecraft:waxed_oxidized_copper_lantern',
 'minecraft:torch',
 'minecraft:shroomlight',
 'minecraft:ochre_froglight',
 'minecraft:pearlescent_froglight',
 'minecraft:glowstone',
 'minecraft:glow_lichen',
 'minecraft:redstone_torch',
 'minecraft:copper_torch',
 'minecraft:soul_torch',
 'minecraft:lit_redstone_lamp',
 'minecraft:lava',
 'minecraft:flowing_lava',
 'minecraft:magma',
 'minecraft:sea_lantern',
 'minecraft:amethyst_cluster',
 'minecraft:large_amethyst_bud',
 'minecraft:medium_amethyst_bud',
 'minecraft:small_amethyst_bud',
 'minecraft:ice_crystal',
 'minecraft:sculk_catalyst',
]);

function isLightSource(b) {
 return (
  LIGHT_SOURCE_NAMES.has(b.name) ||
  (b.name.endsWith('_candle') && b.states?.lit) ||
  (b.name.endsWith('copper_bulb') && b.states?.lit) ||
  (b.name === 'minecraft:sea_pickle' && !b.states?.dead_bit)
 );
}

export function createBlockLight(blocks, parts, materials, options = {}) {
 const scale = 2;
 const padding = 2;
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
 if (!blocks.length) {
  minX = minY = minZ = 0;
  maxX = maxY = maxZ = 0;
 }
 const min = [minX - padding, minY - padding, minZ - padding];
 const max = [maxX + 1 + padding, maxY + 1 + padding, maxZ + 1 + padding];
 const size = max.map((v, i) => (v - min[i]) * scale);
 const [sx, sy, sz] = size;
 const n = sx * sy * sz;
 const strideY = sx;
 const strideZ = sx * sy;
 const cell = (x, y, z) =>
  Math.floor((x - min[0]) * scale) +
  Math.floor((y - min[1]) * scale) * strideY +
  Math.floor((z - min[2]) * scale) * strideZ;

 const solids = new Map();
 const solidBlocks = [];
 const solidMasks = [];
 const solidMaskOf = options?.solidMaskOf;

 for (let idx = 0; idx < blocks.length; idx++) {
  const b = blocks[idx];
  let mask = 0;
  if (solidMaskOf) {
   mask = solidMaskOf(b);
  } else {
   for (const { g, keys } of parts(b)) {
    if (keys.every(k => !materials[k]?.alphaTest)) {
     g.computeBoundingBox();
     const a = g.boundingBox.min;
     const c = g.boundingBox.max;
     for (let x = 0; x < 2; x++) {
      const px = (x + 0.5) / 2;
      if (px <= a.x + 1e-5 || px >= c.x - 1e-5) continue;
      for (let y = 0; y < 2; y++) {
       const py = (y + 0.5) / 2;
       if (py <= a.y + 1e-5 || py >= c.y - 1e-5) continue;
       for (let z = 0; z < 2; z++) {
        const pz = (z + 0.5) / 2;
        if (pz > a.z + 1e-5 && pz < c.z - 1e-5) {
         mask |= 1 << (x | (y << 1) | (z << 2));
        }
       }
      }
     }
    }
    g.dispose();
   }
  }
  if (mask) {
   const bx = (b.x - min[0]) * scale;
   const by = (b.y - min[1]) * scale;
   const bz = (b.z - min[2]) * scale;
   const base = bx + by * strideY + bz * strideZ;
   const cells = [];
   for (let bit = 0; bit < 8; bit++) {
    if (mask & (1 << bit)) {
     const dx = bit & 1;
     const dy = (bit >> 1) & 1;
     const dz = (bit >> 2) & 1;
     cells.push(base + dx + dy * strideY + dz * strideZ);
    }
   }
   solids.set(b, cells);
   solidBlocks.push(b);
   solidMasks.push(mask);
  } else {
   solids.set(b, []);
  }
 }

 const sources = blocks.filter(isLightSource);
 const sourceLevels = new Uint8Array(sources.length);
 const sourceBaseCells = new Int32Array(sources.length);
 for (let i = 0; i < sources.length; i++) {
  const b = sources[i];
  let lvl = 30;
  if (b.name === 'minecraft:glow_lichen') lvl = 14;
  else if (b.name.endsWith('_candle')) lvl = 16 + Math.min(6, (b.states?.candles ?? 0) * 2);
  else if (b.name === 'minecraft:torch' || b.name === 'minecraft:copper_torch' || b.name === 'minecraft:ice_crystal') lvl = 28;
  else if (b.name === 'minecraft:soul_torch') lvl = 20;
  else if (b.name === 'minecraft:redstone_torch') lvl = 14;
  else if (b.name === 'minecraft:sculk_catalyst') lvl = 12;
  else if (b.name === 'minecraft:amethyst_cluster') lvl = 10;
  else if (b.name === 'minecraft:large_amethyst_bud') lvl = 8;
  else if (b.name === 'minecraft:magma') lvl = 6;
  else if (b.name === 'minecraft:medium_amethyst_bud') lvl = 4;
  else if (b.name === 'minecraft:small_amethyst_bud') lvl = 2;
  else if (b.name.endsWith('copper_bulb')) {
   lvl = b.name.includes('oxidized') ? 8 : b.name.includes('weathered') ? 16 : b.name.includes('exposed') ? 24 : 30;
  }
  sourceLevels[i] = lvl;
  sourceBaseCells[i] =
   (b.x - min[0]) * scale +
   (b.y - min[1]) * scale * strideY +
   (b.z - min[2]) * scale * strideZ;
 }

 const field = new Uint8Array(n);
 const occupied = new Uint8Array(n);
 const buckets = Array.from({ length: 31 }, () => []);
 let bakes = 0;
 let propagated = false;
 let lastAccept = () => true;

 function propagateLight(accept) {
  field.fill(0);
  for (let l = 0; l <= 30; l++) buckets[l].length = 0;

  for (let s = 0; s < sources.length; s++) {
   const b = sources[s];
   if (!accept(b)) continue;
   const level = sourceLevels[s];
   const base = sourceBaseCells[s];
   const bucket = buckets[level];
   for (let dz = 0; dz < 2; dz++) {
    const zOff = base + dz * strideZ;
    for (let dy = 0; dy < 2; dy++) {
     const yzOff = zOff + dy * strideY;
     for (let dx = 0; dx < 2; dx++) {
      const idx = yzOff + dx;
      if (field[idx] < level) {
       field[idx] = level;
       bucket.push(idx);
      }
     }
    }
   }
  }

  for (let level = 30; level > 1; level--) {
   const bucket = buckets[level];
   const nextBucket = buckets[level - 1];
   const nextLevel = level - 1;
   for (let k = 0; k < bucket.length; k++) {
    const i = bucket[k];
    if (field[i] !== level) continue;
    const x = i % sx;
    const yz = (i - x) / sx;
    const y = yz % sy;
    const z = (yz - y) / sy;

    if (x > 0) {
     const j = i - 1;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
    if (x < sx - 1) {
     const j = i + 1;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
    if (y > 0) {
     const j = i - strideY;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
    if (y < sy - 1) {
     const j = i + strideY;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
    if (z > 0) {
     const j = i - strideZ;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
    if (z < sz - 1) {
     const j = i + strideZ;
     if (!occupied[j] && field[j] < nextLevel) { field[j] = nextLevel; nextBucket.push(j); }
    }
   }
  }
  bakes++;
  propagated = true;
 }

 function bake(accept, { propagate = true } = {}) {
  lastAccept = accept;
  occupied.fill(0);
  for (let idx = 0; idx < solidBlocks.length; idx++) {
   const b = solidBlocks[idx];
   if (!accept(b)) continue;
   const mask = solidMasks[idx];
   const base =
    (b.x - min[0]) * scale +
    (b.y - min[1]) * scale * strideY +
    (b.z - min[2]) * scale * strideZ;
   for (let bit = 0; bit < 8; bit++) {
    if (mask & (1 << bit)) {
     const dx = bit & 1;
     const dy = (bit >> 1) & 1;
     const dz = (bit >> 2) & 1;
     occupied[base + dx + dy * strideY + dz * strideZ] = 1;
    }
   }
  }
  if (propagate) {
   propagateLight(accept);
  } else {
   propagated = false;
  }
 }

 function ensurePropagated() {
  if (!propagated) propagateLight(lastAccept);
 }

 const sample = (x, y, z) => {
  const ix = Math.floor((x - min[0]) * scale);
  const iy = Math.floor((y - min[1]) * scale);
  const iz = Math.floor((z - min[2]) * scale);
  return ix < 0 || iy < 0 || iz < 0 || ix >= sx || iy >= sy || iz >= sz
   ? 0
   : field[ix + iy * strideY + iz * strideZ];
 };

 const occluded = (x, y, z) => {
  const ix = Math.floor((x - min[0]) * scale);
  const iy = Math.floor((y - min[1]) * scale);
  const iz = Math.floor((z - min[2]) * scale);
  return (
   ix >= 0 && iy >= 0 && iz >= 0 && ix < sx && iy < sy && iz < sz &&
   occupied[ix + iy * strideY + iz * strideZ] === 1
  );
 };

 return {
  bake,
  ensurePropagated,
  sample,
  occluded,
  solids,
  sources,
  grid: { field, occupied, min, sx, sy, sz, strideY, strideZ, scale },
  get bakes() { return bakes; },
  get field() { return field; },
  size,
  min,
  scale,
 };
}
