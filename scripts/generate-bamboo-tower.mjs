import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const model=JSON.parse(await readFile(new URL('../public/model.json',import.meta.url),'utf8'));
const source=structuredClone(model.blocks), center=41, bridgeCenter=18;
// The upper room is widened by one central column to align with the bridge.
// Its base supports stay outside the walking corridor; the floor stays at Y1.
const key=b=>`${b.x},${b.y},${b.z}`,cells=new Map(source.map(b=>[key(b),b]));
const removed=[];
for(const b of source)if(b.module==='west'&&b.x>=14&&b.x<=21&&b.y>=2&&b.z>=3&&b.z<=9){cells.delete(key(b));removed.push(b);}
const from=(id)=>source.find(b=>b.name==='minecraft:'+id);
const put=(x,y,z,id,states={})=>{const b={x,y,z,name:'minecraft:'+id,states,version:from(id).version,module:'tower',source:{kind:'tower-design'}};const k=key(b);if(cells.has(k))throw Error('tower collision '+k);cells.set(k,b);};
// A small open entrance carries the actual upper-room profile above the bridge.
// The four short supports sit outside the three-wide walking corridor.
for(let y=2;y<=4;y++)for(const x of [15,20])for(const z of [4,8])put(x,y,z,'bamboo_block',{pillar_axis:'y'});
// A ring at Y5 transfers the shaft to its base while leaving three clear blocks.
for(let x=15;x<=20;x++)for(const z of [4,8])put(x,5,z,'bamboo_planks');
for(let z=5;z<=7;z++)for(const x of [15,20])put(x,5,z,'bamboo_planks');
for(const x of [16,19])for(const z of [5,7])put(x,5,z,'bamboo_planks');
// Extend the four bamboo cells of the actual upper room, not an external frame.
for(let y=6;y<=35;y++)for(const x of [16,19])for(const z of [5,7])put(x,y,z,'bamboo_block',{pillar_axis:'y'});
// Repeat the room's real gate and trapdoor details along the vertical shaft.
const ornaments=source.filter(b=>b.module==='house'&&b.y===9&&['minecraft:bamboo_fence_gate','minecraft:bamboo_trapdoor'].includes(b.name));
for(const y of [9,13,17,21,25,29,33])for(const b of ornaments){
 const targets=b.x<center?[b.x-24]:b.x>center?[b.x-23]:[17,18];
 for(const x of targets){const c=structuredClone(b);c.x=x;c.y=y;c.module='tower';c.source={kind:'tower-house-ornament',template:[b.x,b.y,b.z]};if(!cells.has(key(c)))cells.set(key(c),c);}
}
// Echo the house roof and lanterns using existing, correctly oriented states.
// Split the original center column in two: the sole widening needed to make
// an even-width roof align with the bridge midpoint.
const roof=source.filter(b=>b.module==='house'&&b.y>=7&&b.y<=12&&b.name!=='minecraft:scaffolding');
for(const b of roof){const targets=b.x<center?[b.x-24]:b.x>center?[b.x-23]:[17,18];for(const x of targets){const c=structuredClone(b);c.x=x;c.y=b.y+29;c.module='tower';c.source={kind:'tower-house-roof',template:[b.x,b.y,b.z]};if(cells.has(key(c)))throw Error('roof collision '+key(c));cells.set(key(c),c);}}
// Copy only the eight roof cushions to their matching duplicated supports.
const originalEntities=structuredClone(model.entities),newEntities=[];
for(const e of originalEntities.filter(e=>e.identifier==='minecraft:cushion'&&e.position[1]===-49.5)){
 const localX=Math.floor(e.position[0])-model.worldOrigin[0],targets=localX<center?[e.position[0]-24]:localX>center?[e.position[0]-23]:[e.position[0]-24,e.position[0]-23];
 for(const x of targets){const c=structuredClone(e);c.position=[x,e.position[1]+29,e.position[2]];c.source='tower-copy';newEntities.push(c);}
}
model.blocks=[...cells.values()].sort((a,b)=>a.y-b.y||a.z-b.z||a.x-b.x);model.entities=[...originalEntities,...newEntities];
model.size=[53,42,18];model.version='bamboo-tower-v1';model.sha256=createHash('sha256').update(JSON.stringify(model.blocks)).digest('hex');
const tower=model.blocks.filter(b=>b.module==='tower');model.modules.push({id:'tower',label:'Torre · estudo 40 blocos',count:tower.length,bounds:{min:[14,2,3],max:[21,41,9],size:[8,40,7]}});
for(const module of model.modules){const scope=model.blocks.filter(b=>b.module===module.id);module.count=scope.length;}
model.composition.tower={height:40,baseY:2,topY:41,centerX:18,footprint:[4,3],entranceFootprint:[6,5],roofFootprint:[8,7],removedBridgeCells:removed.length,roofSource:'Casa de bambu Y7–Y12, widened along central axis',passage:'three blocks wide and at least three blocks high'};
for(let x=14;x<=21;x++)for(let y=2;y<=4;y++)for(let z=5;z<=7;z++)if(cells.has(`${x},${y},${z}`))throw Error('blocked passage');
await writeFile(new URL('../public/model-tower-v1.json',import.meta.url),JSON.stringify(model));
console.log(JSON.stringify({blocks:model.blocks.length,tower:tower.length,entities:model.entities.length,removed:removed.length,composition:model.composition.tower}));
