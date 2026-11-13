import {auditStern} from '../../../architect/v3/stern-audit.mjs';
export function GET(){return Response.json(auditStern());}
