import * as T from 'three';
import {navalBoxes,orientNavalPoint} from '../../architect/v3/naval-blocks.mjs';

// New shapes only. Legacy geometries, atlas, alpha picking and materials are retained.
export function navalGeometry(spec,s,mapUV){
 if(!spec.shape.startsWith('naval-'))return null;
 const positions=[],uvs=[],indices=[];
 const quad=(corners,tile,uv,double=false)=>{
  const base=positions.length/3;
  for(let i=0;i<4;i++){positions.push(...orientNavalPoint(corners[i],spec.shape,s).map(n=>n/16));uvs.push(...mapUV(tile,...uv[i]));}
  indices.push(base,base+1,base+2,base,base+2,base+3);
  if(double)indices.push(base+2,base+1,base,base+3,base+2,base);
 };
 const box=(b,textures=Array(6).fill(spec.texture.side),rects=null)=>{
  const[a,c,e,bx,d,f]=b;
  const corners=[[[bx,c,f],[bx,c,e],[bx,d,e],[bx,d,f]],[[a,c,e],[a,c,f],[a,d,f],[a,d,e]],[[a,d,f],[bx,d,f],[bx,d,e],[a,d,e]],[[a,c,e],[bx,c,e],[bx,c,f],[a,c,f]],[[a,c,f],[bx,c,f],[bx,d,f],[a,d,f]],[[bx,c,e],[a,c,e],[a,d,e],[bx,d,e]]];
  for(let face=0;face<6;face++){
   const rect=rects?.[face];
   const uv=rect?[[rect[0],16-rect[3]],[rect[2],16-rect[3]],[rect[2],16-rect[1]],[rect[0],16-rect[1]]]:corners[face].map(([x,y,z])=>[[16-z,y],[z,y],[x,16-z],[x,z],[x,y],[16-x,y]][face]);
   quad(corners[face],textures[face],uv);
  }
 };
 const cross=(width,height,rect,cy,tiles)=>{
  for(const [i,angle]of [Math.PI/4,-Math.PI/4].entries()){
   const dx=Math.cos(angle)*width/2,dz=Math.sin(angle)*width/2;
   quad([[8-dx,cy-height/2,8-dz],[8+dx,cy-height/2,8+dz],[8+dx,cy+height/2,8+dz],[8-dx,cy+height/2,8-dz]],tiles[i],[[rect[0],16-rect[3]],[rect[2],16-rect[3]],[rect[2],16-rect[1]],[rect[0],16-rect[1]]],true);
  }
 };
 if(spec.shape==='naval-ladder'){
  // Front of the ladder faces away from the supporting wall.
  const plane=({2:[[16,0,15],[0,0,15],[0,16,15],[16,16,15]],
   3:[[0,0,1],[16,0,1],[16,16,1],[0,16,1]],
   4:[[15,0,0],[15,0,16],[15,16,16],[15,16,0]],
   5:[[1,0,16],[1,0,0],[1,16,0],[1,16,16]]})[s.facing_direction];
  quad(plane,spec.texture.side,[[0,0],[16,0],[16,16],[0,16]],true);
 }else if(spec.shape==='naval-chain')cross(3,16,[0,0,3,16],8,[spec.texture.side,spec.texture.alternate]);
 else if(spec.shape==='naval-lantern'){
  const y=s.hanging?1:0,side=[0,2,6,9],cap=[0,9,6,15],neck=[1,0,5,2],top=[1,10,5,14],tiles=Array(6).fill(spec.texture.side);
  box([5,y,5,11,y+7,11],tiles,[side,side,cap,cap,side,side]);
  box([6,y+7,6,10,y+9,10],tiles,[neck,neck,top,top,neck,neck]);
  // Distinct alpha islands for the two handle planes, as in the bamboo renderer.
  for(const[i,angle]of [Math.PI/4,-Math.PI/4].entries()){
   const dx=Math.cos(angle)*1.5,dz=Math.sin(angle)*1.5,r=i?[11,0,14,6]:[11,6,14,12];
   quad([[8-dx,y+9,8-dz],[8+dx,y+9,8+dz],[8+dx,y+15,8+dz],[8-dx,y+15,8-dz]],spec.texture.side,[[r[0],16-r[3]],[r[2],16-r[3]],[r[2],16-r[1]],[r[0],16-r[1]]],true);
  }
 }else if(spec.shape==='naval-barrel'){
  box([0,0,0,16,16,16],[spec.texture.side,spec.texture.side,spec.texture.side,spec.texture.side,spec.texture.back,s.open_bit?spec.texture.open:spec.texture.front]);
 }else if(spec.shape==='naval-door'){
  const texture=s.upper_block_bit?spec.texture.upper:spec.texture.side;
  const full=[0,0,16,16],edge=[0,0,3,16],cap=[0,0,16,3];
  box(navalBoxes(spec.shape,s)[0],Array(6).fill(texture),s.open_bit?[full,full,cap,cap,edge,edge]:[edge,edge,cap,cap,full,full]);
 }else for(const b of navalBoxes(spec.shape,s))box(b);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
