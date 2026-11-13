import {buildEncalhe,catalog} from '../../../architect/v3/encalhe.mjs';
import {packModel} from '../../../architect/v2/transport.mjs';
export function GET(){const m=buildEncalhe();return Response.json({model:packModel(m),catalog:Object.fromEntries(Object.keys(m.materials).map(id=>[id,catalog[id]]))})}
