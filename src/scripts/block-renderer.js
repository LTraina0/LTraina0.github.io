import * as T from 'three';
import {TGALoader} from 'three/examples/jsm/loaders/TGALoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {canonicalStairParts,stairFacing} from './geometry.js';
import {createBlockLight} from './block-light.js';
const ROOT='https://raw.githubusercontent.com/Mojang/bedrock-samples/v1.26.60.5/resource_pack/textures/';
const files={mud:'blocks/mud_bricks.png',birch:'blocks/planks_birch.png',bamboo:'blocks/bamboo_planks.png',mosaic:'blocks/bamboo_mosaic.png',log:'blocks/bamboo_block.png',logTop:'blocks/bamboo_block_top.png',stripped:'blocks/stripped_bamboo_block.png',strippedTop:'blocks/stripped_bamboo_block_top.png',trapdoor:'blocks/bamboo_trapdoor.png',lantern:'blocks/lantern.png',chain1:'blocks/chain1.png',chain2:'blocks/chain2.png',torch:'blocks/torch_on.png',shroom:'blocks/shroomlight.png',bell:'blocks/bell_side.png',bellTop:'blocks/bell_top.png',bellBottom:'blocks/bell_bottom.png',scaffold:'blocks/scaffolding_side.tga',scaffoldTop:'blocks/scaffolding_top.tga',scaffoldBottom:'blocks/scaffolding_bottom.tga',wood:'blocks/planks_oak.png',fence:'blocks/bamboo_fence.png',gate:'blocks/bamboo_fence_gate.png',birchLog:'blocks/stripped_birch_log.png',birchLogTop:'blocks/stripped_birch_log_top.png',froglight:'blocks/ochre_froglight_side.png',froglightTop:'blocks/ochre_froglight_top.png',stem:'blocks/bamboo_stem.png',leaf:'blocks/bamboo_leaf.png',smallLeaf:'blocks/bamboo_small_leaf.png'};
const V={north:new T.Vector3(0,0,-1),south:new T.Vector3(0,0,1),east:new T.Vector3(1,0,0),west:new T.Vector3(-1,0,0),up:new T.Vector3(0,1,0)};
export async function createBlockRenderer(blocks,scene){
 const textures={},materials={},failures=[],alphas=new Map(),images={},nightAdaptation={value:0};
 await Promise.all(Object.entries(files).map(async([key,file])=>{
  try{
   const raw=file.endsWith('.tga')?await new TGALoader().loadAsync(ROOT+file):await new T.TextureLoader().loadAsync(ROOT+file);
   const im=raw.image,canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=Math.min(im.width,im.height);const ctx=canvas.getContext('2d');
   if(im.data){const full=document.createElement('canvas');full.width=im.width;full.height=im.height;full.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(im.data),im.width,im.height),0,0);ctx.drawImage(full,0,0);}else ctx.drawImage(im,0,0);
   const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;tx.magFilter=T.NearestFilter;tx.minFilter=T.NearestMipmapLinearFilter;tx.anisotropy=4;textures[key]=tx;images[key]=canvas;alphas.set(tx,ctx.getImageData(0,0,canvas.width,canvas.height));raw.dispose();
  }catch(error){failures.push(file);const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.fillStyle='#bd9270';x.fillRect(0,0,16,16);textures[key]=new T.CanvasTexture(c);images[key]=c;}
 }));
 for(const key of Object.keys(files)){const cut=['stem','leaf','smallLeaf','fence','gate','trapdoor','chain1','chain2','scaffold','scaffoldTop','scaffoldBottom','torch','bell','bellTop','bellBottom','lantern'].includes(key);materials[key]=new T.MeshLambertMaterial({map:textures[key],vertexColors:true,alphaTest:cut?.5:0,side:cut?T.DoubleSide:T.FrontSide});}
 // Mild night adaptation reduces the daylight saturation before applying cold/warm light.
 for(const m of Object.values(materials)){m.onBeforeCompile=shader=>{shader.uniforms.nightAdaptation=nightAdaptation;shader.fragmentShader='uniform float nightAdaptation;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`float nightLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(nightLuma),nightAdaptation);
 #include <color_fragment>`);};m.customProgramCacheKey=()=>'night-adaptation-v1';}
 const emission=document.createElement('canvas');emission.width=emission.height=16;const ec=emission.getContext('2d');ec.drawImage(images.lantern,0,0);const pixels=ec.getImageData(0,0,16,16);for(let i=0;i<pixels.data.length;i+=4){const p=pixels.data,lit=p[i]>150&&p[i+1]>65&&p[i]>p[i+2]*1.25;if(!lit)p[i]=p[i+1]=p[i+2]=0;}ec.putImageData(pixels,0,0);const mask=new T.CanvasTexture(emission);mask.colorSpace=T.SRGBColorSpace;mask.magFilter=T.NearestFilter;materials.lantern.emissiveMap=mask;materials.lantern.emissive.set('#ffd29a');materials.lantern.emissiveIntensity=.5;const torchMask=document.createElement('canvas');torchMask.width=torchMask.height=16;const tc=torchMask.getContext('2d');tc.drawImage(images.torch,0,0);tc.clearRect(0,9,16,7);const torchEmission=new T.CanvasTexture(torchMask);torchEmission.colorSpace=T.SRGBColorSpace;torchEmission.magFilter=T.NearestFilter;materials.torch.emissiveMap=torchEmission;materials.torch.emissive.set('#ffad45');materials.torch.emissiveIntensity=.15;materials.shroom.emissiveMap=textures.shroom;materials.shroom.emissive.set('#ffd29a');materials.shroom.emissiveIntensity=.2;
 for(const key of ['froglight','froglightTop']){materials[key].emissiveMap=textures[key];materials[key].emissive.set('#ffe4a6');materials[key].emissiveIntensity=.3;}
 function box(bounds,keys,rects){
  const [x0,y0,z0,x1,y1,z1]=bounds,g=new T.BoxGeometry((x1-x0)/16,(y1-y0)/16,(z1-z0)/16);g.translate((x0+x1)/32,(y0+y1)/32,(z0+z1)/32);
  const uv=g.attributes.uv,defaults=[[16-z1,16-y1,16-z0,16-y0],[z0,16-y1,z1,16-y0],[x0,z0,x1,z1],[x0,16-z1,x1,16-z0],[x0,16-y1,x1,16-y0],[16-x1,16-y1,16-x0,16-y0]];
  for(let f=0;f<6;f++){const r=rects?.[f]||defaults[f];for(let j=f*4;j<f*4+4;j++)uv.setXY(j,(r[0]+uv.getX(j)*(r[2]-r[0]))/16,1-(r[1]+(1-uv.getY(j))*(r[3]-r[1]))/16);}
  return {g,keys:Array.isArray(keys)?keys:Array(6).fill(keys)};
 }
 function plane(w,h,rect,angle,center,key){const g=new T.PlaneGeometry(w/16,h/16);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(rect[0]+uv.getX(i)*(rect[2]-rect[0]))/16,1-(rect[1]+(1-uv.getY(i))*(rect[3]-rect[1]))/16);g.rotateY(angle);g.translate(...center);g.addGroup(0,g.index.count,0);return {g,keys:[key]};}
 function rotate(parts,axis,angle){for(const p of parts){p.g.translate(-.5,-.5,-.5);p.g.applyMatrix4(new T.Matrix4().makeRotationAxis(axis,angle));p.g.translate(.5,.5,.5);}return parts;}
 function orient(parts,dir,from='south'){const q=new T.Quaternion().setFromUnitVectors(V[from],V[dir]||V[from]),m=new T.Matrix4().makeRotationFromQuaternion(q);for(const p of parts){p.g.translate(-.5,-.5,-.5);p.g.applyMatrix4(m);p.g.translate(.5,.5,.5);}return parts;}
 function parts(b){const n=b.name.split(':')[1],s=b.states,out=[],key=n.includes('mud')?'mud':n.includes('birch')?'birch':n.includes('mosaic')?'mosaic':'bamboo';const add=(bounds,k=key,uv)=>out.push(box(bounds,k,uv));
  if(n==='bamboo_block'||n==='stripped_bamboo_block'){const side=n==='bamboo_block'?'log':'stripped',top=n==='bamboo_block'?'logTop':'strippedTop';add([0,0,0,16,16,16],[side,side,top,top,side,side]);return orient(out,s.pillar_axis==='x'?'east':s.pillar_axis==='z'?'south':'up','up');}
  if(n==='stripped_birch_log'||n==='ochre_froglight'){
   const side=n==='stripped_birch_log'?'birchLog':'froglight',top=n==='stripped_birch_log'?'birchLogTop':'froglightTop';
   add([0,0,0,16,16,16],[side,side,top,top,side,side]);return orient(out,s.pillar_axis==='x'?'east':s.pillar_axis==='z'?'south':'up','up');
  }
  if(n==='bamboo'){
   const half=s.bamboo_stalk_thickness==='thin'?1:1.5;
   const side=[0,0,half*2,16],cap=[0,0,half*2,half*2];
   add([8-half,0,8-half,8+half,16,8+half],'stem',[side,side,cap,cap,side,side]);
   const leaf=s.bamboo_leaf_size==='large_leaves'?'leaf':s.bamboo_leaf_size==='small_leaves'?'smallLeaf':null;
   if(leaf){out.push(plane(16,16,[0,0,16,16],Math.PI/4,[.5,.5,.5],leaf),plane(16,16,[0,0,16,16],-Math.PI/4,[.5,.5,.5],leaf));}
   return out;
  }
  if(n==='bamboo_fence_gate'){
   const drop=s.in_wall_bit?3:0;
   const postUV=[[0,0,2,11],[0,0,2,11],[0,0,2,2],[0,0,2,2],[8,1,10,12],[8,1,10,12]];
   const uprightUV=[[0,0,2,9],[0,0,2,9],[0,0,2,2],[0,0,2,2],[8,1,10,10],[8,1,10,10]];
   const railUV=[[0,0,2,3],[0,0,2,3],[3,1,7,3],[3,1,7,3],[3,1,7,4],[3,1,7,4]];
   add([0,5-drop,7,2,16-drop,9],'gate',postUV);add([14,5-drop,7,16,16-drop,9],'gate',postUV);
   if(s.open_bit){for(const x of [0,14]){
    add([x,6-drop,0,x+2,15-drop,2],'gate',uprightUV);
    const uv=[railUV[4],railUV[5],railUV[2],railUV[3],railUV[0],railUV[1]];
    add([x,6-drop,2,x+2,9-drop,6],'gate',uv);add([x,12-drop,2,x+2,15-drop,6],'gate',uv);
   }}else{
    for(const x of [6,8])add([x,6-drop,7,x+2,15-drop,9],'gate',uprightUV);
    for(const x of [2,10])for(const y of [6,12])add([x,y-drop,7,x+4,y+3-drop,9],'gate',railUV);
   }
   return orient(out,s['minecraft:cardinal_direction']??['south','west','north','east'][s.direction??0]);
  }
  if(n.endsWith('_stairs')){for(const p of canonicalStairParts(s))add(p);return orient(out,stairFacing[s.weirdo_direction??0]);}
  if(n.endsWith('_slab')&&!n.includes('double')){const y=s['minecraft:vertical_half']==='top'?8:0;add([0,y,0,16,y+8,16]);return out;}
  if(n==='bamboo_trapdoor'){const full=[0,0,16,16],edge=[0,0,16,3];if(s.open_bit)add([0,0,13,16,16,16],'trapdoor',[[0,0,3,16],[0,0,3,16],edge,edge,full,full]);else{const y=s.upside_down_bit?13:0;add([0,y,0,16,y+3,16],'trapdoor',[edge,edge,full,full,edge,edge]);}return orient(out,['west','east','north','south'][s.direction??0]);}
  if(n==='bamboo_fence'){
   const side=[0,0,4,16],cap=[4,0,8,4];add([6,0,6,10,16,10],'fence',[side,side,cap,cap,side,side]);
   const railUV=[[4,4,12,7],[4,4,12,7],[0,0,2,8],[0,0,2,8],[0,0,2,3],[0,0,2,3]];
   for(const dir of ['north','south','west','east'])if(s['minecraft:connection_'+dir]){
    const ps=[box([7,6,8,9,9,16],'fence',railUV),box([7,12,8,9,15,16],'fence',railUV)];out.push(...orient(ps,dir));
   }return out;
  }
  if(n==='mud_brick_wall'){if(s.wall_post_bit)add([4,0,4,12,16,12]);for(const dir of ['north','south','west','east']){const v=s['wall_connection_type_'+dir];if(v&&v!=='none')out.push(...orient([box([5,0,8,11,v==='tall'?16:14,16],key)],dir));}return out;}
  if(n==='iron_chain'){out.push(plane(3,16,[0,0,3,16],Math.PI/4,[.5,.5,.5],'chain1'),plane(3,16,[0,0,3,16],-Math.PI/4,[.5,.5,.5],'chain2'));return orient(out,s.pillar_axis==='x'?'east':s.pillar_axis==='z'?'south':'up','up');}
  if(n==='lantern'){const y=s.hanging?1:0,side=[0,2,6,9],cap=[0,9,6,15],neck=[1,0,5,2],top=[1,10,5,14];add([5,y,5,11,y+7,11],'lantern',[side,side,cap,cap,side,side]);add([6,y+7,6,10,y+9,10],'lantern',[neck,neck,top,top,neck,neck]);out.push(plane(3,6,[11,6,14,12],Math.PI/4,[.5,(y+12)/16,.5],'lantern'),plane(3,6,[11,0,14,6],-Math.PI/4,[.5,(y+12)/16,.5],'lantern'));return out;}
  if(n==='torch'){add([7,0,7,9,10,9],'torch',[[7,6,9,16],[7,6,9,16],[7,6,9,8],[7,14,9,16],[7,6,9,16],[7,6,9,16]]);const d=s.torch_facing_direction;if(d&&d!=='top'){const dir=V[d],q=new T.Quaternion().setFromUnitVectors(V.up,new T.Vector3(-dir.x*.5,1,-dir.z*.5).normalize());for(const p of out){p.g.translate(-.5,-.5,-.5);p.g.applyQuaternion(q);p.g.translate(.5+dir.x*.3,.7,.5+dir.z*.3);}}return out;}
  if(n==='scaffolding'){add([0,0,0,16,16,16],['scaffold','scaffold','scaffoldTop','scaffoldBottom','scaffold','scaffold']);return out;}
  if(n==='bell'){const face=[1,0,7,7],top=[1,1,7,7];add([5,6,5,11,13,11],['bell','bell','bellTop','bellBottom','bell','bell'],[face,face,top,top,face,face]);add([4,4,4,12,6,12],['bell','bell','bellTop','bellBottom','bell','bell'],[[0,7,8,9],[0,7,8,9],[0,0,8,8],[0,0,8,8],[0,7,8,9],[0,7,8,9]]);add([6,13,7,10,16,9],'wood');return orient(out,['south','west','north','east'][s.direction??0]);}
  add([0,0,0,16,16,16],n==='shroomlight'?'shroom':key);return out;
 }
 const bins=new Map();
 function collect(b){for(const part of parts(b)){const g=part.g;g.translate(b.x,b.y,b.z);const groups=g.groups.length?g.groups:[{start:0,count:g.index.count,materialIndex:0}];for(const f of groups){const key=part.keys[f.materialIndex]||part.keys[0];let bin=bins.get(key);if(!bin)bins.set(key,bin={key,geometries:[],entries:[]});const sub=g.clone();sub.clearGroups();const inds=Array.from(g.index.array.slice(f.start,f.start+f.count));sub.setIndex(inds);bin.geometries.push(sub);bin.entries.push({b,indices:inds.length});}g.dispose();}}
 blocks.forEach(collect);const batches=[];
 for(const bin of bins.values()){const geometry=mergeGeometries(bin.geometries,false);bin.geometries.forEach(g=>g.dispose());const source=geometry.index.array.slice(),index=new T.BufferAttribute(new Uint32Array(source.length),1);index.setUsage(T.DynamicDrawUsage);geometry.setIndex(index);geometry.clearGroups();const colors=new T.BufferAttribute(new Float32Array(geometry.attributes.position.count*3).fill(1),3);colors.setUsage(T.DynamicDrawUsage);geometry.setAttribute('color',colors);const mesh=new T.Mesh(geometry,materials[bin.key]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);const batch={key:bin.key,mesh,source,entries:bin.entries,active:[],triangles:[]};mesh.userData.batch=batch;batches.push(batch);}
 const blockLight=createBlockLight(blocks,parts,materials);let night=false;
 function colorize(){for(const {mesh} of batches){const {position:p,normal:n,color:c}=mesh.geometry.attributes;for(let i=0;i<p.count;i++){const pos=[p.getX(i)+n.getX(i)*.035,p.getY(i)+n.getY(i)*.035,p.getZ(i)+n.getZ(i)*.035],level=blockLight.sample(...pos),light=level?Math.pow(night?.65:.8,(30-level)/2):0,axis=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))].indexOf(Math.max(Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i)))),tangent=[0,1,2].filter(a=>a!==axis);let blocked=0;for(const a of [-.15,.15])for(const b of [-.15,.15]){const q=[...pos];q[tangent[0]]+=a;q[tangent[1]]+=b;if(blockLight.occluded(...q))blocked++;}const ao=1-blocked*.055,cool=night?Math.max(0,1-light*3):0;c.setXYZ(i,ao*(night?.92-cool*.10+light*3.4:1),ao*(night?.98+light*1.7:1),ao*(night?1.14+cool*.18+light*.38:1));}c.needsUpdate=true;}}
 function setEnvironment(value){night=value==='night';nightAdaptation.value=night?.12:0;for(const key of ['froglight','froglightTop'])materials[key].emissiveIntensity=night?.65:.3;colorize();}
 function filter(accept){blockLight.bake(accept);colorize();for(const b of batches){let src=0,dst=0;b.active=[];b.triangles=[];for(const entry of b.entries){const n=entry.indices;if(accept(entry.b)){b.mesh.geometry.index.array.set(b.source.subarray(src,src+n),dst);dst+=n;b.active.push(entry.b);for(let i=0;i<n;i+=3)b.triangles.push(entry.b);}src+=n;}b.mesh.geometry.index.needsUpdate=true;b.mesh.geometry.setDrawRange(0,dst);b.mesh.visible=dst>0;}}
 function alphaHit(hit){const m=hit.object.material;if(!m.alphaTest||!hit.uv)return true;const data=alphas.get(m.map);if(!data)return true;const u=Math.min(data.width-1,Math.max(0,Math.floor(hit.uv.x*data.width))),v=Math.min(data.height-1,Math.max(0,Math.floor((1-hit.uv.y)*data.height)));return data.data[(v*data.width+u)*4+3]/255>=m.alphaTest;}
 const iconScene=new T.Scene(),iconMaterials={};for(const [key,m] of Object.entries(materials))iconMaterials[key]=new T.MeshBasicMaterial({map:m.map,alphaTest:m.alphaTest,side:m.side,vertexColors:true,toneMapped:false});
 const iconCamera=new T.OrthographicCamera(-1,1,1,-1,.01,20),ir=new T.WebGLRenderer({alpha:true,antialias:false});ir.setSize(96,96);ir.outputColorSpace=T.SRGBColorSpace;ir.toneMapping=T.NoToneMapping;const icons={};
 for(const b of blocks){if(icons[b.name])continue;const group=new T.Group();const sample=inventoryBlock(b);for(const p of parts(sample)){const normal=p.g.attributes.normal,colors=new Float32Array(normal.count*3);for(let i=0;i<normal.count;i++){const shade=normal.getY(i)>.5?1:normal.getY(i)<-.5?.5:Math.abs(normal.getZ(i))>.5?.8:.6;colors.fill(shade,i*3,i*3+3);}p.g.setAttribute('color',new T.BufferAttribute(colors,3));group.add(new T.Mesh(p.g,p.keys.map(k=>iconMaterials[k])));}iconScene.add(group);const bounds=new T.Box3().setFromObject(group),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),span=Math.max(size.x,size.y,size.z)*.85;iconCamera.left=iconCamera.bottom=-span;iconCamera.right=iconCamera.top=span;iconCamera.position.copy(center).add(new T.Vector3(2,1.6,2.5));iconCamera.lookAt(center);iconCamera.updateProjectionMatrix();ir.render(iconScene,iconCamera);icons[b.name]=ir.domElement.toDataURL();iconScene.remove(group);group.traverse(o=>o.geometry?.dispose());}
 await Promise.all(Object.entries({lantern:'items/lantern.png',iron_chain:'items/chain.png',bell:'items/villagebell.png'}).map(async([id,file])=>{try{const tx=await new T.TextureLoader().loadAsync(ROOT+file),image=tx.image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);icons['minecraft:'+id]=c.toDataURL();tx.dispose();}catch{failures.push(file);}}));
 Object.values(iconMaterials).forEach(m=>m.dispose());ir.dispose();ir.forceContextLoss();
 return {batches,filter,alphaHit,icons,materials,failures,parts,setEnvironment,blockLight,inventoryBlock};
}

// Inventory items use their regular upright form; placed state remains untouched.
export function inventoryBlock(b){const n=b.name.split(':')[1],states={};if(n.endsWith('_stairs'))Object.assign(states,{weirdo_direction:3,upside_down_bit:0,'minecraft:corner':'none'});if(n.endsWith('_slab'))states['minecraft:vertical_half']='bottom';if(n.includes('bamboo_block')||n==='iron_chain')states.pillar_axis='y';if(n==='torch')states.torch_facing_direction='top';if(n==='bamboo_trapdoor')Object.assign(states,{open_bit:1,direction:3});if(n==='stripped_birch_log'||n==='ochre_froglight')states.pillar_axis='y';if(n==='bamboo_fence_gate')Object.assign(states,{'minecraft:cardinal_direction':'south',open_bit:0,in_wall_bit:0});if(n==='bamboo')Object.assign(states,{bamboo_stalk_thickness:'thick',bamboo_leaf_size:'large_leaves'});if(n==='bamboo_fence')Object.assign(states,{'minecraft:connection_east':1,'minecraft:connection_west':1});if(n==='mud_brick_wall')Object.assign(states,{wall_post_bit:1,wall_connection_type_east:'short',wall_connection_type_west:'short'});return {...b,states};}
