import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const farmStructSrc = resolve(rootDir, 'buildsmine/public/estruturas/farm_musgo_bedrock.mcstructure');
const packBaseDir = resolve(rootDir, 'minecraft-editor/buildsmine-farms');
const bpDir = resolve(packBaseDir, 'buildsmine_farms_bp');
const structDestDir = resolve(bpDir, 'structures/farms');
const fnDestDir = resolve(bpDir, 'functions');

mkdirSync(structDestDir, { recursive: true });
mkdirSync(fnDestDir, { recursive: true });

const manifest = {
 format_version: 2,
 header: {
  name: 'BuildsMine - Farms Bedrock (Survival)',
  description: 'Estruturas e funcoes de carregamento das farms auditadas no BuildsMine para Minecraft Bedrock.',
  uuid: 'b7d42e10-81a3-4f92-9c1e-3a7f5e210001',
  version: [1, 0, 2],
  min_engine_version: [1, 21, 0],
 },
 modules: [
  {
   type: 'data',
   uuid: 'b7d42e10-81a3-4f92-9c1e-3a7f5e210002',
   version: [1, 0, 2],
  },
 ],
};

const manifestPath = resolve(bpDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const structDest = resolve(structDestDir, 'farm_musgo_bedrock.mcstructure');
const structV2Dest = resolve(structDestDir, 'farm_musgo_v2.mcstructure');
const structV3Dest = resolve(structDestDir, 'farm_musgo_v3.mcstructure');
const standaloneV2Path = resolve(packBaseDir, 'farm_musgo_v2_bedrock.mcstructure');
const standaloneV3Path = resolve(packBaseDir, 'farm_musgo_v3_bedrock.mcstructure');
copyFileSync(farmStructSrc, structDest);
copyFileSync(farmStructSrc, structV2Dest);
copyFileSync(farmStructSrc, structV3Dest);
copyFileSync(farmStructSrc, standaloneV2Path);
copyFileSync(farmStructSrc, standaloneV3Path);

const makeLoadFn = (structureRef) => [
 `structure load ${structureRef} ~ ~ ~`,
 'replaceitem block ~7 ~4 ~7 slot.container 0 bone_meal 64',
].join('\n') + '\n';

const fnPath = resolve(fnDestDir, 'carregar_farm_musgo.mcfunction');
const fnV2Path = resolve(fnDestDir, 'carregar_farm_musgo_v2.mcfunction');
const fnV3Path = resolve(fnDestDir, 'carregar_farm_musgo_v3.mcfunction');
writeFileSync(fnPath, makeLoadFn('farms:farm_musgo_bedrock'));
writeFileSync(fnV2Path, makeLoadFn('farms:farm_musgo_v2'));
writeFileSync(fnV3Path, makeLoadFn('farms:farm_musgo_v3'));

// Build ZIP (.mcpack) using Node built-in zlib
function crc32(buf) {
 let c = 0xffffffff;
 for (let i = 0; i < buf.length; i++) {
  c ^= buf[i];
  for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
 }
 return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
 const localChunks = [];
 const centralChunks = [];
 let offset = 0;
 for (const { name, data } of entries) {
  const nameBuf = Buffer.from(name, 'utf8');
  const compressed = deflateRawSync(data);
  const crc = crc32(data);

  const local = Buffer.alloc(30 + nameBuf.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  nameBuf.copy(local, 30);

  localChunks.push(local, compressed);

  const central = Buffer.alloc(46 + nameBuf.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(offset, 42);
  nameBuf.copy(central, 46);

  centralChunks.push(central);
  offset += local.length + compressed.length;
 }

 const centralBuf = Buffer.concat(centralChunks);
 const eocd = Buffer.alloc(22);
 eocd.writeUInt32LE(0x06054b50, 0);
 eocd.writeUInt16LE(0, 4);
 eocd.writeUInt16LE(0, 6);
 eocd.writeUInt16LE(entries.length, 8);
 eocd.writeUInt16LE(entries.length, 10);
 eocd.writeUInt32LE(centralBuf.length, 12);
 eocd.writeUInt32LE(offset, 16);
 eocd.writeUInt16LE(0, 20);

 return Buffer.concat([...localChunks, centralBuf, eocd]);
}

const mcpackPath = resolve(packBaseDir, 'BuildsMine_Farms_Bedrock.mcpack');
const zipBuf = buildZip([
 { name: 'manifest.json', data: readFileSync(manifestPath) },
 { name: 'functions/carregar_farm_musgo.mcfunction', data: readFileSync(fnPath) },
 { name: 'functions/carregar_farm_musgo_v2.mcfunction', data: readFileSync(fnV2Path) },
 { name: 'functions/carregar_farm_musgo_v3.mcfunction', data: readFileSync(fnV3Path) },
 { name: 'structures/farms/farm_musgo_bedrock.mcstructure', data: readFileSync(structDest) },
 { name: 'structures/farms/farm_musgo_v2.mcstructure', data: readFileSync(structV2Dest) },
 { name: 'structures/farms/farm_musgo_v3.mcstructure', data: readFileSync(structV3Dest) },
]);
writeFileSync(mcpackPath, zipBuf);

console.log(JSON.stringify({ ok: true, mcpackPath, bytes: zipBuf.length }));
