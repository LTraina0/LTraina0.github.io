import {auditStern} from '../../../architect/v3/stern-audit.mjs';
import {makeStudy} from '../../../architect/v2/laboratory.mjs';
export function GET(){return Response.json(auditStern(['intact','broken','displaced'].map(phase=>makeStudy({study:'sternwork',phase}))));}
