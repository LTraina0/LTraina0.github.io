import {generateStern} from '../../../architect/v3/stern.mjs';
import {fjordStern} from '../../../architect/v3/stern-fjord.mjs';
import {packModel} from '../../../architect/v2/transport.mjs';
import {validateModel} from '../../../architect/v2/laboratory.mjs';
export function getStaticPaths(){return ['intact','broken','displaced'].map(phase=>({params:{phase}}));}
export function GET({params}){
  const model=generateStern({phase:params.phase,design:fjordStern});
  model.studyId='carpintaria-'+params.phase;
  const phaseLabel={intact:'íntegra',broken:'rompida',displaced:'painel deslocado'};
  model.studyLabel='Andorinha · revisão de carpintaria · '+phaseLabel[params.phase];
  validateModel(model);
  return Response.json(packModel(model));
}
