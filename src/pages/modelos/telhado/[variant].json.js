import {generateRoof} from '../../../../architect/roof.mjs';
import {validate} from '../../../../architect/validate.mjs';
import {pitches,lifts,finishes,variantId} from '../../../../architect/presets.mjs';

export function getStaticPaths(){
  return pitches.flatMap(pitch=>lifts.flatMap(lift=>finishes.map(finish=>({
    params:{variant:variantId(pitch.id,lift.id,finish.id)},
    props:{pitch:pitch.value,lift:lift.value,palette:finish.id}
  }))));
}

export function GET({props}){
  const model=generateRoof(props);
  validate(model);
  return new Response(JSON.stringify(model),{headers:{'Content-Type':'application/json'}});
}
