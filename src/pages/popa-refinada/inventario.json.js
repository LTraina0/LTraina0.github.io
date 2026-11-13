import {makeStudy} from '../../../architect/v2/laboratory.mjs';
import {inspectSternMaterials} from '../../../architect/v3/stern-inventory.mjs';
export function GET(){
  return Response.json(Object.fromEntries(['stern','sternwork'].map(study=>[study,Object.fromEntries(['intact','broken','displaced'].map(phase=>[phase,inspectSternMaterials(makeStudy({study,phase}))]))])));
}
