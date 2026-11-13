import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const sourceUrl=new URL('data/bamboo-final-source.json',import.meta.url);
const baselineUrl=new URL('../public/model-survival-2026-11-10.json',import.meta.url);
const entitiesUrl=new URL('data/bamboo-cushions.json',import.meta.url);
const sha256=value=>createHash('sha256').update(value).digest('hex');
const key=b=>[b.x,b.y,b.z].join(',');
const clone=value=>structuredClone(value);
const bounds=blocks=>{
 const min=['x','y','z'].map(a=>Math.min(...blocks.map(b=>b[a])));
 const max=['x','y','z'].map(a=>Math.max(...blocks.map(b=>b[a])));
 return {min,max,size:max.map((v,i)=>v-min[i]+1)};
};
// A proper rotation, never a reflection: the original short bridges remain untouched.
export function rotateBridgeBlock(block,turns){
 const b=clone(block),s=b.states;
 const plane=(x,z)=>{for(let i=0;i<turns;i++)[x,z]=[-z,x];return [x||0,z||0];};
 [b.x,b.z]=plane(b.x,b.z);
 for(const [state,vectors] of [['weirdo_direction',[[1,0],[-1,0],[0,1],[0,-1]]],['direction',[[-1,0],[1,0],[0,-1],[0,1]]]]){
  if(!Object.hasOwn(s,state))continue;
  const v=plane(...vectors[s[state]]);s[state]=vectors.findIndex(w=>w[0]===v[0]&&w[1]===v[1]);
 }
 const dirs=['east','south','west','north'];
 for(const prefix of ['minecraft:connection_','wall_connection_type_']){
  const original={...s};
  for(let i=0;i<4;i++)if(Object.hasOwn(original,prefix+dirs[i]))s[prefix+dirs[(i+turns)%4]]=original[prefix+dirs[i]];
 }
 if(turns%2&&['x','z'].includes(s.pillar_axis))s.pillar_axis=s.pillar_axis==='x'?'z':'x';
 return b;
}

export async function generateBamboo(options={}){
 const {longBridgeSide='west'}=options;
 if(Object.keys(options).some(k=>k!=='longBridgeSide'))throw Error('Unsupported option: source geometry and bamboo position are fixed');
 if(longBridgeSide!=='west')throw Error('User-approved long bridge side is west');
 const [sourceRaw,baselineRaw,entitiesRaw]=await Promise.all([readFile(sourceUrl),readFile(baselineUrl),readFile(entitiesUrl)]);
 const source=JSON.parse(sourceRaw),baseline=JSON.parse(baselineRaw),[cx,baseY,cz]=source.center;
 const oldLong=baseline.blocks.filter(b=>b.z>22);
 const length=Math.max(...oldLong.map(b=>b.z))-Math.min(...oldLong.map(b=>b.z))+1;
 if(length!==36)throw Error('Baseline long bridge length changed');
 const cells=new Map();
 const put=b=>{if(cells.has(key(b)))throw Error('Cell conflict '+key(b));cells.set(key(b),b);};
 for(const b of source.blocks){
  const p=clone(b),originalPosition=[b.x,b.y,b.z];
  p.source={kind:'world',position:originalPosition};
  put(p);
 }
 // Front source short bridge: d=6..9 are longitudinal details, d=10 its frame,
 // d=11 the outward entry stair. Extend only the repeated span to d=41.
 const front=source.blocks.filter(b=>b.module==='south');
 const template=d=>front.filter(b=>b.z-cz===d);
 const terminal=template(10),entry=template(11);
 if(front.length!==41||terminal.length!==16||entry.length!==1)throw Error('Short bridge source geometry changed');
 const start=6,end=start+length-1,frame=end-1,turns=1;
 const generated=[];
 // The source only has a threshold on its two finished bridge sides. Supply
 // that same real stair at the new entrance without replacing source cells.
 const threshold=source.blocks.find(b=>b.x===cx&&b.z===cz+5&&b.y===baseY+1);
 if(!threshold||threshold.name!=='minecraft:mud_brick_stairs')throw Error('Source entrance threshold changed');
 const connector=rotateBridgeBlock({...clone(threshold),x:0,z:5},turns);
 connector.x+=cx;connector.z+=cz;connector.module='house';
 connector.source={kind:'bridge-connection',templatePosition:[threshold.x,threshold.y,threshold.z]};
 put(connector);
 // Match the roof-to-house join to the existing front short bridge.
 // Reorient saved bamboo slabs and trapdoors to the west; only the narrow
 // entrance strip is adjusted, retaining original coordinates as provenance.
 const roofJoin=[];
 for(const d of [4,5])for(const a of [-1,0,1])for(const y of [baseY+5,baseY+6]){
  const original=source.blocks.find(b=>b.x===cx+a&&b.y===y&&b.z===cz+d);
  if(!original||!['minecraft:bamboo_slab','minecraft:bamboo_trapdoor'].includes(original.name))continue;
  const piece=rotateBridgeBlock({...clone(original),x:a,z:d},turns);piece.x+=cx;piece.z+=cz;piece.module='house';
  const previous=cells.get(key(piece));
  piece.source={kind:'bridge-roof-join',templatePosition:[original.x,original.y,original.z],replaced:previous?{name:previous.name,states:previous.states,position:[previous.x,previous.y,previous.z]}:null};
  cells.set(key(piece),piece);roofJoin.push(piece);
 }
 for(let d=start;d<end;d++){
  const isFrame=d===frame||(d%10===0&&d<frame);
  const original=isFrame?terminal:template(6+(d-start)%4);
  for(const b of original){
   const p=rotateBridgeBlock({...clone(b),x:b.x-cx,z:d},turns);
   p.x+=cx;p.z+=cz;p.module=longBridgeSide;
   p.source={kind:'bridge-design',templatePosition:[b.x,b.y,b.z],longitudinalDistance:d};
   generated.push(p);put(p);
  }
 }
 for(const b of entry){
  const p=rotateBridgeBlock({...clone(b),x:b.x-cx,z:end},turns);
  p.x+=cx;p.z+=cz;p.module=longBridgeSide;
  p.source={kind:'bridge-design',templatePosition:[b.x,b.y,b.z],longitudinalDistance:end};
  generated.push(p);put(p);
 }
 const worldBlocks=[...cells.values()],worldBounds=bounds(worldBlocks);
 const blocks=worldBlocks.map(b=>({...b,x:b.x-worldBounds.min[0],y:b.y-worldBounds.min[1],z:b.z-worldBounds.min[2]})).sort((a,b)=>a.y-b.y||a.z-b.z||a.x-b.x);
 const labels={house:'Casa finalizada',south:'Ponte frontal · curta',east:'Ponte lateral · curta',north:'Ponte maior · 36 blocos',west:'Ponte maior · 36 blocos',vegetation:'Bambu dos fundos'};
 const modules=[...new Set(blocks.map(b=>b.module))].map(id=>{const scoped=blocks.filter(b=>b.module===id);return {id,label:labels[id],count:scoped.length,bounds:bounds(scoped)};});
 const model={
  schemaVersion:2,version:'bamboo-final-2026-11-12',size:worldBounds.size,
  sha256:sha256(JSON.stringify(blocks)),sourceSha256:sha256(sourceRaw),baselineSha256:sha256(baselineRaw),
  sourceWorld:source.world,sourceWorldVersion:source.worldVersion,worldOrigin:worldBounds.min,
  orientation:{front:[0,0,1],back:[0,0,-1],right:[1,0,0],description:'Frente pela ponte curta +Z; bambu marcador nos fundos -Z.'},
  anchors:{centerWorld:[cx,baseY,cz],center:[cx-worldBounds.min[0],baseY-worldBounds.min[1],cz-worldBounds.min[2]],bambooBaseWorld:[-4,-60,-16],bambooBase:[-4-worldBounds.min[0],-60-worldBounds.min[1],-16-worldBounds.min[2]],axis:'Central floor scaffolding and rear bamboo share world X=-4'},
  composition:{sourceCells:source.blocks.length,preservedSourceCells:false,roofJoinCells:roofJoin.length,connectionCells:1,longBridge:{module:longBridgeSide,length,width:3,generatedCells:generated.length,frameDistances:[10,20,30,40],source:'Final front short bridge sections; measured survival bridge length'},bambooPositionPreserved:true,layoutEvidence:'User annotated reference 2026-11-12: long bridge on free west side; front +Z; rear bamboo stays relative to house'},
  modules,blocks,entities:JSON.parse(entitiesRaw).entities
 };
 return model;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.slice(2).some(v=>!v.startsWith('--side=')))throw Error('Only --side=west is supported; the approved source layout is fixed');
 const side=process.argv.find(v=>v.startsWith('--side='))?.split('=')[1]??'west';
 const model=await generateBamboo({longBridgeSide:side});
 await writeFile(new URL('public/model.json',root),JSON.stringify(model));
 console.log(JSON.stringify({count:model.blocks.length,size:model.size,modules:model.modules,composition:model.composition},null,2));
}
