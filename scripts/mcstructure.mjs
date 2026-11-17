// Pure-JS Bedrock Edition .mcstructure (Little-Endian NBT) reader, writer,
// and round-trip validator for BuildsMine's disk pipeline.

const TAG = {
 END: 0,
 BYTE: 1,
 SHORT: 2,
 INT: 3,
 LONG: 4,
 FLOAT: 5,
 DOUBLE: 6,
 BYTE_ARRAY: 7,
 STRING: 8,
 LIST: 9,
 COMPOUND: 10,
 INT_ARRAY: 11,
 LONG_ARRAY: 12,
};

const DEFAULT_BLOCK_VERSION = 18163713; // Bedrock 1.21+ block palette version

class NbtReader {
 constructor(buf) {
  this.buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  this.pos = 0;
 }
 u8() { return this.buf.readUInt8(this.pos++); }
 i8() { const v = this.buf.readInt8(this.pos); this.pos += 1; return v; }
 i16() { const v = this.buf.readInt16LE(this.pos); this.pos += 2; return v; }
 u16() { const v = this.buf.readUInt16LE(this.pos); this.pos += 2; return v; }
 i32() { const v = this.buf.readInt32LE(this.pos); this.pos += 4; return v; }
 i64() { const v = this.buf.readBigInt64LE(this.pos); this.pos += 8; return v; }
 f32() { const v = this.buf.readFloatLE(this.pos); this.pos += 4; return v; }
 f64() { const v = this.buf.readDoubleLE(this.pos); this.pos += 8; return v; }
 str() {
  const len = this.u16();
  const s = this.buf.toString('utf8', this.pos, this.pos + len);
  this.pos += len;
  return s;
 }
 payload(type, metaOut) {
  switch (type) {
   case TAG.BYTE: return this.i8();
   case TAG.SHORT: return this.i16();
   case TAG.INT: return this.i32();
   case TAG.LONG: return this.i64();
   case TAG.FLOAT: return this.f32();
   case TAG.DOUBLE: return this.f64();
   case TAG.BYTE_ARRAY: {
    const n = this.i32();
    const arr = new Int8Array(n);
    for (let i = 0; i < n; i++) arr[i] = this.i8();
    return arr;
   }
   case TAG.STRING: return this.str();
   case TAG.LIST: {
    const elemType = this.u8();
    const len = this.i32();
    const arr = new Array(len);
    for (let i = 0; i < len; i++) arr[i] = this.payload(elemType);
    if (metaOut) metaOut.listType = elemType;
    return arr;
   }
   case TAG.COMPOUND: {
    const obj = {};
    while (this.pos < this.buf.length) {
     const t = this.u8();
     if (t === TAG.END) break;
     const name = this.str();
     obj[name] = this.payload(t);
    }
    return obj;
   }
   case TAG.INT_ARRAY: {
    const n = this.i32();
    const arr = new Int32Array(n);
    for (let i = 0; i < n; i++) arr[i] = this.i32();
    return arr;
   }
   case TAG.LONG_ARRAY: {
    const n = this.i32();
    const arr = new BigInt64Array(n);
    for (let i = 0; i < n; i++) arr[i] = this.i64();
    return arr;
   }
   default:
    throw Error(`Unsupported NBT tag type: ${type}`);
  }
 }
 readRoot() {
  const t = this.u8();
  if (t !== TAG.COMPOUND) throw Error(`Expected root TAG_Compound, got ${t}`);
  this.str(); // root name
  return this.payload(TAG.COMPOUND);
 }
}

class NbtWriter {
 constructor() {
  this.chunks = [];
 }
 byte(v) { const b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); this.chunks.push(b); }
 u8(v) { const b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); this.chunks.push(b); }
 i16(v) { const b = Buffer.allocUnsafe(2); b.writeInt16LE(v, 0); this.chunks.push(b); }
 u16(v) { const b = Buffer.allocUnsafe(2); b.writeUInt16LE(v, 0); this.chunks.push(b); }
 i32(v) { const b = Buffer.allocUnsafe(4); b.writeInt32LE(v, 0); this.chunks.push(b); }
 f32(v) { const b = Buffer.allocUnsafe(4); b.writeFloatLE(v, 0); this.chunks.push(b); }
 str(s) {
  const raw = Buffer.from(String(s), 'utf8');
  this.u16(raw.length);
  this.chunks.push(raw);
 }
 tagHeader(type, name) {
  this.u8(type);
  this.str(name);
 }
 writeStateValue(name, val) {
  if (typeof val === 'boolean') {
   this.tagHeader(TAG.BYTE, name);
   this.byte(val ? 1 : 0);
  } else if (typeof val === 'number') {
   this.tagHeader(TAG.INT, name);
   this.i32(val | 0);
  } else {
   this.tagHeader(TAG.STRING, name);
   this.str(val);
  }
 }
 writeStatesCompound(name, states) {
  this.tagHeader(TAG.COMPOUND, name);
  for (const k of Object.keys(states || {}).sort()) {
   this.writeStateValue(k, states[k]);
  }
  this.u8(TAG.END);
 }
 writeListHeader(name, elemType, len) {
  this.tagHeader(TAG.LIST, name);
  this.u8(elemType);
  this.i32(len);
 }
 toBuffer() {
  return Buffer.concat(this.chunks);
 }
}

const BOOL_STATE_NAMES = new Set(['lit', 'crafting', 'hanging']);

function normalizePaletteStates(states) {
 const out = {};
 for (const k of Object.keys(states || {}).sort()) {
  const v = states[k];
  out[k] = (typeof v === 'number' && (k.endsWith('_bit') || BOOL_STATE_NAMES.has(k))) ? Boolean(v) : v;
 }
 return out;
}

export function decodeMcstructure(buffer, { includeAir = false } = {}) {
 const root = new NbtReader(buffer).readRoot();
 const size = root.size;
 const worldOrigin = root.structure_world_origin ?? [0, 0, 0];
 const struct = root.structure;
 const palette = struct.palette.default.block_palette;
 const bpd = struct.palette.default.block_position_data || {};
 const [layer0, layer1] = struct.block_indices;
 const [sx, sy, sz] = size;

 function attachBlockEntity(entry, cellIdx) {
  const be = bpd[String(cellIdx)]?.block_entity_data;
  if (!be) return entry;
  entry.blockEntity = {
   id: be.id,
   items: Array.isArray(be.Items)
    ? be.Items.map(it => ({
      name: it.Name,
      count: it.Count,
      slot: it.Slot,
      damage: it.Damage ?? 0,
     }))
    : [],
  };
  return entry;
 }

 const blocks = [];
 let waterloggedCount = 0;
 for (let i = 0; i < layer0.length; i++) {
  const idx0 = layer0[i];
  const idx1 = layer1 ? layer1[i] : -1;
  if (idx0 < 0 && idx1 < 0) continue;
  const x = Math.floor(i / (sy * sz));
  const y = Math.floor(i / sz) % sy;
  const z = i % sz;
  if (idx0 >= 0) {
   const p = palette[idx0];
   if (!includeAir && p.name === 'minecraft:air') {
    if (idx1 >= 0) {
     const p1 = palette[idx1];
     if (includeAir || p1.name !== 'minecraft:air') {
      blocks.push(attachBlockEntity({ x, y, z, name: p1.name, states: p1.states ? { ...p1.states } : {} }, i));
     }
    }
    continue;
   }
   const entry = attachBlockEntity({ x, y, z, name: p.name, states: p.states ? { ...p.states } : {} }, i);
   if (idx1 >= 0) {
    const p1 = palette[idx1];
    if (p1.name.includes('water')) {
     entry.waterlogged = true;
     waterloggedCount++;
    }
   }
   blocks.push(entry);
  } else if (idx1 >= 0) {
   const p1 = palette[idx1];
   if (!includeAir && p1.name === 'minecraft:air') continue;
   blocks.push(attachBlockEntity({ x, y, z, name: p1.name, states: p1.states ? { ...p1.states } : {} }, i));
  }
 }

 const entities = (struct.entities || []).map(e => ({
  identifier: e.identifier,
  position: e.Pos ? [...e.Pos] : [0, 0, 0],
  rotation: e.Rotation ? [...e.Rotation] : [0, 0],
 }));

 return {
  formatVersion: root.format_version ?? 1,
  size,
  worldOrigin,
  blocks,
  entities,
  paletteSize: palette.length,
  waterloggedCount,
 };
}

export function encodeMcstructure({ size, worldOrigin = [0, 0, 0], blocks = [], entities = [] }) {
 const [sx, sy, sz] = size;
 const total = sx * sy * sz;
 const layer0 = new Int32Array(total).fill(-1);
 const layer1 = new Int32Array(total).fill(-1);

 const palette = [];
 const paletteMap = new Map();
 function internBlock(name, states) {
  const norm = normalizePaletteStates(states);
  const sig = name + '|' + JSON.stringify(norm);
  let idx = paletteMap.get(sig);
  if (idx !== undefined) return idx;
  idx = palette.length;
  paletteMap.set(sig, idx);
  palette.push({ name, states: norm, version: DEFAULT_BLOCK_VERSION });
  return idx;
 }

 const blockEntities = [];
 for (const b of blocks) {
  if (b.x < 0 || b.y < 0 || b.z < 0 || b.x >= sx || b.y >= sy || b.z >= sz) {
   throw Error(`Block out of structure bounds [${sx},${sy},${sz}]: (${b.x},${b.y},${b.z})`);
  }
  const cellIdx = b.x * (sy * sz) + b.y * sz + b.z;
  layer0[cellIdx] = internBlock(b.name, b.states);
  if (b.waterlogged) {
   layer1[cellIdx] = internBlock('minecraft:water', { liquid_depth: 0 });
  }
  if (b.blockEntity || b.items) {
   const be = b.blockEntity || { id: b.name.endsWith('dispenser') ? 'Dispenser' : 'Chest', items: b.items };
   blockEntities.push({ cellIdx, x: b.x, y: b.y, z: b.z, id: be.id, items: be.items || [] });
  }
 }

 const w = new NbtWriter();
 w.tagHeader(TAG.COMPOUND, '');
 w.tagHeader(TAG.INT, 'format_version');
 w.i32(1);

 w.writeListHeader('size', TAG.INT, 3);
 w.i32(sx); w.i32(sy); w.i32(sz);

 w.tagHeader(TAG.COMPOUND, 'structure');

 w.writeListHeader('block_indices', TAG.LIST, 2);
 for (const layer of [layer0, layer1]) {
  w.u8(TAG.INT);
  w.i32(layer.length);
  for (let i = 0; i < layer.length; i++) w.i32(layer[i]);
 }

 w.writeListHeader('entities', entities.length ? TAG.COMPOUND : TAG.END, entities.length);
 for (const ent of entities) {
  w.tagHeader(TAG.STRING, 'identifier');
  w.str(ent.identifier || 'minecraft:hopper_minecart');
  const pos = ent.position || [0, 0, 0];
  w.writeListHeader('Pos', TAG.FLOAT, 3);
  w.f32(pos[0]); w.f32(pos[1]); w.f32(pos[2]);
  const rot = ent.rotation || [0, 0];
  w.writeListHeader('Rotation', TAG.FLOAT, 2);
  w.f32(rot[0]); w.f32(rot[1]);
  w.u8(TAG.END);
 }

 w.tagHeader(TAG.COMPOUND, 'palette');
 w.tagHeader(TAG.COMPOUND, 'default');
 w.writeListHeader('block_palette', TAG.COMPOUND, palette.length);
 for (const entry of palette) {
  w.tagHeader(TAG.STRING, 'name');
  w.str(entry.name);
  w.writeStatesCompound('states', entry.states);
  w.tagHeader(TAG.INT, 'version');
  w.i32(entry.version);
  w.u8(TAG.END);
 }
 w.tagHeader(TAG.COMPOUND, 'block_position_data');
 for (const be of blockEntities) {
  w.tagHeader(TAG.COMPOUND, String(be.cellIdx));
  w.tagHeader(TAG.COMPOUND, 'block_entity_data');
  w.tagHeader(TAG.STRING, 'id');
  w.str(be.id);
  w.tagHeader(TAG.BYTE, 'isMovable');
  w.byte(1);
  w.tagHeader(TAG.INT, 'x');
  w.i32(be.x);
  w.tagHeader(TAG.INT, 'y');
  w.i32(be.y);
  w.tagHeader(TAG.INT, 'z');
  w.i32(be.z);
  const items = be.items || [];
  w.writeListHeader('Items', items.length ? TAG.COMPOUND : TAG.END, items.length);
  for (const it of items) {
   w.tagHeader(TAG.BYTE, 'Count');
   w.byte(it.count ?? 1);
   w.tagHeader(TAG.SHORT, 'Damage');
   w.i16(it.damage ?? 0);
   w.tagHeader(TAG.STRING, 'Name');
   w.str(it.name);
   w.tagHeader(TAG.BYTE, 'Slot');
   w.byte(it.slot ?? 0);
   w.tagHeader(TAG.BYTE, 'WasPickedUp');
   w.byte(0);
   w.u8(TAG.END);
  }
  w.u8(TAG.END); // block_entity_data
  w.u8(TAG.END); // cellIdx
 }
 w.u8(TAG.END); // block_position_data
 w.u8(TAG.END); // default
 w.u8(TAG.END); // palette
 w.u8(TAG.END); // structure

 w.writeListHeader('structure_world_origin', TAG.INT, 3);
 w.i32(worldOrigin[0]); w.i32(worldOrigin[1]); w.i32(worldOrigin[2]);
 w.u8(TAG.END); // root

 return w.toBuffer();
}
