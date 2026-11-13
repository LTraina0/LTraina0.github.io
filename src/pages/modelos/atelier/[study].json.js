import {studies,studyKey} from '../../../../architect/v2/studies.mjs';
import {makeStudy} from '../../../../architect/v2/laboratory.mjs';
import {packModel} from '../../../../architect/v2/transport.mjs';
export function getStaticPaths(){return studies().map(props=>({params:{study:studyKey(props)},props}));}
export function GET({props}){return Response.json(packModel(makeStudy(props)));}
