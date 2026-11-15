import {sternViews} from './stern-views.js';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {createAtmosphere} from './atmosphere.js';
import {installFlightControls} from './wasd-controls.js';

const axes={perspective:[1,.65,1.25],avante:[1.35,.78,-.98],front:[0,0,1],back:[0,0,-1],left:[-1,0,0],right:[1,0,0],top:[0,1,.0001],bottom:[0,-1,.0001]};
export function createRoofScene(container,assets,onSelect){
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  container.append(renderer.domElement);
  const scene=new T.Scene(), perspective=new T.PerspectiveCamera(38,1,.1,2000);
  const ortho=new T.OrthographicCamera(-1,1,1,-1,.1,2000);
  let camera=perspective, span=22, frame=0, model=null, batches=[], selected=null,night=false,navalLights=[];
  let opaqueNeighbors=new Map();
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.minDistance=2; controls.maxDistance=220; controls.maxZoom=24; controls.minZoom=.25;
  const sky=new T.HemisphereLight(0xffffff,0xc7b4a0,1.85);
  const sun=new T.DirectionalLight(0xfff3da,2); sun.position.set(-25,40,23);
  scene.add(sky,sun);
  const atmosphere=createAtmosphere(scene,[]);
  const grid=new T.GridHelper(100,100,0x637b71,0x85958c);
  grid.material.transparent=true; grid.material.opacity=.36; grid.position.set(.5,-.02,.5);grid.visible=false;scene.add(grid);
  const selection=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.012,1.012,1.012)),new T.LineBasicMaterial({color:0xf9ce62}));
  selection.visible=false; scene.add(selection);
  function draw(){ if(!frame) frame=requestAnimationFrame(()=>{frame=0;renderer.render(scene,camera);}); }
  controls.addEventListener('change',draw);
  installFlightControls({controls,getCamera:()=>camera,domElement:renderer.domElement,onMove:draw,getSpan:()=>span});
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;
    if(!w||!h) return;
    const aspect=w/h;
    renderer.setSize(w,h,false); perspective.aspect=aspect; perspective.updateProjectionMatrix();
    ortho.left=-span*Math.max(1,aspect); ortho.right=-ortho.left;
    ortho.top=span/Math.min(1,aspect); ortho.bottom=-ortho.top; ortho.updateProjectionMatrix(); draw();
  }
  new ResizeObserver(resize).observe(container);
  function fit(view,blocks=model.blocks){
    const detail=sternViews[view];
    const dir=detail?.direction??axes[view];
    if(detail)blocks=[detail.min,detail.max].map(([x,y,z])=>({x,y,z}));
    const box=new T.Box3();
    for(const b of blocks){box.expandByPoint(new T.Vector3(b.x,b.y,b.z));box.expandByPoint(new T.Vector3(b.x+1,b.y+1,b.z+1));}
    if(box.isEmpty()) return;
    const target=box.getCenter(new T.Vector3());
    camera=detail||['perspective','avante'].includes(view)?perspective:ortho;
    camera.zoom=1; camera.up.set(0,1,0);
    camera.position.copy(target).add(new T.Vector3(...dir).normalize().multiplyScalar(100));
    camera.lookAt(target); camera.updateMatrixWorld(true);
    const projected=[];
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])
      projected.push(new T.Vector3(x,y,z).sub(target).applyQuaternion(camera.quaternion.clone().invert()));
    const aspect=Math.max(.01,container.clientWidth/container.clientHeight);
    const tan=Math.tan(T.MathUtils.degToRad(perspective.fov/2));
    const distance=Math.max(...projected.map(v=>v.z+Math.max(Math.abs(v.y),Math.abs(v.x)/aspect)/tan))*1.13;
    span=Math.max(...projected.map(v=>Math.max(Math.abs(v.x)/Math.max(1,aspect),Math.abs(v.y)*Math.min(1,aspect))))*1.14;
    camera.position.copy(target).add(new T.Vector3(...dir).normalize().multiplyScalar(distance));
    controls.object=camera;controls.target.copy(target);controls.update();resize();
  }
  function select(block){
    selected=block;selection.visible=!!block;
    if(block) selection.position.set(block.x+.5,block.y+.5,block.z+.5);
    onSelect(block);draw();
  }
  function load(next,nextAssets=assets){
    for(const {light}of navalLights)scene.remove(light);navalLights=[];
    for(const {mesh} of batches){scene.remove(mesh);mesh.dispose();}
    assets=nextAssets;
    model=next;select(null);
    if(next.blocks?.length){
      const box=new T.Box3();
      for(const b of next.blocks){box.expandByPoint(new T.Vector3(b.x,b.y,b.z));box.expandByPoint(new T.Vector3(b.x+1,b.y+1,b.z+1));}
      const c=box.getCenter(new T.Vector3()), sz=box.getSize(new T.Vector3());
      atmosphere.setBounds(c,Math.max(sz.x,sz.z),sz.y);
    }
    if(model.naval||model.polar)for(const block of model.blocks.filter(b=>b.id==='minecraft:lantern').slice(0,8)){
      const light=new T.PointLight(0xffb65a,night?4:.35,8,2);light.position.set(block.x+.5,block.y+.4,block.z+.5);scene.add(light);navalLights.push({light,block});
    }
    opaqueNeighbors=new Map();
    if(model.polar){
      const cubes=model.blocks.filter(block=>assets.isOpaqueCube?.(block));
      const cells=new Map(cubes.map(block=>[[block.x,block.y,block.z].join(','),block]));
      for(const block of cubes){
        const {x,y,z}=block;
        opaqueNeighbors.set(block,[[x-1,y,z],[x+1,y,z],[x,y-1,z],[x,y+1,z],[x,y,z-1],[x,y,z+1]].map(p=>cells.get(p.join(','))));
      }
    }
    const groups=new Map();
    for(const b of model.blocks){
      const geometry=assets.geometry(b);
      if(!groups.has(geometry)) groups.set(geometry,[]);
      groups.get(geometry).push(b);
    }
    batches=[...groups].map(([geometry,blocks])=>{
      const mesh=new T.InstancedMesh(geometry,assets.materialFor?.(blocks[0].id)??assets.material,blocks.length);
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      scene.add(mesh);return {mesh,blocks};
    });
    lighting(night);
  }
  const matrix=new T.Matrix4();
  function filter(visible){
    for(const {light,block}of navalLights)light.visible=visible.has(block);
    for(const {mesh,blocks} of batches){
      const active=[];
      for(const b of blocks)if(visible.has(b)){
        // Only wholly buried opaque cubes can disappear. Every filter recomputes
        // the condition, so a layer cut or isolated module exposes its real cells.
        const neighbors=opaqueNeighbors.get(b);
        if(neighbors?.every(neighbor=>neighbor&&visible.has(neighbor)))continue;
        matrix.makeTranslation(b.x,b.y,b.z);
        mesh.setMatrixAt(active.length,matrix);active.push(b);
      }
      mesh.count=active.length;mesh.visible=!!active.length;mesh.userData.active=active;
      mesh.instanceMatrix.needsUpdate=true;
      if(mesh.visible) mesh.computeBoundingSphere();
    }
    if(selected && !visible.has(selected)) select(null);
    draw();
  }
  const ray=new T.Raycaster();
  let start=null;
  renderer.domElement.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!start||e.button!==0||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5) return;
    const r=container.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2(2*(e.clientX-r.left)/r.width-1,1-2*(e.clientY-r.top)/r.height),camera);
    const hit=ray.intersectObjects(batches.filter(b=>b.mesh.visible).map(b=>b.mesh),false).find(assets.alphaHit);
    select(hit?.object.userData.active[hit.instanceId]??null);
  });
  function setBackdrop(value){
    atmosphere.setBackdrop(value);
    const b=atmosphere.backdrop;
    if(!night&&!model?.polar){
      sky.groundColor.set(b==='editor'?0xc4dcfb:0xc7b4a0);
      grid.material.color.set(0x637b71);
    }
    draw();
  }
  setBackdrop(document.querySelector('#backdrop')?.value||'editor');
  function lighting(value){
    night=value;
    const polar=Boolean(model?.polar);
    for(const{light}of navalLights)light.intensity=night?4:polar?.8:.35;
    atmosphere.setEnvironment(night);
    sky.color.set(polar?0xd7edff:0xffffff);
    const b=atmosphere.backdrop;
    sky.groundColor.set(polar?0x536a7e:b==='editor'&&!night?0xc4dcfb:0xc7b4a0);
    sky.intensity=night?1.05:1.85;
    sun.intensity=night?.6:polar?1.7:2;
    sun.color.set(night?0xd1dffb:polar?0xd3e9ff:0xfff3da);
    draw();
  }
  // Identical frusta and orbit targets allow a block-for-block comparison.
  function matchView(other){
    camera=other.camera.isPerspectiveCamera?perspective:ortho;
    span=other.span;camera.position.copy(other.camera.position);camera.up.copy(other.camera.up);
    camera.zoom=other.camera.zoom;controls.object=camera;controls.target.copy(other.controls.target);
    controls.update();resize();
  }
  return {renderer,scene,controls,load,filter,fit,select,lighting,setBackdrop,grid,draw,matchView,get span(){return span;},get camera(){return camera;},get batches(){return batches;},get selected(){return selected;}};
}
