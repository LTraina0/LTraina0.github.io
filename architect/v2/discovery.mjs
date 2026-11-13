import index from './block-index.json' with {type:'json'};
import {catalog} from './laboratory.mjs';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function discover({query='',state,scope='all',limit=20}={}){
  if(!['all','renderable','research'].includes(scope)||!Number.isSafeInteger(limit)||limit<1||limit>index.entries.length)throw Error('Filtro de descoberta inválido');
  const terms=normalize(query).split(/\s+/).filter(Boolean);
  const matches=[];
  for(const [id,rawLabel,states] of index.entries){
    const spec=catalog[id],label=spec?.label||rawLabel||id;
    const text=normalize(id+' '+label);
    if(!terms.every(term=>text.includes(term))||(state&&!states.includes(state)))continue;
    if((scope==='renderable'&&!spec)||(scope==='research'&&spec))continue;
    matches.push({id,label,states,scope:spec?'renderable':'research',shape:spec?.shape??null});
  }
  return {version:index.version,total:matches.length,items:matches.slice(0,limit)};
}
