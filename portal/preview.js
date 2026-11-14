const textureSources={"stripped_mangrove_log_top":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/stripped_mangrove_log_top.png","stripped_mangrove_log_side":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/stripped_mangrove_log_side.png","mangrove_planks":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/mangrove_planks.png","mangrove_trapdoor":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/mangrove_trapdoor.png","red_nether_brick":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/red_nether_brick.png","deepslate_bricks":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/deepslate/deepslate_bricks.png","polished_deepslate":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/deepslate/polished_deepslate.png","chiseled_copper":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/chiseled_copper.png","oxidized_copper_grate":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/oxidized_copper_grate.png","copper_trapdoor":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/copper_trapdoor.png","copper_chain1":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/copper_chain1.png","copper_chain2":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/copper_chain2.png","spruce_trapdoor":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/spruce_trapdoor.png","cobblestone":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/cobblestone.png","cobblestone_mossy":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/cobblestone_mossy.png","stonebrick":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/stonebrick.png","lantern":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/lantern.png","shroomlight":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/shroomlight.png","mangrove_door_bottom":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/mangrove_door_bottom.png","mangrove_door_top":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/mangrove_door_top.png","piston_inner":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/piston_inner.png","lever":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/lever.png","piston_top_sticky":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/piston_top_sticky.png","repeater_off":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/repeater_off.png","piston_side":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/piston_side.png","repeater_on":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/repeater_on.png","redstone_dust_cross":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/redstone_dust_cross.png","piston_bottom":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/piston_bottom.png","redstone_torch_off":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/redstone_torch_off.png","redstone_torch_on":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/redstone_torch_on.png","redstone_dust_line":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/redstone_dust_line.png","stone_slab_top":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/stone_slab_top.png","comparator_off":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/comparator_off.png","comparator_on":"https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.50.4/resource_pack/textures/blocks/comparator_on.png"};
import * as T from 'three';
import {OrbitControls} from '/portal/vendor/OrbitControls.js';
const versions=await (await fetch('/portal/versions/index.json')).json();
const chosen=versions.items.find(v=>v.id===new URLSearchParams(location.search).get('version'))||versions.items.find(v=>v.id===versions.default);
const model=await (await fetch(chosen.url)).json();
const versionSelect=document.createElement('select');versionSelect.id='version';versionSelect.setAttribute('aria-label','Versão do projeto');
versionSelect.innerHTML=versions.items.map(v=>`<option value="${v.id}">${v.label}</option>`).join('');versionSelect.value=chosen.id;
document.querySelector('#stage').before(versionSelect);
versionSelect.onchange=()=>{const url=new URL(location.href);url.searchParams.set('version',versionSelect.value);location.href=url.href;};
const lightingControls=document.createElement('div');lightingControls.className='lighting-controls';lightingControls.setAttribute('role','group');lightingControls.setAttribute('aria-label','Iluminação');
lightingControls.innerHTML='<button id="day-mode" aria-pressed="true">Dia</button><button id="night-mode" aria-pressed="false" title="Simulação aproximada da iluminação noturna">Noite</button>';
const materialsToggle=document.createElement('button');materialsToggle.id='materials-toggle';materialsToggle.setAttribute('aria-expanded','false');materialsToggle.setAttribute('aria-controls','materials-panel');materialsToggle.innerHTML='Materiais<span id="material-count" class="material-badge"></span>';
document.querySelector('[data-view="top"]').after(lightingControls,materialsToggle);
const inspectToggle=document.createElement('button');inspectToggle.id='inspect-toggle';inspectToggle.textContent='Inspecionar';inspectToggle.setAttribute('aria-pressed','false');inspectToggle.setAttribute('aria-controls','block-inspector');materialsToggle.after(inspectToggle);
const mobileView=document.createElement('select');mobileView.id='mobile-view';mobileView.setAttribute('aria-label','Vista da construção');
mobileView.innerHTML=[['iso','Perspectiva'],['front','Frente'],['back','Verso'],['left','Esquerda'],['right','Direita'],['top','Topo']].map(([id,label])=>`<option value="${id}">${label}</option>`).join('');document.querySelector('nav').prepend(mobileView);
const mobileMore=document.createElement('button');mobileMore.id='mobile-more';mobileMore.textContent='Mais';mobileMore.setAttribute('aria-label','Mais controles');mobileMore.setAttribute('aria-expanded','false');
document.querySelector('nav').append(mobileMore);mobileMore.onclick=()=>{const open=document.querySelector('nav').classList.toggle('more-open');mobileMore.setAttribute('aria-expanded',String(open));positionMaterials();};
function positionMaterials(){
 const bottom=(innerHeight-document.querySelector('nav').getBoundingClientRect().top+10)+'px';
 document.querySelector('#materials-panel').style.bottom=bottom;document.querySelector('#block-inspector').style.bottom=innerWidth<=600?bottom:'auto';
 if(window.portal)frameMobileScene();
}
window.addEventListener('resize',positionMaterials);
const scene=new T.Scene();scene.background=new T.Color('#e9e4db');
scene.fog=new T.Fog('#e9e4db',140,260);
// A continuous sky/ground backdrop also fills rays below the floor after
// orbiting an orthographic camera; no blue rectangle under the ground plane.
const backdropCanvas=document.createElement('canvas');backdropCanvas.width=2;backdropCanvas.height=256;
const backdropContext=backdropCanvas.getContext('2d'),backdrop=new T.CanvasTexture(backdropCanvas);backdrop.colorSpace=T.SRGBColorSpace;
let backdropMode='editor';
function updateBackdrop(night){
 const sky=backdropMode==='editor'?(night?'#0d1930':'#7eb0ff'):backdropMode==='studio'?(night?'#1c212b':'#ffffff'):(night?'#33476a':'#e9e4db');
 const horizon=backdropMode==='editor'?(night?'#142342':'#cbe2ff'):backdropMode==='studio'?(night?'#13171e':'#f4f6f9'):(night?'#33476a':'#e9e4db');
 const floor=backdropMode==='editor'?(night?'#101d35':'#bcd6fa'):backdropMode==='studio'?(night?'#12161d':'#fafbfc'):(night?'#0d1d1f':'#d3cbbd');
 const gradient=backdropContext.createLinearGradient(0,0,0,256);gradient.addColorStop(0,sky);gradient.addColorStop(.45,horizon);gradient.addColorStop(.85,floor);gradient.addColorStop(1,floor);
 backdropContext.fillStyle=gradient;backdropContext.fillRect(0,0,2,256);backdrop.needsUpdate=true;scene.background=backdrop;scene.fog.color.set(horizon);
 if(typeof ground!=='undefined')ground.material.color.set(backdropMode==='studio'?(night?'#13171e':'#f6f7fa'):backdropMode==='editor'?(night?'#122038':'#bfd8fa'):(night?'#69776a':'#d3cbbd'));
}
updateBackdrop(false);
const renderer=new T.WebGLRenderer({antialias:true});
let economy=innerWidth<760,renderFrame=0;
renderer.setPixelRatio(Math.min(devicePixelRatio,economy?1:1.5));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=!economy;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
document.body.prepend(renderer.domElement);
renderer.domElement.id='scene-canvas';
const camera=new T.OrthographicCamera(-40,40,30,-30,.1,400);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(model.center[0]+.5,model.center[1],model.center[2]+.5);controls.enableDamping=false;
const ambient=new T.HemisphereLight('#fff6dd','#8b8f92',2);scene.add(ambient);
const sun=new T.DirectionalLight('#fff5de',3.1);sun.position.set(-12,65,-24);sun.target.position.set(31,0,8);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-55,right:55,top:48,bottom:-48,near:1,far:150});sun.shadow.normalBias=.03;sun.shadow.bias=-.00005;scene.add(sun,sun.target);
const ground=new T.Mesh(new T.PlaneGeometry(2000,2000),new T.MeshStandardMaterial({color:'#bfd8fa',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(31,-.02,8);ground.receiveShadow=true;scene.add(ground);updateBackdrop(false);
const loader=new T.TextureLoader(),textures={};
const textureNames=[...new Set(Object.values(model.catalog).flatMap(spec=>Object.values(spec.faces)).map(file=>file.split('/').pop()))];
await Promise.all(textureNames.map(async name=>{
 const tex=await loader.loadAsync(textureSources[name]);tex.magFilter=T.NearestFilter;tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;tex.colorSpace=T.SRGBColorSpace;textures[name]=tex;
}));
// Union on the native 1/16 grid. Exposed quads use UVs cropped from the full tile.
function geometry(boxes){
 const solid=new Uint8Array(4096),idx=(x,y,z)=>x+y*16+z*256;
 for(const [x0,x1,y0,y1,z0,z1]of boxes)for(let z=z0;z<z1;z++)for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)solid[idx(x,y,z)]=1;
 const at=(x,y,z)=>x>=0&&x<16&&y>=0&&y<16&&z>=0&&z<16&&solid[idx(x,y,z)];
 const p=[],n=[],uv=[],g=new T.BufferGeometry();
 for(let face=0;face<6;face++){
  const start=p.length/3,axis=face>>1,sign=face%2===0?1:-1,normal=[0,0,0];normal[axis]=sign;
  for(let plane=0;plane<=16;plane++){
   const mask=new Uint8Array(256);
   for(let v=0;v<16;v++)for(let u=0;u<16;u++){
    const a=axis===0?[plane-(sign>0?1:0),v,u]:axis===1?[u,plane-(sign>0?1:0),v]:[u,v,plane-(sign>0?1:0)];
    const b=[...a];b[axis]+=sign;if(at(...a)&&!at(...b))mask[u+16*v]=1;
   }
   for(let v=0;v<16;v++)for(let u=0;u<16;u++){
    if(!mask[u+v*16])continue;let w=1,h=1;
    while(u+w<16&&mask[u+w+v*16])w++;
    outer:while(v+h<16){for(let j=0;j<w;j++)if(!mask[u+j+(v+h)*16])break outer;h++;}
    for(let yy=v;yy<v+h;yy++)for(let xx=u;xx<u+w;xx++)mask[xx+yy*16]=0;
    const a=u/16,b=(u+w)/16,c=v/16,d=(v+h)/16,k=plane/16;
    const q=[[[k,c,b],[k,c,a],[k,d,a],[k,d,b]],[[k,c,a],[k,c,b],[k,d,b],[k,d,a]],[[a,k,d],[b,k,d],[b,k,c],[a,k,c]],[[a,k,c],[b,k,c],[b,k,d],[a,k,d]],[[a,c,k],[b,c,k],[b,d,k],[a,d,k]],[[b,c,k],[a,c,k],[a,d,k],[b,d,k]]][face];
    for(const i of [0,1,2,0,2,3]){const t=q[i];p.push(...t);n.push(...normal);uv.push(...(face===0?[1-t[2],t[1]]:face===1?[t[2],t[1]]:face===2?[t[0],1-t[2]]:face===3?[t[0],t[2]]:face===4?[t[0],t[1]]:[1-t[0],t[1]]));}
   }
  }
  g.addGroup(start,p.length/3-start,face);
 }
 g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;
}
function boxes(b){
 const s=b.states,n=b.name;
 if(n.endsWith('_slab'))return[[0,16,s['minecraft:vertical_half']==='top'?8:0,s['minecraft:vertical_half']==='top'?16:8,0,16]];
 if(n.endsWith('_stairs')){
  const a=[[0,16,0,8,0,16]],d=s.weirdo_direction,corner=s['minecraft:corner'];
  // Corner halves/quarters are real native stair states. Build their upper
  // occupancy on the pixel grid, keeping outer hips and inner roof valleys.
  const toward=[[1,0],[-1,0],[0,1],[0,-1]][d],left=[toward[1],-toward[0]];
  for(const [x0,x1]of [[0,8],[8,16]])for(const [z0,z1]of [[0,8],[8,16]]){
   const x=(x0+x1)/2-8,z=(z0+z1)/2-8,high=x*toward[0]+z*toward[1]>0,l=x*left[0]+z*left[1]>0;
   const occupied=corner==='outer_left'?high&&l:corner==='outer_right'?high&&!l:corner==='inner_left'?high||l:corner==='inner_right'?high||!l:high;
   if(occupied)a.push([x0,x1,8,16,z0,z1]);
  }
  return s.upside_down_bit?a.map(([a,b,c,d,e,f])=>[a,b,16-d,16-c,e,f]):a;
 }
 if(n.endsWith('_trapdoor')){
  if(!s.open_bit)return[[0,16,s.upside_down_bit?13:0,s.upside_down_bit?16:3,0,16]];
  return[s.direction===1?[13,16,0,16,0,16]:s.direction===0?[0,3,0,16,0,16]:s.direction===3?[0,16,0,16,13,16]:[0,16,0,16,0,3]];
 }
 if(n.endsWith(':lantern'))return[[5,11,2,9,5,11],[4,12,1,2,4,12],[4,12,9,10,4,12],[6,10,10,12,6,10],[7,9,12,16,7,9]];
 if(n.endsWith('_door')){
  const directions=['north','east','south','west'];let d=directions.indexOf(s['minecraft:cardinal_direction']);
  if(s.open_bit)d=(d+(s.door_hinge_bit?3:1))%4;
  return [[0,16,0,16,0,3],[13,16,0,16,0,16],[0,16,0,16,13,16],[0,3,0,16,0,16]].filter((_,i)=>i===d);
 }
 if(n==='minecraft:sticky_piston'){
  if(!b.previewExtended)return[[0,16,0,16,0,16]];
  return s.facing_direction===4?[[0,12,0,16,0,16],[12,16,6,10,6,10]]:[[4,16,0,16,0,16],[0,4,6,10,6,10]];
 }
 if(n==='minecraft:sticky_piston_arm_collision')return s.facing_direction===4?[[13,16,0,16,0,16],[0,13,6,10,6,10]]:[[0,3,0,16,0,16],[3,16,6,10,6,10]];
 if(n.includes('repeater'))return[[0,16,0,2,0,16]];
 if(n.includes('comparator'))return[[0,16,0,2,0,16]];
 if(n.endsWith('_button')){const t=s.button_pressed_bit?1:2;return [{0:[5,11,14,16,6,10],1:[5,11,0,t,6,10],2:[5,11,6,10,16-t,16],3:[5,11,6,10,0,t],4:[16-t,16,6,10,5,11],5:[0,t,6,10,5,11]}[s.facing_direction]];}
 if(n.includes('redstone_torch'))return[[7,9,0,10,7,9]];
 if(n==='minecraft:redstone_wire')return[[0,16,0,1,0,16]];
 if(n==='minecraft:lever')return[[5,11,0,3,4,12]];
 return[[0,16,0,16,0,16]];
}
const matCache={};
function mats(b){
 const spec=model.catalog[b.name],door=b.name.endsWith('_door'),f=door?{side:b.states.upper_block_bit?spec.faces.side:spec.faces.lower}:spec.faces;
 const key=b.name+(b.states.pillar_axis||'')+(b.states.upper_block_bit?'upper':'')+(b.name.includes('piston')?b.states.facing_direction:'')+(b.previewExtended?'extended':'')+(b.name==='minecraft:redstone_wire'?b.states.redstone_signal:'');if(matCache[key])return matCache[key];
 const faceMaterials=new Map();
 const material=(face)=>{
  const file=(b.name==='minecraft:lever'?f.base:(f[face]||f.side||f.up)).split('/').pop();
  if(faceMaterials.has(file))return faceMaterials.get(file);
  const cut=b.name.includes('grate')||b.name.includes('trapdoor')||door||b.name==='minecraft:redstone_wire';
  const lamp=b.name.endsWith(':lantern'),glow=b.name.endsWith(':shroomlight');
  const result=new T.MeshStandardMaterial({map:lamp?null:textures[file],color:b.name==='minecraft:redstone_wire'?(b.states.redstone_signal?'#eb3535':'#5e0808'):lamp?'#efb152':'white',roughness:.91,metalness:0,
   alphaTest:cut?.45:0,side:cut?T.DoubleSide:T.FrontSide,emissive:lamp||glow?'#f0a138':'#000',emissiveIntensity:lamp?.65:glow?.22:0});
  faceMaterials.set(file,result);return result;
 };
 let result=['east','west','up','down','south','north'].map(material);
 if(b.name.includes('piston')){
  const side=material('side'),front=material(b.previewExtended?'inner':'up'),back=material('down');
  result=Array(6).fill(side);const d=b.states.facing_direction===4?0:1;result[d]=front;result[d^1]=back;
 }
 // Horizontal beams keep their end-grain on their X ends.
 if(b.states.pillar_axis==='x'&&f.up){const temp=result[0];result[0]=material('up');result[1]=material('up');result[2]=temp;result[3]=temp;}
 // Store axes separately for log materials.
 matCache[key]=result;return result;
}

// Atlas UVs are local to each native model part, not projected from world XYZ.
function atlasBox(bounds,faces){
 const [x0,x1,y0,y1,z0,z1]=bounds;
 const g=new T.BoxGeometry((x1-x0)/16,(y1-y0)/16,(z1-z0)/16);
 const uv=g.getAttribute('uv');
 for(let face=0;face<6;face++){
  const [u0,v0,u1,v1]=faces[face];
  for(let i=face*4;i<face*4+4;i++)uv.setXY(i,(u0+uv.getX(i)*(u1-u0))/16,1-(v0+(1-uv.getY(i))*(v1-v0))/16);
 }
 g.translate((x0+x1)/32,(y0+y1)/32,(z0+z1)/32);return g;
}
function atlasPlane(width,height,rect,rotation,center){
 const g=new T.PlaneGeometry(width/16,height/16),uv=g.getAttribute('uv');
 const [u0,v0,u1,v1]=rect;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(u0+uv.getX(i)*(u1-u0))/16,1-(v0+(1-uv.getY(i))*(v1-v0))/16);
 g.rotateY(rotation);g.translate(...center);return g;
}
// The metal casing remains dark; only the warm pixels of the native tile glow.
const lanternMaskCanvas=document.createElement('canvas');lanternMaskCanvas.width=lanternMaskCanvas.height=16;
const lanternCtx=lanternMaskCanvas.getContext('2d');lanternCtx.drawImage(textures.lantern.image,0,0);
const lanternPixels=lanternCtx.getImageData(0,0,16,16);
for(let i=0;i<lanternPixels.data.length;i+=4){
 const p=lanternPixels.data,lit=p[i]>170&&p[i+1]>90&&p[i]>p[i+2]*1.4;
 if(!lit)p[i]=p[i+1]=p[i+2]=0;
}
lanternCtx.putImageData(lanternPixels,0,0);
const lanternEmission=new T.CanvasTexture(lanternMaskCanvas);lanternEmission.colorSpace=T.SRGBColorSpace;
lanternEmission.magFilter=lanternEmission.minFilter=T.NearestFilter;lanternEmission.generateMipmaps=false;
const lanternBodyMaterial=new T.MeshStandardMaterial({map:textures.lantern,emissiveMap:lanternEmission,emissive:'#ffd69a',emissiveIntensity:.45,roughness:.85});
const lanternMetalMaterial=new T.MeshStandardMaterial({map:textures.lantern,alphaTest:.4,side:T.DoubleSide,roughness:.85});
const groups=new Map();
const mechanismCells=new Map((model.mechanisms||[]).flatMap(g=>g.circuit.map(p=>[p.join(','),g.id])));
for(const b of model.blocks){b.mechanismId=mechanismCells.get([b.x,b.y,b.z].join(','));const key=JSON.stringify([b.name,b.states,b.mechanismId,b.circuitRole]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);}
const meshes=[];const m=new T.Matrix4();
// Merge draw ranges that use the same material. Original vertices, UVs and
// triangle winding remain intact, including per-face textures and transparency.
function consolidateFaces(g,materials){
 const ranges=new Map(),source=g.index?.array;
 for(const group of g.groups){const material=materials[group.materialIndex];if(!ranges.has(material))ranges.set(material,{materialIndex:group.materialIndex,indices:[]});const range=ranges.get(material);for(let i=group.start;i<group.start+group.count;i++)range.indices.push(source?source[i]:i);}
 if(ranges.size===g.groups.length)return;
 const indices=[];g.clearGroups();for(const range of ranges.values()){g.addGroup(indices.length,range.indices.length,range.materialIndex);indices.push(...range.indices);}g.setIndex(indices);
}
function ornamentMesh(g,material,bs,kind){
 const mesh=new T.InstancedMesh(g,material,bs.length);mesh.castShadow=true;mesh.receiveShadow=true;
 mesh.userData.blocks=bs;mesh.userData.ornamentPart=kind;scene.add(mesh);meshes.push(mesh);return mesh;
}
// Repeater geometry follows both block states: direction and the movable delay pin.
function repeaterOutput(b){return {north:'south',south:'north',east:'west',west:'east'}[b.states['minecraft:cardinal_direction']];}
function repeaterGeometry(g,b){
 const direction=repeaterOutput(b);
 const angle={north:0,south:Math.PI,east:-Math.PI/2,west:Math.PI/2}[direction];
 g.translate(-.5,0,-.5);g.rotateY(angle);g.translate(.5,0,.5);return g;
}
for(const bs of groups.values()){
 const b=bs[0];let mesh;
 if(b.name==='minecraft:lever'){
  ornamentMesh(geometry(boxes(b)),mats(b),bs,'lever-base');
  const sides=Array(6).fill([7,6,9,16]),g=atlasBox([7,9,2,12,7,9],sides);
  g.translate(-.5,-3/16,-.5);g.rotateX(b.states.open_bit?-.65:.65);g.translate(.5,3/16,.5);
  ornamentMesh(g,new T.MeshStandardMaterial({map:textures.lever,roughness:1}),bs,'lever-handle');continue;
 }
 if(b.name.includes('redstone_torch')){
  const tile=b.name.includes('unlit')?'redstone_torch_off':'redstone_torch_on';
  const g=atlasBox([7,9,0,10,7,9],Array(6).fill([7,6,9,16])),d=b.states.torch_facing_direction;
  if(d&&d!=='top'){g.translate(-.5,0,-.5);if(d==='west'||d==='east'){g.rotateZ(d==='west'?-Math.PI/6:Math.PI/6);g.translate(d==='west'?.125:.875,.2,.5);}else{g.rotateX(d==='north'?Math.PI/6:-Math.PI/6);g.translate(.5,.2,d==='north'?.125:.875);}}
  ornamentMesh(g,new T.MeshStandardMaterial({map:textures[tile],alphaTest:.4,roughness:1}),bs,'redstone-torch');continue;
 }
 if(b.name.includes('comparator')){
  ornamentMesh(repeaterGeometry(geometry(boxes(b)),b),mats(b),bs,'comparator-base');
  const material=new T.MeshStandardMaterial({map:textures.redstone_torch_off,roughness:1});
  for(const [x,z] of [[4,11],[10,11],[7,2]])ornamentMesh(repeaterGeometry(atlasBox([x,x+2,2,8,z,z+2],Array(6).fill([7,10,9,16])),b),material,bs,'comparator-torch');continue;
 }
 if(b.name.includes('repeater')){
  ornamentMesh(repeaterGeometry(geometry(boxes(b)),b),mats(b),bs,'repeater-base');
  const material=new T.MeshStandardMaterial({map:textures[b.name==='minecraft:powered_repeater'?'redstone_torch_on':'redstone_torch_off'],roughness:1});
  for(const z of [2,6+2*b.states.repeater_delay])ornamentMesh(repeaterGeometry(atlasBox([7,9,2,8,z,z+2],Array(6).fill([7,10,9,16])),b),material,bs,'repeater-torch');continue;
 }
 if(b.name.includes('_chain')){
  // Each official tile occupies only its first 3 pixel columns. Crop that strip
  // onto a 3/16-wide centered plane and alternate the two perpendicular faces.
  for(const [face,angle] of [['side',Math.PI/4],['cross',-Math.PI/4]]){
   const file=model.catalog[b.name].faces[face].split('/').pop();
   const g=atlasPlane(3,16,[0,0,3,16],angle,[.5,.5,.5]);
   const material=new T.MeshStandardMaterial({map:textures[file],alphaTest:.4,side:T.DoubleSide,roughness:1});
   ornamentMesh(g,material,bs,'chain-'+face);
  }
  continue;
 }
 if(b.name==='minecraft:lantern'){
  const y=b.states.hanging?1:0,side=[0,2,6,9],cap=[0,9,6,15],neck=[1,0,5,2],top=[1,10,5,14];
  ornamentMesh(atlasBox([5,11,y,y+7,5,11],[side,side,cap,cap,side,side]),lanternBodyMaterial,bs,'lantern-body');
  ornamentMesh(atlasBox([6,10,y+7,y+9,6,10],[neck,neck,top,top,neck,neck]),lanternMetalMaterial,bs,'lantern-cap');
  for(const [rect,angle] of [[[11,6,14,12],Math.PI/4],[[11,0,14,6],-Math.PI/4]])
   ornamentMesh(atlasPlane(3,6,rect,angle,[.5,(y+12)/16,.5]),lanternMetalMaterial,bs,'lantern-hanger');
  continue;
 }
 const shape=geometry(boxes(b));
 if(b.name.endsWith('_door')&&b.states.door_hinge_bit){const uv=shape.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}
 const materials=mats(b);consolidateFaces(shape,materials);
 mesh=new T.InstancedMesh(shape,materials,bs.length);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.blocks=bs;scene.add(mesh);meshes.push(mesh);
}
// Emissive faces alone do not light nearby geometry in WebGL. Local lights
// approximate block-light spread; this is not the Bedrock lighting engine.
const localLights=new T.Group();scene.add(localLights);localLights.visible=false;
const lightBindings=[];
// A bounded, spatially distributed light set avoids compiling a shader with a
// light for every lamp. All original emissive faces remain visible.
const lightCandidates=model.blocks.filter(b=>b.name==='minecraft:lantern'||b.name==='minecraft:shroomlight'),chosenLights=[];
while(lightCandidates.length&&chosenLights.length<12){let index=0,furthest=-1;for(let i=0;i<lightCandidates.length;i++){const b=lightCandidates[i],distance=chosenLights.length?Math.min(...chosenLights.map(a=>(a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2)):0;if(distance>furthest){furthest=distance;index=i;}}chosenLights.push(lightCandidates.splice(index,1)[0]);}
for(const b of chosenLights){
 const lantern=b.name==='minecraft:lantern',glow=b.name==='minecraft:shroomlight';
 if(!lantern&&!glow)continue;
 const light=new T.PointLight('#ffc078',glow?22:15,14,1.8);
 light.position.set(b.x+.5,b.y+(lantern?.28:.5),b.z+.5);
 localLights.add(light);lightBindings.push({light,block:b});
}
let lighting='day';
function setLighting(mode){
 lighting=mode;const night=mode==='night';
 document.body.classList.toggle('night',night);updateBackdrop(night);
 ambient.color.set(night?'#8eafd2':'#fff6dd');ambient.groundColor.set(night?'#394b5f':'#8b8f92');ambient.intensity=night?.85:2;
 sun.color.set(night?'#a5c3eb':'#fff5de');sun.intensity=night?.8:3.1;
 localLights.visible=night;
 renderer.toneMappingExposure=night?1.12:1.22;
 document.querySelector('#day-mode').setAttribute('aria-pressed',String(!night));
 document.querySelector('#night-mode').setAttribute('aria-pressed',String(night));
 document.querySelector('#info').innerHTML=night?`Revisão ${model.revision} · modo noturno<br>Luz aproximada · confira no Minecraft`:`${model.size.join(' × ')} blocos · revisão ${model.revision}<br>Prévia 3D da construção`;
 if(window.portal)window.portal.lighting=mode;
 render();
}
function setEconomy(value){economy=value;renderer.setPixelRatio(Math.min(devicePixelRatio,economy?1:1.5));renderer.shadowMap.enabled=!economy;renderer.shadowMap.needsUpdate=true;document.querySelector('#economy-mode')?.setAttribute('aria-pressed',String(economy));render();}
const economyButton=document.createElement('button');economyButton.id='economy-mode';economyButton.textContent='Modo econômico';economyButton.setAttribute('aria-pressed',String(economy));economyButton.title='Reduz a resolução e desativa sombras';economyButton.onclick=()=>setEconomy(!economy);lightingControls.after(economyButton);
// A single thumbnail renderer is reused for all block shapes, then released.
const thumbRenderer=new T.WebGLRenderer({antialias:true,alpha:true});thumbRenderer.setSize(96,96);thumbRenderer.setPixelRatio(1);
thumbRenderer.outputColorSpace=T.SRGBColorSpace;thumbRenderer.toneMapping=T.ACESFilmicToneMapping;thumbRenderer.toneMappingExposure=1.3;
const thumbScene=new T.Scene();thumbScene.add(new T.HemisphereLight('#fff9e8','#7c8490',2.6));
const thumbSun=new T.DirectionalLight('#fff6e3',3);thumbSun.position.set(2,4,3);thumbScene.add(thumbSun);
const thumbCamera=new T.OrthographicCamera(-.9,.9,.9,-.9,.1,10);thumbCamera.position.set(2,1.8,2.6);thumbCamera.lookAt(.5,.5,.5);
const counts=new Map(),representatives=new Map();
for(const b of model.blocks){counts.set(b.name,(counts.get(b.name)||0)+1);if(!representatives.has(b.name))representatives.set(b.name,b);}
const materialList=document.querySelector('#material-list');
for(const [name,amount] of counts){
 const representative=representatives.get(name),group=new T.Group(),fingerprint=JSON.stringify(representative.states);
 for(const mesh of meshes){const b=mesh.userData.blocks[0];if(b.name===name&&JSON.stringify(b.states)===fingerprint)group.add(new T.Mesh(mesh.geometry,mesh.material));}
 thumbScene.add(group);thumbRenderer.render(thumbScene,thumbCamera);
 const item=document.createElement('li');item.className='material-item';item.title=name;item.dataset.block=name;item.dataset.quantity=String(amount);
 const img=document.createElement('img');img.src=thumbRenderer.domElement.toDataURL('image/png');img.alt='';img.width=42;img.height=42;
 const text=document.createElement('div'),label=document.createElement('div'),quantity=document.createElement('div');
 label.className='material-name';label.textContent=model.catalog[name].label;quantity.className='material-quantity';quantity.textContent=name.endsWith('_door')?`${amount/2} portas (${amount} metades)`:amount.toLocaleString('pt-BR')+(amount===1?' bloco':' blocos');
 text.append(label,quantity);item.append(img,text);materialList.append(item);thumbScene.remove(group);
}
thumbRenderer.dispose();thumbRenderer.forceContextLoss();
document.querySelector('#material-count').textContent=String(counts.size);
function showMaterials(show){document.querySelector('#materials-panel').hidden=!show;document.querySelector('#materials-toggle').setAttribute('aria-expanded',String(show));if(innerWidth<=600&&window.portal?.inspection?.enabled)document.querySelector('#block-inspector').hidden=show;positionMaterials();}
document.querySelector('#materials-toggle').onclick=()=>showMaterials(document.querySelector('#materials-panel').hidden);
document.querySelector('#close-materials').onclick=()=>showMaterials(false);
document.querySelector('#day-mode').onclick=()=>setLighting('day');document.querySelector('#night-mode').onclick=()=>setLighting('night');
let stage=model.stages.length-1,layer=model.size[1]-1,stageOnly=false,blockLimit=model.blocks.length;const ordered=[...model.blocks].sort((a,b)=>a.stage-b.stage||a.y-b.y||a.z-b.z||a.x-b.x),blockOrder=new Map(ordered.map((b,i)=>[b,i])),stageOrder=new Map(),stageSizes=new Map();for(const b of ordered){const n=stageSizes.get(b.stage)||0;stageOrder.set(b,n);stageSizes.set(b.stage,n+1);}
document.querySelector('#layer').max=String(layer);document.querySelector('#layer').value=String(layer);document.querySelector('#yvalue').textContent=String(layer);
const runtimeBlocks=[],studyHidden=new Set();let circuitStudy=false,serviceMode=model.service?.initialCoverVisible?'covered':'exposed';
function isVisible(b){
 if(model.service){
  if(b.serviceCover&&serviceMode!=='covered'&&serviceMode!=='section')return false;
  if(serviceMode.startsWith('level')&&b.y!==model.service.coverY-Number(serviceMode.slice(5)))return false;
  if(serviceMode==='section'&&(b.x<model.center[0]+26||b.x>model.center[0]+32||b.y>8))return false;
 }
 return (stageOnly?b.stage===stage:b.stage<=stage)&&(blockLimit>=(stageOnly?(stageSizes.get(stage)||0):model.blocks.length)||((stageOnly?stageOrder:blockOrder).get(b)??Infinity)<blockLimit)&&b.y<=layer&&(!b.generatedPart||b.partVisible)&&(!circuitStudy||!studyHidden.has([b.x,b.y,b.z].join(',')));
}
function update(){for(const mesh of meshes){mesh.userData.blocks.forEach((b,i)=>{const visible=isVisible(b);m.makeScale(visible?1:0,visible?1:0,visible?1:0);m.setPosition(b.x,b.y,b.z);mesh.setMatrixAt(i,m);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}for(const {light,block:b}of lightBindings)light.visible=isVisible(b);const visible=model.blocks.filter(isVisible);window.portal.visibleBlocks=visible.length;const activeCounts=new Map();for(const b of visible)activeCounts.set(b.name,(activeCounts.get(b.name)||0)+1);for(const item of materialList.children){const n=activeCounts.get(item.dataset.block)||0;item.hidden=!n;const label=item.querySelector('.material-quantity');label.textContent=item.dataset.block.endsWith('_door')?`${n/2} portas (${n} metades)`:`${n.toLocaleString('pt-BR')} ${n===1?'bloco':'blocos'}`;}document.querySelector('#material-count').textContent=String(activeCounts.size);document.querySelector('.material-heading strong').textContent=visible.length===model.blocks.length?'Materiais do projeto completo':'Materiais visíveis';renderer.shadowMap.needsUpdate=true;render();}
function render(){if(renderFrame||document.hidden)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;if(!document.hidden)renderer.render(scene,camera);});}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(renderFrame);renderFrame=0;}else render();});
function frameMobileScene(){render();}
const center=new T.Vector3(model.center[0]+.5,model.center[1],model.center[2]+.5),vectors={iso:[61,34,-65],front:[0,7,-90],back:[0,7,90],left:[-90,7,0],right:[90,7,0],top:[0,95,.001],bottom:[0,-95,.001]};
function view(name='iso'){
 const vector=vectors[name];camera.position.copy(center).add(new T.Vector3(...vector));camera.up.set(0,1,0);if(name==='top')camera.up.set(0,0,1);controls.target.copy(center);camera.lookAt(center);controls.update();camera.updateMatrixWorld(true);
 const corners=[];for(const x of [0,model.size[0]])for(const y of [0,model.size[1]])for(const z of [0,model.size[2]])corners.push(new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 const halfW=Math.max(...corners.map(p=>Math.abs(p.x)))*(innerWidth<=600?1.07:1.16),halfH=Math.max(...corners.map(p=>Math.abs(p.y)))*1.24,aspect=innerWidth/innerHeight;
 const availableHeight=innerHeight;
 const h=Math.max(halfH*innerHeight/availableHeight,halfW/aspect);camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;camera.zoom=1;camera.updateProjectionMatrix();controls.update();window.portal.currentView=name;mobileView.value=name;frameMobileScene();
}
window.portal={model,versions,meshes,renderer,scene,camera,controls,view,update,render,lighting,setLighting,setEconomy,setStageOnly(value){stageOnly=!!value;update();updateInspectionVisibility();},setBlockLimit(value){blockLimit=Math.max(0,Math.min(model.blocks.length,Number(value)));update();updateInspectionVisibility();},localLights,lightBindings,visibleBlocks:0};
// Raycast the rendered partial shapes and instances, restricted to visible cells.
const inspection={enabled:false,pinned:false,block:null};
const outline=new T.Group();outline.visible=false;scene.add(outline);
const outlineMaterial=new T.LineBasicMaterial({color:'#6fe0a6',transparent:true,opacity:.95,depthTest:true,depthWrite:false,toneMapped:false});
const edgeCache=new Map(),raycaster=new T.Raycaster(),pointer=new T.Vector2();
let pointerInside=false,pointerX=0,pointerY=0,down=null,dragging=false,pickFrame=0;
const inspectionPanel=document.querySelector('#block-inspector');
function selectBlock(block,pinned=false,force=false){
 const previous=inspection.block,wasPinned=inspection.pinned;
 inspection.block=block;inspection.pinned=pinned;
 if(previous===block&&wasPinned===pinned&&!force)return;
 outline.clear();outline.visible=!!block;document.querySelector('#inspected-block').hidden=!block;
 document.querySelector('#inspection-state').textContent=pinned?'Bloco fixado':'Inspeção ativa';
 document.querySelector('#inspection-hint').textContent=block?(pinned?'Clique em outro bloco ou use Limpar / Esc.':'Clique para fixar. Arraste para girar.'):'Passe o mouse sobre a construção. Clique para fixar.';
 if(block){
  const fingerprint=JSON.stringify(block.states);
  for(const mesh of meshes){const b=mesh.userData.blocks[0];if(b.name!==block.name||JSON.stringify(b.states)!==fingerprint)continue;
   if(!edgeCache.has(mesh.geometry.uuid))edgeCache.set(mesh.geometry.uuid,new T.EdgesGeometry(mesh.geometry,20));
   const line=new T.LineSegments(edgeCache.get(mesh.geometry.uuid),outlineMaterial);line.renderOrder=5;outline.add(line);
  }
  outline.position.set(block.x-.001,block.y-.001,block.z-.001);outline.scale.setScalar(1.002);
  document.querySelector('#inspected-name').textContent=model.catalog[block.name].label;
  document.querySelector('#inspected-name').title=block.name;
  document.querySelector('#inspected-position').textContent=`X ${block.x} · Y ${block.y} · Z ${block.z}`;
  if(model.service)document.querySelector('#inspected-position').textContent+=` · origem: ΔX ${block.x-model.center[0]}, ΔY ${block.y-3}, ΔZ ${block.z+6}`;
  if(block.name.includes('repeater')||block.name.includes('comparator')){
   const direction=repeaterOutput(block);
   const labels={north:'norte (−Z)',south:'sul (+Z)',east:'leste (+X)',west:'oeste (−X)'};
   document.querySelector('#inspected-position').textContent+=` · saída: ${labels[direction]} · estado Bedrock: ${block.states['minecraft:cardinal_direction']}`+(block.name.includes('repeater')?` · atraso: ${block.states.repeater_delay+1} ticks de redstone`:' · modo comparação');
  }
  const aliases={'minecraft:sticky_piston_arm_collision':'minecraft:sticky_piston','minecraft:redstone_torch':'minecraft:unlit_redstone_torch','minecraft:unlit_redstone_torch':'minecraft:redstone_torch','minecraft:unpowered_repeater':'minecraft:powered_repeater','minecraft:powered_repeater':'minecraft:unpowered_repeater','minecraft:powered_comparator':'minecraft:unpowered_comparator'};
  const items=[...document.querySelectorAll('.material-item')],iconItem=items.find(el=>el.dataset.block===block.name)||items.find(el=>el.dataset.block===aliases[block.name]);
  if(iconItem)document.querySelector('#inspected-icon').src=iconItem.querySelector('img').src;
  const amount=[...model.blocks,...runtimeBlocks].filter(b=>b.name===block.name&&b.y===block.y&&isVisible(b)).length;
  document.querySelector('#inspected-count').textContent=`Nesta camada: ${amount} ${amount===1?'bloco desse tipo':'blocos desse tipo'}.`;
 }else document.querySelector('#inspected-count').textContent='';
 render();
}
function pickBlock(clientX,clientY){
 const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 for(const hit of raycaster.intersectObjects(meshes,false)){
  const b=hit.object.userData.blocks[hit.instanceId];
  if(b&&isVisible(b))return b;
 }
 return null;
}
function schedulePick(){
 if(pickFrame||!inspection.enabled||inspection.pinned||!pointerInside||dragging)return;
 pickFrame=requestAnimationFrame(()=>{pickFrame=0;if(inspection.enabled&&!inspection.pinned&&pointerInside&&!dragging)selectBlock(pickBlock(pointerX,pointerY));});
}
inspectToggle.onclick=()=>{
 inspection.enabled=!inspection.enabled;inspectToggle.setAttribute('aria-pressed',String(inspection.enabled));inspectionPanel.hidden=!inspection.enabled;
 if(innerWidth<=600&&inspection.enabled){showMaterials(false);inspectionPanel.hidden=false;}
 renderer.domElement.style.cursor=inspection.enabled?'crosshair':'';selectBlock(null);schedulePick();
 positionMaterials();
};
function clearInspection(){selectBlock(null);}
document.querySelector('#clear-inspection').onclick=clearInspection;
window.addEventListener('keydown',e=>{if(e.key==='Escape')clearInspection();});
renderer.domElement.addEventListener('pointermove',e=>{
 pointerInside=true;pointerX=e.clientX;pointerY=e.clientY;
 if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)dragging=true;
 schedulePick();
});
renderer.domElement.addEventListener('pointerleave',()=>{pointerInside=false;if(!inspection.pinned)selectBlock(null);});
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};dragging=false;});
renderer.domElement.addEventListener('pointerup',e=>{
 if(inspection.enabled&&e.button===0&&down&&!dragging){const b=pickBlock(e.clientX,e.clientY);selectBlock(b,!!b);}
 down=null;dragging=false;schedulePick();
});
controls.addEventListener('change',schedulePick);
window.portal.inspection=inspection;window.portal.outline=outline;
// A pinned block must disappear when a cut or stage hides its cell.
function updateInspectionVisibility(){if(inspection.block){if(!isVisible(inspection.block))selectBlock(null);else selectBlock(inspection.block,inspection.pinned,true);}schedulePick();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
mobileView.onchange=()=>view(mobileView.value);
const stageSelect=document.querySelector('#stage');stageSelect.innerHTML=model.stages.map((s,i)=>`<option value="${i}" ${i===stage?'selected':''}>${i+1}. ${s}</option>`).join('');stageSelect.onchange=()=>{stage=Number(stageSelect.value);update();updateInspectionVisibility();};
document.querySelector('#layer').oninput=e=>{layer=+e.target.value;document.querySelector('#yvalue').textContent=layer;update();updateInspectionVisibility();};
document.querySelector('#ref').onclick=()=>{const r=document.querySelector('#references');r.style.display=r.style.display==='block'?'none':'block';};
// This is a kinematic demonstration of native parts, not a Bedrock tick engine.
const gateStates=new Map();
if(model.mechanisms?.length){
 const note=document.createElement('p');note.className='mechanism-note';note.textContent=model.service?'Botões nos dois lados · temporização ilustrativa':model.revision==='2.2.3'?'2 repetidores por travessia · atraso máximo · movimento simulado':'Protótipo de redstone · movimento simulado';document.querySelector('header').append(note);
 const group=document.createElement('div');group.id='mechanism-controls';document.querySelector('nav').append(group);
 const cells=new Map(model.blocks.map(b=>[[b.x,b.y,b.z].join(','),b]));
 for(const gate of model.mechanisms){
  for(const p of gate.hiddenForStudy)studyHidden.add(p.join(','));
  const state={closed:false,gate,leaves:gate.leaves.map(p=>({block:cells.get(p.from.join(',')),from:p.from,to:p.to})),parts:[]};gateStates.set(gate.id,state);
  for(const h of gate.heads){const b={x:h.position[0],y:h.position[1],z:h.position[2],name:'minecraft:sticky_piston_arm_collision',states:h.states,stage:8,mechanismId:gate.id,generatedPart:true,partVisible:false};runtimeBlocks.push(b);ornamentMesh(geometry(boxes(b)),mats(b),[b],'piston-head');state.parts.push(b);}
  const button=document.createElement('button');button.dataset.gate=gate.id;state.button=button;group.append(button);
  button.onclick=()=>model.service?pulseGate(gate.id,0):toggleGate(gate.id);
  if(model.service){const rear=document.createElement('button');rear.textContent=`${gate.id==='esquerda'?'Esq.':'Dir.'} · botão interno`;rear.onclick=()=>pulseGate(gate.id,1);group.append(rear);}
 }
 const study=document.createElement('button');study.id='circuit-toggle';study.textContent='Revelar circuito';group.after(study);if(model.service)study.hidden=true;
 study.onclick=()=>{circuitStudy=!circuitStudy;study.textContent=circuitStudy?'Mostrar revestimento':'Revelar circuito';study.setAttribute('aria-pressed',String(circuitStudy));update();updateInspectionVisibility();};
 renderer.domElement.addEventListener('pointerup',e=>{if(inspection.enabled||dragging)return;const b=pickBlock(e.clientX,e.clientY);if(b?.name.endsWith('_button')&&b.mechanismId){const gate=gateStates.get(b.mechanismId).gate;const side=gate.controls.findIndex(p=>p[0]===b.x&&p[1]===b.y&&p[2]===b.z);pulseGate(b.mechanismId,Math.max(0,side));}else if(b?.name==='minecraft:lever'&&b.mechanismId)toggleGate(b.mechanismId);});
}
function gateButton(state){state.button.textContent=`${state.gate.id==='esquerda'?'Esquerda':'Direita'} · ${model.service?'botão externo':state.closed?'abrir':'fechar'}`;state.button.setAttribute('aria-pressed',String(model.service?!state.closed:state.closed));}
function pulseGate(id,side=0){const state=gateStates.get(id);if(!state)return;clearTimeout(state.closeTimer);if(state.closed)toggleGate(id);state.lastControl=side;const p=state.gate.controls[side];for(const mesh of meshes){const b=mesh.userData.blocks[0];if(!b.name.endsWith('_button')||[b.x,b.y,b.z].some((v,i)=>v!==p[i]))continue;clearTimeout(mesh.userData.releaseTimer);b.states.button_pressed_bit=true;mesh.geometry.dispose();mesh.geometry=geometry(boxes(b));renderer.shadowMap.needsUpdate=true;mesh.userData.releaseTimer=setTimeout(()=>{b.states.button_pressed_bit=false;mesh.geometry.dispose();mesh.geometry=geometry(boxes(b));renderer.shadowMap.needsUpdate=true;render();},1500);}state.closeTimer=setTimeout(()=>{if(!state.closed)toggleGate(id);},4000);render();}
function toggleGate(id){
 const state=gateStates.get(id);if(!state)return;state.closed=!state.closed;
 for(const leaf of state.leaves){const p=state.closed?leaf.to:leaf.from;[leaf.block.x,leaf.block.y,leaf.block.z]=p;}
 for(const b of state.parts)b.partVisible=state.closed;
 for(const b of model.blocks.filter(b=>b.mechanismId===id)){
  if(b.name==='minecraft:sticky_piston')b.previewExtended=state.closed;
  const active=model.service?(b.circuitRole==='return'||b.circuitRole==='shared-inverter'||b.circuitRole==='upper-inverter'?state.closed:!state.closed):!state.closed;
  if(b.name==='minecraft:redstone_wire'){b.originalSignal??=b.states.redstone_signal;b.states.redstone_signal=active?(model.service?15:b.originalSignal):0;}
  if(b.name.includes('redstone_torch'))b.name=(model.service?active:state.closed)?'minecraft:redstone_torch':'minecraft:unlit_redstone_torch';
  if(b.name.includes('repeater'))b.name=active?'minecraft:powered_repeater':'minecraft:unpowered_repeater';
  if(b.name.includes('comparator'))b.name=active?'minecraft:powered_comparator':'minecraft:unpowered_comparator';
  if(b.name==='minecraft:lever')b.states.open_bit=!state.closed;
 }
 for(const mesh of meshes){const b=mesh.userData.blocks[0];if(b.mechanismId!==id||b.generatedPart)continue;
  if(b.name==='minecraft:sticky_piston'){
   mesh.userData.openGeometry??=mesh.geometry;mesh.userData.closedGeometry??=geometry(boxes({...b,previewExtended:true}));
   mesh.geometry=state.closed?mesh.userData.closedGeometry:mesh.userData.openGeometry;mesh.material=mats(b);
  }else if(b.name==='minecraft:redstone_wire')mesh.material=mats(b);
  else if(mesh.userData.ornamentPart==='redstone-torch')mesh.material.map=textures[b.name==='minecraft:redstone_torch'?'redstone_torch_on':'redstone_torch_off'];
  else if(mesh.userData.ornamentPart==='repeater-base')mesh.material=mats(b);
  else if(mesh.userData.ornamentPart==='repeater-torch')mesh.material.map=textures[b.name==='minecraft:powered_repeater'?'redstone_torch_on':'redstone_torch_off'];
  else if(mesh.userData.ornamentPart==='comparator-base')mesh.material=mats(b);
  else if(mesh.userData.ornamentPart==='comparator-torch')mesh.material.map=textures[b.name==='minecraft:powered_comparator'?'redstone_torch_on':'redstone_torch_off'];
  else if(mesh.userData.ornamentPart==='lever-handle'){
   mesh.userData.openGeometry??=mesh.geometry;
   if(!mesh.userData.closedGeometry){const g=atlasBox([7,9,2,12,7,9],Array(6).fill([7,6,9,16]));g.translate(-.5,-3/16,-.5);g.rotateX(.65);g.translate(.5,3/16,.5);mesh.userData.closedGeometry=g;}
   mesh.geometry=state.closed?mesh.userData.closedGeometry:mesh.userData.openGeometry;
  }
 }
 gateButton(state);selectBlock(null);update();
}
for(const state of gateStates.values())gateButton(state);
if(model.service){
 const select=document.createElement('select');select.id='service-mode';select.setAttribute('aria-label','Camadas do circuito');select.innerHTML='<option value="exposed">Circuito exposto</option><option value="covered">Piso instalado</option><option value="level1">−1 · Circuito · Y −62</option><option value="level2">−2 · Apoios · Y −63</option><option value="section">Corte lateral</option>';document.querySelector('nav').append(select);
 const legend=document.createElement('div');legend.id='service-legend';legend.textContent='Piso Y −61 · circuito −62 · apoios −63 · bedrock −64 preservada';document.querySelector('header').append(legend);
 function serviceView(mode){serviceMode=mode;select.value=mode;selectBlock(null);update();updateInspectionVisibility();if(mode==='covered'||mode==='exposed'){view('iso');return;}const target=new T.Vector3(model.center[0]+31.5,2,15);controls.target.copy(target);camera.position.copy(target).add(new T.Vector3(...(mode==='section'?[48,4,0]:[0,45,.001])));camera.up.set(0,mode==='section'?1:0,mode==='section'?0:1);camera.lookAt(target);const aspect=innerWidth/innerHeight,h=Math.max(mode==='section'?7:14,14/aspect);camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;camera.zoom=1;camera.updateProjectionMatrix();controls.update();frameMobileScene();}
 select.value=serviceMode;select.onchange=()=>serviceView(select.value);window.portal.serviceView=serviceView;window.portal.pulseGate=pulseGate;window.portal.serviceMode=()=>serviceMode;
 for(const s of gateStates.values())toggleGate(s.gate.id);
}
window.portal.repeaterOutput=repeaterOutput;window.portal.gateStates=gateStates;window.portal.toggleGate=toggleGate;window.portal.runtimeBlocks=runtimeBlocks;
controls.addEventListener('change',render);window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);view(window.portal.currentView);});
update();view();window.portal.ready=true;
document.querySelector('#viewer-status')?.remove();
document.title=`Portal Escarlate · revisão ${model.revision}`;
document.querySelector('#info').innerHTML=`${model.size.join(' × ')} blocos · revisão ${model.revision}<br>Prévia 3D da construção`;

// BuildsMine adapter: existing circuit handlers remain unchanged above.
window.portal.pickBlock=pickBlock;window.portal.isVisible=isVisible;window.portal.selectBlock=selectBlock;
window.portal.applyBuildFilters=({mode,step,part})=>{
 stageOnly=part!=='all';stage=stageOnly?Number(part):mode==='stage'?step:model.stages.length-1;
 layer=mode==='layer'?step:model.size[1]-1;blockLimit=mode==='block'?step:model.blocks.length;
 document.querySelector('#stage').value=String(stage);document.querySelector('#layer').value=String(layer);
 update();updateInspectionVisibility();
};
const gridSize=Math.ceil(Math.max(...model.size)/10)*10+20;
const buildGrid=new T.GridHelper(gridSize,gridSize,0x78888b,0x78888b);buildGrid.position.set(Math.floor(model.size[0]/2),.005,Math.floor(model.size[2]/2));buildGrid.material.transparent=true;buildGrid.material.opacity=.25;buildGrid.visible=false;scene.add(buildGrid);window.portal.buildGrid=buildGrid;
window.portal.setGrid=value=>{buildGrid.visible=value;render();};
window.portal.setBackdrop=value=>{backdropMode=['editor','studio','classic'].includes(value)?value:'editor';updateBackdrop(lighting==='night');render();};
window.portal.embeddedReady=true;
