import * as T from 'three';

// Sky, horizon, and stepped Minecraft Editor clouds across viewer builds.
export function createAtmosphere(scene,blocks=[]){
 const fill=new T.DirectionalLight(0xa6c8ff,.26);
 fill.position.set(36,24,-18);scene.add(fill);

 const glowMaterial=new T.ShaderMaterial({
  uniforms:{glowColor:{value:new T.Color(0xffb866)},strength:{value:.035}},
  vertexShader:`varying vec2 vUv;
   void main(){vUv=uv;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
    center.xy+=position.xy*.82;center.z+=.26;gl_Position=projectionMatrix*center;}`,
  fragmentShader:`uniform vec3 glowColor;uniform float strength;varying vec2 vUv;
   void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*5.5)*(1.-smoothstep(.7,1.,r))*strength;
    gl_FragColor=vec4(glowColor,a);
    #include <colorspace_fragment>
   }`,
  transparent:true,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false
 });
 const lanterns=blocks.filter(b=>b.name==='minecraft:lantern');
 const glow=new T.InstancedMesh(new T.PlaneGeometry(1,1),glowMaterial,Math.max(1,lanterns.length));
 glow.count=lanterns.length;glow.visible=lanterns.length>0;glow.frustumCulled=false;glow.renderOrder=2;scene.add(glow);
 const glowMatrix=new T.Matrix4();
 function filter(accept){
  let count=0;
  for(const b of lanterns)if(accept(b)){glowMatrix.makeTranslation(b.x+.5,b.y+(b.states.hanging?1:0)/16+3.5/16,b.z+.5);glow.setMatrixAt(count++,glowMatrix);}
  glow.count=count;glow.visible=count>0;glow.instanceMatrix.needsUpdate=true;
 }

 const skyUniforms={
  uTopColor:{value:new T.Color('#77a6ff')},
  uHorizonColor:{value:new T.Color('#cde2ff')},
  uBottomColor:{value:new T.Color('#b9d5fb')},
  uStars:{value:0}
 };
 const skyDome=new T.Mesh(
  new T.SphereGeometry(320,32,20),
  new T.ShaderMaterial({
   uniforms:skyUniforms,
   side:T.BackSide,depthWrite:false,fog:false,
   vertexShader:`varying vec3 vDir;
    void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform vec3 uTopColor;uniform vec3 uHorizonColor;uniform vec3 uBottomColor;
    uniform float uStars;varying vec3 vDir;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
     float y=vDir.y;
     vec3 col;
     if(y>=0.){
      float t=pow(clamp(y*1.15,0.,1.),.68);
      col=mix(uHorizonColor,uTopColor,t);
     }else{
      float b=pow(clamp(-y*2.0,0.,1.),.72);
      col=mix(uHorizonColor,uBottomColor,b);
     }
     if(uStars>.5&&y>.08){
      vec2 grid=floor(vDir.xz/(y+.15)*90.);
      float r=hash(grid);
      if(r>.988){
       float lum=(r-.988)/.012;
       col+=vec3(.82,.90,1.)*lum*.65*smoothstep(.08,.26,y);
      }
     }
     gl_FragColor=vec4(col,1.);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`
  })
 );
 skyDome.renderOrder=-10;skyDome.frustumCulled=false;
 skyDome.onBeforeRender=(_r,_s,cam)=>{skyDome.position.copy(cam.position);skyDome.updateMatrixWorld();};
 scene.add(skyDome);

 // Stepped Minecraft Editor clouds with crisp directional face shading.
 const cloudGeo=new T.BoxGeometry(1,1,1);
 const posAttr=cloudGeo.attributes.position,nrmAttr=cloudGeo.attributes.normal;
 const vColors=new Float32Array(posAttr.count*3);
 for(let i=0;i<posAttr.count;i++){
  const ny=nrmAttr.getY(i),nx=nrmAttr.getX(i);
  if(ny>.5){
   vColors[i*3]=1;vColors[i*3+1]=1;vColors[i*3+2]=1;
  }else if(ny<-.5){
   vColors[i*3]=.76;vColors[i*3+1]=.81;vColors[i*3+2]=.94;
  }else if(Math.abs(nx)>.5){
   vColors[i*3]=.88;vColors[i*3+1]=.91;vColors[i*3+2]=.99;
  }else{
   vColors[i*3]=.93;vColors[i*3+1]=.95;vColors[i*3+2]=1;
  }
 }
 cloudGeo.setAttribute('color',new T.BufferAttribute(vColors,3));
 const cloudMaterial=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.94,fog:true});
 const cloudSpecs=[];
 let seed=1337;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const snap=v=>Math.round(v/4)*4;
 for(let i=0;i<36;i++){
  const angle=(i/36)*Math.PI*2+(rand()-.5)*.18;
  const ring=1.35+rand()*2.65;
  const h=2.6;
  const dy=snap((rand()-.5)*6);
  // Build a multi-part stepped Minecraft cloud cluster around (angle, ring).
  const parts=3+Math.floor(rand()*4);
  for(let p=0;p<parts;p++){
   const w=(p===0?16:8)+Math.floor(rand()*4)*4;
   const d=(p===0?12:8)+Math.floor(rand()*3)*4;
   const ox=p===0?0:snap((rand()-.5)*22);
   const oz=p===0?0:snap((rand()-.5)*18);
   cloudSpecs.push({angle,ring,w,d,h,dy,ox,oz});
  }
  if(rand()>.45){
   // Occasional small detached voxel puff nearby.
   cloudSpecs.push({
    angle,ring,
    w:4+Math.floor(rand()*2)*4,
    d:4+Math.floor(rand()*2)*4,
    h,dy,
    ox:snap((rand()-.5)*34),
    oz:snap((rand()-.5)*30)
   });
  }
 }
 const clouds=new T.InstancedMesh(cloudGeo,cloudMaterial,cloudSpecs.length);
 clouds.frustumCulled=false;clouds.renderOrder=-5;scene.add(clouds);

 let backdropMode='editor',isNight=false,boundsCenter=new T.Vector3(24,10,12),boundsSpan=80,boundsHeight=32;

 const _cloudMat=new T.Matrix4(),_cloudQuat=new T.Quaternion(),_cloudScale=new T.Vector3(),_cloudPos=new T.Vector3();
 function updateCloudsAndFloor(){
  const baseRadius=Math.max(76,boundsSpan*1.05);
  const cloudY=Math.max(boundsHeight+56,boundsSpan*.9);
  cloudSpecs.forEach((c,i)=>{
   const r=baseRadius*c.ring;
   _cloudPos.set(
    boundsCenter.x+Math.cos(c.angle)*r+c.ox,
    cloudY+c.dy,
    boundsCenter.z+Math.sin(c.angle)*r+c.oz
   );
   _cloudScale.set(c.w,c.h,c.d);
   _cloudMat.compose(_cloudPos,_cloudQuat,_cloudScale);
   clouds.setMatrixAt(i,_cloudMat);
  });
  clouds.instanceMatrix.needsUpdate=true;
  clouds.computeBoundingSphere();
 }

 const editorFog=new T.Fog('#cde2ff',170,410);
 const bgColor=new T.Color('#cde2ff');

 function apply(){
  const horizon=backdropMode==='editor'?(isNight?'#132242':'#cde2ff'):(isNight?'#304858':'#e5e9df');
  if(backdropMode==='editor'){
   skyUniforms.uTopColor.value.set(isNight?'#081022':'#77a6ff');
   skyUniforms.uHorizonColor.value.set(horizon);
   skyUniforms.uBottomColor.value.set(isNight?'#0d182e':'#b9d5fb');
   skyUniforms.uStars.value=isNight?1:0;
   clouds.visible=true;cloudMaterial.color.set(isNight?0x324b73:0xffffff);cloudMaterial.opacity=isNight?.68:.94;
   editorFog.color.set(horizon);
   editorFog.near=Math.max(170,boundsSpan*2.3);
   editorFog.far=Math.max(410,boundsSpan*5.6);
   scene.fog=editorFog;
   fill.color.set(isNight?0x8db7ff:0x9ec6ff);fill.intensity=isNight?.65:.28;
  }else{
   skyUniforms.uTopColor.value.set(isNight?'#182b43':'#bdd9e8');
   skyUniforms.uHorizonColor.value.set(horizon);
   skyUniforms.uBottomColor.value.set(isNight?'#213234':'#becdc4');
   skyUniforms.uStars.value=isNight?1:0;
   clouds.visible=false;scene.fog=null;
   fill.color.set(isNight?0x8db7ff:0xe0ebed);fill.intensity=isNight?.65:.18;
  }
  bgColor.set(horizon);
  scene.background=bgColor;
  glowMaterial.uniforms.strength.value=isNight?.30:.035;
  document.body.classList.remove('backdrop-editor','backdrop-studio','backdrop-classic');
  document.body.classList.add('backdrop-'+backdropMode);
 }

 function setBounds(center,span,height){
  boundsCenter.copy(center);boundsSpan=Math.max(20,span);boundsHeight=Math.max(10,height);
  updateCloudsAndFloor();if(backdropMode==='editor')apply();
 }
 if(blocks.length){
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const b of blocks){if(b.x<minX)minX=b.x;if(b.x>maxX)maxX=b.x;if(b.y<minY)minY=b.y;if(b.y>maxY)maxY=b.y;if(b.z<minZ)minZ=b.z;if(b.z>maxZ)maxZ=b.z;}
  boundsCenter.set((minX+maxX+1)/2,(minY+maxY+1)/2,(minZ+maxZ+1)/2);
  boundsSpan=Math.max(maxX-minX+1,maxZ-minZ+1);
  boundsHeight=maxY-minY+1;
 }
 updateCloudsAndFloor();

 function setEnvironment(night){isNight=Boolean(night);apply();}
 function setBackdrop(style){backdropMode=['editor','classic'].includes(style)?style:'editor';apply();}

 function dispose(){
  scene.remove(fill,glow,skyDome,clouds);
  glow.geometry.dispose();glowMaterial.dispose();
  skyDome.geometry.dispose();skyDome.material.dispose();
  cloudGeo.dispose();cloudMaterial.dispose();
 }

 apply();filter(()=>true);
 return {filter,setEnvironment,setBackdrop,setBounds,dispose,glow,fill,skyDome,clouds,get backdrop(){return backdropMode;},get night(){return isNight;}};
}
