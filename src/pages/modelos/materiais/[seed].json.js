import {paletteRegistry,paletteFamilies,recommend} from '../../../../architect/v2/palette.mjs';
export function getStaticPaths(){
  return Object.keys(paletteRegistry).map(id=>({params:{seed:id.split(':')[1]},props:{id}}));
}
export function GET({props:{id}}){
  const sets={};
  for(const family of Object.keys(paletteFamilies)){
    sets[family]={};
    for(const role of ['roof','wall','structure','foundation','ornament']){
      sets[family][role]=recommend(id,{family,role,limit:3}).map(({id,label,reason})=>({id,label,reason}));
    }
  }
  return Response.json(sets);
}
