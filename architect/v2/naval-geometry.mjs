// Naval sections extend the Geometry Engine's cell-based construction vocabulary.
// Stations interpolate breadth; transverse floors, frames and planking use one profile.
export function hullSection(stations,z,level,depth=8){
 if(stations.length<2||level<1||level>depth)throw Error('Seção naval inválida');
 let a=stations[0],b=stations.at(-1);
 for(let i=1;i<stations.length;i++)if(z<=stations[i][0]){a=stations[i-1];b=stations[i];break;}
 const t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0]))),breadth=a[1]+(b[1]-a[1])*t;
 const q=level/depth;
 return Math.max(1,Math.round(breadth*Math.sin(q*Math.PI/2)**.82));
}
export function fractureEnd(x,y,base=-9){
 return base+Math.floor((x+12)/3)%3+(x<0?-2:0)+(y<=4?2:0);
}
export function voxelLine(a,b){
 const length=Math.max(...a.map((n,i)=>Math.abs(b[i]-n))),out=[],seen=new Set();
 for(let i=0;i<=length;i++){
  const p=a.map((n,j)=>Math.round(n+(b[j]-n)*i/Math.max(1,length))),k=p.join(',');
  if(!seen.has(k)){seen.add(k);out.push(p);}
 }
 return out;
}
