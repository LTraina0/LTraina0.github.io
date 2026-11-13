import * as T from 'three';

// Supplemental native details already present on the preserved test rig.
export function cabineDetailGeometry(spec,s,mapUV){
 if(!['shelf','pane'].includes(spec.shape))return null;
 const vertices=[],uvs=[],indices=[];
 function face(corners,uv){
  const base=vertices.length/3;
  for(let i=0;i<4;i++){
   let [x,y,z]=corners[i];
   const turns=spec.shape==='shelf'?['north','east','south','west'].indexOf(s['minecraft:cardinal_direction']):0;
   for(let k=0;k<turns;k++)[x,z]=[16-z,x];
   vertices.push(x/16,y/16,z/16);
   const [u0,v0,u1,v1]=uv;
   const q=[[u1,16-v1],[u0,16-v1],[u0,16-v0],[u1,16-v0]][i];
   uvs.push(...mapUV(spec.texture.side,...q));
  }
  indices.push(base,base+1,base+2,base,base+2,base+3);
 }
 function box([x,y,z,X,Y,Z],uv={}){
  const faces={
   east:[[X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z]],
   west:[[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z]],
   up:[[x,Y,Z],[X,Y,Z],[X,Y,z],[x,Y,z]],
   down:[[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]],
   south:[[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],
   north:[[X,y,z],[x,y,z],[x,Y,z],[X,Y,z]]
  };
  for(const [key,points] of Object.entries(faces)){
   if(spec.shape==='shelf'&&!uv[key])continue;
   face(points,uv[key]||[0,0,16,16]);
  }
 }
 if(spec.shape==='pane'){
  const g=spec.geometry;box(g.center);
  for(const d of ['north','east','south','west'])if(s['minecraft:connection_'+d])box(g.connections[d]);
 }else{
  for(const part of spec.geometry.parts)box(part.box,part.uv);
  const q=spec.geometry.frontWhenUnpowered;box(q.box,q.uv);
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
 geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return geometry;
}
