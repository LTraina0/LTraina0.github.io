// Native block parts in sixteenths. 0.3.1 uses exported states as the authority.
// Stair facing denotes its high/back half. Left is viewed along that direction.
export const stairFacing = ['east','west','south','north'];
export const trapdoorPlane = ['west','east','north','south'];
export function canonicalStairParts(states) {
 const top=!!states.upside_down_bit, low=top?0:8, high=top?8:16;
 const parts=[[0,top?8:0,0,16,top?16:8,16]];
 const shape=states['minecraft:corner']||'none';
 if(shape==='outer_left')parts.push([8,low,8,16,high,16]);
 else if(shape==='outer_right')parts.push([0,low,8,8,high,16]);
 else {
  parts.push([0,low,8,16,high,16]);
  if(shape==='inner_left')parts.push([8,low,0,16,high,8]);
  if(shape==='inner_right')parts.push([0,low,0,8,high,8]);
 }
 return parts;
}
export function nativeStairBounds(states) {
 const turns={2:0,1:1,3:2,0:3}[states.weirdo_direction??0];
 const rotate=(x,z)=>{for(let n=0;n<turns;n++)[x,z]=[16-z,x];return [x,z];};
 return canonicalStairParts(states).map(([x0,y0,z0,x1,y1,z1])=>{
  const a=rotate(x0,z0),b=rotate(x1,z1);
  return [Math.min(a[0],b[0]),y0,Math.min(a[1],b[1]),Math.max(a[0],b[0]),y1,Math.max(a[1],b[1])];
 });
}
