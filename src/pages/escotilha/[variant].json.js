import {generateStern} from '../../../architect/v3/stern.mjs';
import {hatchDesign} from '../../../architect/v3/hatch-atelier.mjs';
import {fjordStern} from '../../../architect/v3/stern-fjord.mjs';
import {packModel} from '../../../architect/v2/transport.mjs';
import {validateModel} from '../../../architect/v2/laboratory.mjs';
export function getStaticPaths(){return ['original','claraboia','portico'].map(variant=>({params:{variant}}));}
export function GET({params:{variant}}){
  const model=generateStern({phase:'displaced',design:variant==='original'?fjordStern:hatchDesign(variant)});
  validateModel(model);
  return Response.json(packModel(model));
}
