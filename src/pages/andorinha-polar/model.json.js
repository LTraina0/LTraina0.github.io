import {generatePolarScene} from '../../../architect/v3/polar.mjs';
import {packModel} from '../../../architect/v2/transport.mjs';

export function GET(){
  return Response.json(packModel(generatePolarScene()));
}
