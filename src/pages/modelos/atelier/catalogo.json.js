import {catalog} from '../../../../architect/v2/laboratory.mjs';
import {paletteRegistry} from '../../../../architect/v2/palette.mjs';
export function GET(){
  return Response.json(Object.fromEntries(Object.entries(catalog).map(([id,{label,shape,states,texture,lightEmission,emission,translucent}])=>[id,{label,shape,states,texture,...(translucent?{translucent:true}:{}),lightEmission:lightEmission??emission??0,measured:Object.hasOwn(paletteRegistry,id)}])));
}
