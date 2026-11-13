import {inspectionProjects,publicStudies} from '../../../architect/inspection.mjs';
export function GET(){return Response.json({schema:'buildsmine.inspection/1',readOnly:true,
  projects:inspectionProjects.map(({load,...p})=>({...p,html:'/inspecao/'+p.id,summary:'/inspecao/dados/'+p.id+'.json'})),
  studies:publicStudies(),release:'/modelos/release.json',
  encoding:{name:'buildsmine.cells/1',description:'header contains model metadata; cells is a flat array of x,y,z,dictionaryIndex quadruples; dictionary holds block id, states and module metadata. Legacy datasets use blocks directly.'}});}
