"""Selective documentation from the private official cache; never writes game files."""
from pathlib import Path
import json, subprocess
SITE=Path(__file__).resolve().parents[1]
CACHE=SITE.parents[1]/'.local'/'architect-palette'/'v1.26.60.5'
metadata=json.loads((CACHE/'metadata/vanilladata_modules/mojang-blocks.json').read_text(encoding='utf-8-sig'))
properties={p['name']:[v['value'] for v in p['values']] for p in metadata['block_properties']}
entries={p['name']:p for p in metadata['data_items']}
specs=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {navalRegistry} from './architect/v3/naval-blocks.mjs';console.log(JSON.stringify(navalRegistry))"],cwd=SITE))
evidence={}
for name,spec in specs.items():
    entry=entries[name]
    official={p['name']:properties[p['name']] for p in entry['properties']}
    assert set(official)==set(spec['states']), (name,'state keys',official,spec['states'])
    for state,domain in spec['states'].items():
        assert set(domain)==set(official[state]),(name,state,domain,official[state])
    evidence[name]={'label':spec['label'],'shape':spec['shape'],'officialStates':official,'textures':spec['texture'],
      'availability':'stable vanilla selection; no experimental families',
      'source':'https://github.com/Mojang/bedrock-samples/tree/v1.26.60.5',
      'inGameChecked':False,'geometryEvidence':'canonical native cells; special visual recipes documented in naval-assets.js; in-game pending'}
out={'version':'v1.26.60.5','installedPackageVersion':'1.26.6301.0','auditDate':'2026-11-11','inGameChecked':False,'entries':evidence}
(SITE/'architect/v3/bedrock-evidence.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'documented':len(evidence),'stateSchemasMatch':True}))
