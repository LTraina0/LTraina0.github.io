// Approximate static block light on a half-block lattice. Full cubes and the
// occupied halves of stairs/slabs stop propagation; alpha-cut blocks transmit.
// This is a visual approximation, not Bedrock's light engine.
export function createBlockLight(blocks,parts,materials){
 const scale=2,padding=2;
 const axes=['x','y','z'],min=axes.map(axis=>Math.min(...blocks.map(b=>b[axis]))-padding),max=axes.map(axis=>Math.max(...blocks.map(b=>b[axis]))+1+padding);
 const size=max.map((v,i)=>(v-min[i])*scale),[sx,sy,sz]=size,n=sx*sy*sz,strideY=sx,strideZ=sx*sy;
 const cell=(x,y,z)=>Math.floor((x-min[0])*scale)+Math.floor((y-min[1])*scale)*strideY+Math.floor((z-min[2])*scale)*strideZ;
 const solids=new Map();
 for(const b of blocks){const set=new Set();for(const {g,keys} of parts(b)){if(keys.every(k=>!materials[k].alphaTest)){g.computeBoundingBox();const a=g.boundingBox.min,c=g.boundingBox.max;for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++){const px=(x+.5)/2,py=(y+.5)/2,pz=(z+.5)/2;if(px>a.x+1e-5&&px<c.x-1e-5&&py>a.y+1e-5&&py<c.y-1e-5&&pz>a.z+1e-5&&pz<c.z-1e-5)set.add(cell(b.x+px,b.y+py,b.z+pz));}}g.dispose();}solids.set(b,[...set]);}
 const sources=blocks.filter(b=>['minecraft:lantern','minecraft:torch','minecraft:shroomlight','minecraft:ochre_froglight'].includes(b.name));let field=new Uint8Array(n),occupied=new Uint8Array(n),bakes=0;
 function bake(accept){occupied.fill(0);field.fill(0);for(const [b,cells] of solids)if(accept(b))for(const i of cells)occupied[i]=1;
  const buckets=Array.from({length:31},()=>[]);
  for(const b of sources)if(accept(b)){const level=b.name==='minecraft:torch'?28:30;for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++){const i=cell(b.x+(x+.5)/2,b.y+(y+.5)/2,b.z+(z+.5)/2);if(field[i]<level){field[i]=level;buckets[level].push(i);}}}
  for(let level=30;level>1;level--){for(const i of buckets[level]){if(field[i]!==level)continue;const x=i%sx,y=Math.floor(i/sx)%sy,z=Math.floor(i/strideZ);for(const j of [x>0?i-1:-1,x<sx-1?i+1:-1,y>0?i-strideY:-1,y<sy-1?i+strideY:-1,z>0?i-strideZ:-1,z<sz-1?i+strideZ:-1])if(j>=0&&!occupied[j]&&field[j]<level-1){field[j]=level-1;buckets[level-1].push(j);}}}bakes++;
 }
 const sample=(x,y,z)=>{const ix=Math.floor((x-min[0])*2),iy=Math.floor((y-min[1])*2),iz=Math.floor((z-min[2])*2);return ix<0||iy<0||iz<0||ix>=sx||iy>=sy||iz>=sz?0:field[ix+iy*strideY+iz*strideZ]};
 const occluded=(x,y,z)=>{const ix=Math.floor((x-min[0])*scale),iy=Math.floor((y-min[1])*scale),iz=Math.floor((z-min[2])*scale);return ix>=0&&iy>=0&&iz>=0&&ix<sx&&iy<sy&&iz<sz&&occupied[ix+iy*strideY+iz*strideZ]===1};
 return {bake,sample,occluded,solids,sources,get bakes(){return bakes},get field(){return field},size,min,scale};
}
