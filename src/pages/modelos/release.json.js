import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {studies,studyKey} from '../../../architect/v2/studies.mjs';
import {makeStudy} from '../../../architect/v2/laboratory.mjs';
import {packModel} from '../../../architect/v2/transport.mjs';
export function GET(){
  const models=Object.fromEntries(studies().map(p=>[studyKey(p),createHash('sha256').update(JSON.stringify(packModel(makeStudy(p)))).digest('hex')]));
  return Response.json({release:'0.3.3',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),modelHashAlgorithm:'sha256',models});
}
