import {readFileSync} from 'node:fs';
import {makeStudy} from './v2/laboratory.mjs';
import {generateStern} from './v3/stern.mjs';
import {fjordStern} from './v3/stern-fjord.mjs';
import {generatePolarScene} from './v3/polar.mjs';
import {generateRoof} from './roof.mjs';
import {studies,studyKey} from './v2/studies.mjs';
const read=name=>JSON.parse(readFileSync('public/'+name,'utf8'));
export const inspectionProjects=[
  {id:'bamboo',label:'Casa de bambu',data:'/model.json',load:()=>read('model.json')},
  ...['1.0.3','2.3.0','2.4.0'].map(v=>({id:'portal-'+v,label:'Portal Escarlate '+v,data:'/portal/versions/'+v+'.json',load:()=>read('portal/versions/'+v+'.json')})),
  {id:'polar-main',label:'Andorinha · Creeping Winter',data:'/andorinha-polar/model.json',load:()=>generatePolarScene()},
  {id:'roof-01',label:'Telhado oriental 0.1',data:'/modelos/telhado/classica-curvo-slate.json',load:()=>generateRoof()},
  ...['A','B','C'].map(edition=>({id:'facade-'+edition,label:'Fachada 0.2.1 · '+edition,data:'/modelos/atelier/facade-'+edition+'-contextual.json',load:()=>makeStudy({study:'facade',edition,distribution:'contextual'})})),
  ...Object.entries({displaced:'painel deslocado',intact:'íntegra',broken:'rompida'}).map(([phase,label])=>({
    id:'carpintaria-'+phase,label:'Popa da Andorinha · '+label,data:'/andorinha-carpintaria/'+phase+'.json',
    load:()=>generateStern({phase,design:fjordStern})
  })),
  ...studies().filter(p=>p.study==='sternwork').map(p=>({id:studyKey(p),label:'Andorinha refinada · '+p.phase,data:'/modelos/atelier/'+studyKey(p)+'.json',load:()=>makeStudy(p)})),
  ...studies().filter(p=>p.study==='stern').map(p=>({id:studyKey(p),label:'Popa · '+p.phase,data:'/modelos/atelier/'+studyKey(p)+'.json',load:()=>makeStudy(p)})),
  ...studies().filter(p=>p.study==='sections').map(p=>({id:studyKey(p),label:'Anatomia naval · '+p.specimen+' · '+p.resolution,data:'/modelos/atelier/'+studyKey(p)+'.json',load:()=>makeStudy(p)})),
  ...studies().filter(p=>p.study==='shipwreck').map(p=>({id:studyKey(p),label:'O Último Encalhe · '+p.composition+' · '+p.condition,data:'/modelos/atelier/'+studyKey(p)+'.json',load:()=>makeStudy(p)})),
  ...studies().filter(p=>p.study==='refined').map(p=>({id:studyKey(p),label:'Fachada 0.2.2 · '+p.console+' · '+p.capital+' · '+p.surface,
    data:'/modelos/atelier/'+studyKey(p)+'.json',load:()=>makeStudy(p)}))
];
export const publicStudies=()=>studies().map(p=>({id:studyKey(p),parameters:p,data:'/modelos/atelier/'+studyKey(p)+'.json'}));
export function inspectProject(project){
  const model=project.load(),counts={},stateDomains={},modules={};
  for(const block of model.blocks){
    const id=block.id??block.name;counts[id]=(counts[id]??0)+1;
    const module=String(block.module??block.stage??'unassigned');modules[module]=(modules[module]??0)+1;
    stateDomains[id]??={};
    for(const [k,v] of Object.entries(block.states??{})){
      stateDomains[id][k]??=[];if(!stateDomains[id][k].includes(v))stateDomains[id][k].push(v);
    }
  }
  return {id:project.id,label:project.label,data:project.data,blocks:model.blocks.length,bounds:model.bounds??model.size,
    materials:counts,states:stateDomains,modules,parameters:model.params??{},validation:model.validation??{game:'not-verified-by-this-report'},
    ...(model.stern?{stern:model.stern}:{}),
    ...(model.polar?{polar:model.polar}:{}),
    sample:model.blocks.slice(0,12).map(b=>({x:b.x,y:b.y,z:b.z,id:b.id??b.name,states:b.states??{}}))};
}
