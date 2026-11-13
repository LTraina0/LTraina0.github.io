import * as T from 'three';

// Presentation backdrop and subtle lens glow; not Minecraft terrain or new blocks.
export function createAtmosphere(scene,blocks){
 const fill=new T.DirectionalLight(0xe0ebed,.18);
 fill.position.set(36,24,-18);scene.add(fill);
 const material=new T.ShaderMaterial({
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
 const glow=new T.InstancedMesh(new T.PlaneGeometry(1,1),material,lanterns.length);
 glow.frustumCulled=false;glow.renderOrder=2;scene.add(glow);
 const matrix=new T.Matrix4();
 function filter(accept){let count=0;for(const b of lanterns)if(accept(b)){matrix.makeTranslation(b.x+.5,b.y+(b.states.hanging?1:0)/16+3.5/16,b.z+.5);glow.setMatrixAt(count++,matrix);}glow.count=count;glow.visible=count>0;glow.instanceMatrix.needsUpdate=true;}
 function setEnvironment(night){
  const c=document.createElement('canvas');c.width=2048;c.height=1024;
  const ctx=c.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,c.height);
  gradient.addColorStop(0,night?'#182b43':'#bdd9e8');
  gradient.addColorStop(.58,night?'#304858':'#e5e9df');
  gradient.addColorStop(1,night?'#213234':'#becdc4');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,c.width,c.height);
  const haze=ctx.createRadialGradient(c.width*(night?.78:.2),c.height*.12,0,c.width*.5,c.height*.5,c.width*.65);
  haze.addColorStop(0,night?'#bedfff14':'#fff4d735');haze.addColorStop(1,'#ffffff00');ctx.fillStyle=haze;ctx.fillRect(0,0,c.width,c.height);
  if(night){let seed=42;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<90;i++){const x=rand()*c.width,y=rand()*c.height*.48,size=rand()>.9?2:1;ctx.fillStyle=`rgba(219,236,250,${.16+rand()*.26})`;ctx.fillRect(Math.floor(x),Math.floor(y),size,size);}}
  scene.background?.dispose();scene.background=new T.CanvasTexture(c);scene.background.colorSpace=T.SRGBColorSpace;
  fill.color.set(night?0x8db7ff:0xe0ebed);fill.intensity=night?.65:.18;
  material.uniforms.strength.value=night?.30:.035;
 }
 setEnvironment(false);filter(()=>true);
 return {filter,setEnvironment,glow,fill};
}
