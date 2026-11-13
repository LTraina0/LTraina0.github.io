import {sternCatalog as registry} from './stern-catalog.mjs';
const families=['full','stairs','slab','trapdoor','fence','wall','barrel','chain','lantern','other'];
function bucket(){return {cells:0,families:Object.fromEntries(families.map(k=>[k,0])),ids:{},paletteRules:{},paletteChanges:0,kitCells:0,kits:{}};}
const inc=(o,k)=>o[k]=(o[k]??0)+1;
function record(row,b){
  const shape=registry[b.id].shape.replace('naval-','');
  const family=['log','cube'].includes(shape)?'full':families.includes(shape)?shape:'other';
  row.cells++;row.families[family]++;
  const id=row.ids[b.id]??={count:0,shape,states:{}};
  id.count++;inc(id.states,JSON.stringify(b.states));
  inc(row.paletteRules,b.appearance.ruleId);
  if(b.id!==b.appearance.inputId)row.paletteChanges++;
  const kit=b.kitId??(b.component?.startsWith('cabeço-')?'cleat':null);
  if(kit){row.kitCells++;inc(row.kits,kit);}
}
export function inspectSternMaterials(model){
  const total=bucket(),modules=Object.fromEntries(model.modules.map(m=>[m.id,{label:m.label,...bucket()}]));
  for(const b of model.blocks){record(total,b);record(modules[b.module],b);}
  for(const row of [total,...Object.values(modules)])row.percent=Object.fromEntries(families.map(k=>[k,Number((100*row.families[k]/(row.cells||1)).toFixed(2))]));
  return {source:model.stern.canonicalId,phase:model.params.phase,total,modules};
}

