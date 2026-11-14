import * as T from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';

// Sky, horizon, clouds and studio cyclorama/reflection presets across viewer builds.
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
  uTopColor:{value:new T.Color('#7eb0ff')},
  uHorizonColor:{value:new T.Color('#cbe2ff')},
  uBottomColor:{value:new T.Color('#bad5fa')},
  uStars:{value:0},
  uIsStudio:{value:0}
 };
 const skyDome=new T.Mesh(
  new T.SphereGeometry(280,32,20),
  new T.ShaderMaterial({
   uniforms:skyUniforms,
   side:T.BackSide,depthWrite:false,fog:false,
   vertexShader:`varying vec3 vDir;
    void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform vec3 uTopColor;uniform vec3 uHorizonColor;uniform vec3 uBottomColor;
    uniform float uStars;uniform float uIsStudio;varying vec3 vDir;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
     float y=vDir.y;
     vec3 col;
     if(y>=0.){
      float t=pow(clamp(y*1.25,0.,1.),uIsStudio>.5?.65:.75);
      col=mix(uHorizonColor,uTopColor,t);
     }else{
      float b=pow(clamp(-y*2.2,0.,1.),uIsStudio>.5?.5:.72);
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

 // Crisp flat Minecraft Editor clouds around the upper perimeter (leaving overhead top view unobstructed).
 const cloudGeo=new T.BoxGeometry(1,1,1);
 const posAttr=cloudGeo.attributes.position,nrmAttr=cloudGeo.attributes.normal;
 const vColors=new Float32Array(posAttr.count*3);
 for(let i=0;i<posAttr.count;i++){
  const ny=nrmAttr.getY(i),nx=nrmAttr.getX(i);
  const shade=ny>.5?1:ny<-.5?.80:Math.abs(nx)>.5?.92:.95;
  vColors[i*3]=shade;vColors[i*3+1]=shade*.99;vColors[i*3+2]=1;
 }
 cloudGeo.setAttribute('color',new T.BufferAttribute(vColors,3));
 const cloudMaterial=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.92,fog:true});
 const cloudSpecs=[];
 let seed=1337;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<56;i++){
  const angle=(i/56)*Math.PI*2+(rand()-.5)*.22;
  const ring=1.55+rand()*2.45;
  const w=10+Math.floor(rand()*5)*4,d=8+Math.floor(rand()*4)*4,h=3;
  const dy=(rand()-.5)*4;
  cloudSpecs.push({angle,ring,w,d,h,dy});
 }
 const clouds=new T.InstancedMesh(cloudGeo,cloudMaterial,cloudSpecs.length);
 clouds.frustumCulled=false;clouds.renderOrder=-5;scene.add(clouds);

 // Soft satin cyclorama studio floor reflector (only active in studio perspective views).
 const studioUniforms={
  tDiffuse:{value:null},
  color:{value:null},
  textureMatrix:{value:null},
  uFloorColor:{value:new T.Color('#fafbfc')},
  uCenter:{value:new T.Vector3()},
  uRadius:{value:60},
  uStrength:{value:.22},
  uTexel:{value:new T.Vector2(1/1024,1/1024)},
  uEnabled:{value:0}
 };
 const studioReflector=new Reflector(new T.PlaneGeometry(1,1),{
  clipBias:.003,textureWidth:1024,textureHeight:1024,color:0xffffff,multisample:0,
  shader:{
   name:'StudioCycloramaReflector',
   uniforms:studioUniforms,
   vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorldPos;
    void main(){
     vec4 wp=modelMatrix*vec4(position,1.);
     vWorldPos=wp.xyz;vUv=textureMatrix*vec4(position,1.);
     gl_Position=projectionMatrix*viewMatrix*wp;
    }`,
   fragmentShader:`uniform sampler2D tDiffuse;uniform vec3 uFloorColor;uniform vec3 uCenter;
    uniform float uRadius;uniform float uStrength;uniform vec2 uTexel;uniform float uEnabled;
    varying vec4 vUv;varying vec3 vWorldPos;
    void main(){
     float dist=length(vWorldPos.xz-uCenter.xz)/max(1.,uRadius);
     float fade=1.-smoothstep(.38,.98,dist);
     if(fade<=.002)discard;
     vec3 col=uFloorColor;
     if(uEnabled>.5){
      vec2 p=vUv.xy/max(.0001,vUv.w);
      vec2 o1=uTexel*1.6,o2=uTexel*3.4;
      vec3 refl=(
       texture2D(tDiffuse,clamp(p,0.002,0.998)).rgb*.24+
       texture2D(tDiffuse,clamp(p+vec2(o1.x,o1.y),0.002,0.998)).rgb*.11+
       texture2D(tDiffuse,clamp(p+vec2(-o1.x,o1.y),0.002,0.998)).rgb*.11+
       texture2D(tDiffuse,clamp(p+vec2(o1.x,-o1.y),0.002,0.998)).rgb*.11+
       texture2D(tDiffuse,clamp(p+vec2(-o1.x,-o1.y),0.002,0.998)).rgb*.11+
       texture2D(tDiffuse,clamp(p+vec2(o2.x,0.),0.002,0.998)).rgb*.08+
       texture2D(tDiffuse,clamp(p+vec2(-o2.x,0.),0.002,0.998)).rgb*.08+
       texture2D(tDiffuse,clamp(p+vec2(0.,o2.y),0.002,0.998)).rgb*.08+
       texture2D(tDiffuse,clamp(p+vec2(0.,-o2.y),0.002,0.998)).rgb*.08
      );
      col=mix(uFloorColor,refl,uStrength*fade);
     }
     gl_FragColor=vec4(col,fade*.96);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`
  }
 });
 studioReflector.rotation.x=-Math.PI/2;
 studioReflector.material.transparent=true;studioReflector.material.depthWrite=false;
 studioReflector.renderOrder=-2;studioReflector.visible=false;studioReflector.frustumCulled=false;
 const nativeBeforeRender=studioReflector.onBeforeRender;

 let backdropMode='editor',isNight=false,boundsCenter=new T.Vector3(24,10,12),boundsSpan=80,boundsHeight=32;

 studioReflector.onBeforeRender=function(renderer,s,cam,geometry,material,group){
  const active=backdropMode==='studio'&&cam.isPerspectiveCamera&&cam.position.y>.05;
  material.uniforms.uEnabled.value=active?1:0;
  if(!active)return;
  return nativeBeforeRender.call(this,renderer,s,cam,geometry,material,group);
 };
 scene.add(studioReflector);

 function setStudioFocus(center,span){
  const reflSpan=Math.max(96,span*2.5);
  studioReflector.position.set(center.x,-.07,center.z);
  studioReflector.scale.set(reflSpan,reflSpan,1);
  studioReflector.material.uniforms.uCenter.value.set(center.x,0,center.z);
  studioReflector.material.uniforms.uRadius.value=reflSpan*.48;
 }

 function updateCloudsAndFloor(){
  const baseRadius=Math.max(72,boundsSpan*1.0);
  const cloudY=Math.max(boundsHeight+54,boundsSpan*.92);
  const m=new T.Matrix4(),q=new T.Quaternion(),s=new T.Vector3(),pos=new T.Vector3();
  cloudSpecs.forEach((c,i)=>{
   const r=baseRadius*c.ring;
   pos.set(boundsCenter.x+Math.cos(c.angle)*r,cloudY+c.dy,boundsCenter.z+Math.sin(c.angle)*r);
   s.set(c.w,c.h,c.d);
   m.compose(pos,q,s);
   clouds.setMatrixAt(i,m);
  });
  clouds.instanceMatrix.needsUpdate=true;
  clouds.computeBoundingSphere();

  setStudioFocus(boundsCenter,boundsSpan);
 }

 function apply(){
  const horizon=backdropMode==='editor'?(isNight?'#142342':'#cbe2ff'):backdropMode==='studio'?(isNight?'#13171e':'#f4f6f9'):(isNight?'#304858':'#e5e9df');
  if(backdropMode==='editor'){
   skyUniforms.uTopColor.value.set(isNight?'#091124':'#7eb0ff');
   skyUniforms.uHorizonColor.value.set(horizon);
   skyUniforms.uBottomColor.value.set(isNight?'#0e1930':'#bad5fa');
   skyUniforms.uStars.value=isNight?1:0;skyUniforms.uIsStudio.value=0;
   clouds.visible=true;cloudMaterial.color.set(isNight?0x2d4368:0xffffff);cloudMaterial.opacity=isNight?.68:.92;
   scene.fog=new T.Fog(horizon,Math.max(190,boundsSpan*2.9),Math.max(430,boundsSpan*6.2));
   studioReflector.visible=false;
   fill.color.set(isNight?0x8db7ff:0x9fc5ff);fill.intensity=isNight?.65:.28;
  }else if(backdropMode==='studio'){
   skyUniforms.uTopColor.value.set(isNight?'#1e232d':'#ffffff');
   skyUniforms.uHorizonColor.value.set(horizon);
   skyUniforms.uBottomColor.value.set(isNight?'#0e1116':'#fafbfc');
   skyUniforms.uStars.value=0;skyUniforms.uIsStudio.value=1;
   clouds.visible=false;scene.fog=null;
   studioReflector.visible=true;
   studioReflector.material.uniforms.uFloorColor.value.set(isNight?'#12161d':'#fafbfc');
   studioReflector.material.uniforms.uStrength.value=isNight?.26:.22;
   fill.color.set(isNight?0x9cb8ec:0xe6eefc);fill.intensity=isNight?.6:.25;
  }else{
   skyUniforms.uTopColor.value.set(isNight?'#182b43':'#bdd9e8');
   skyUniforms.uHorizonColor.value.set(horizon);
   skyUniforms.uBottomColor.value.set(isNight?'#213234':'#becdc4');
   skyUniforms.uStars.value=isNight?1:0;skyUniforms.uIsStudio.value=0;
   clouds.visible=false;scene.fog=null;studioReflector.visible=false;
   fill.color.set(isNight?0x8db7ff:0xe0ebed);fill.intensity=isNight?.65:.18;
  }
  scene.background=new T.Color(horizon);
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
 function setBackdrop(style){backdropMode=['editor','studio','classic'].includes(style)?style:'editor';apply();}

 apply();filter(()=>true);
 return {filter,setEnvironment,setBackdrop,setBounds,setStudioFocus,glow,fill,skyDome,clouds,studioReflector,get backdrop(){return backdropMode;},get night(){return isNight;}};
}
