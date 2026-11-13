from pathlib import Path
import json, hashlib, collections
workspace=Path(__file__).resolve().parents[2]
exec((workspace/'scripts/decode-testes.py').read_text('utf-8').split('def decode():')[0])
src=workspace/'output/extracao-casa-bambu-2026-11-10/Casa de bambu e tres pontes - sem subterraneo e apoios.mcstructure'
dest=Path(__file__).resolve().parent
n=NBT(src.read_bytes()).root(); size=n['size']; s=n['structure']; p=s['palette']['default']['block_palette']; indices=s['block_indices'][0]; blocks=[]
for i,v in enumerate(indices):
 if v<0: continue
 x=i//(size[1]*size[2]); y=i//size[2]%size[1]; z=i%size[2]; blocks.append({'x':x,'y':y,'z':z,**p[v]})
assert size==[17,14,59] and len(blocks)==772 and len(p)==80
out={'size':size,'blocks':blocks,'sha256':hashlib.sha256(src.read_bytes()).hexdigest()}
(dest/'public').mkdir(exist_ok=True); (dest/'docs').mkdir(exist_ok=True)
(dest/'public/model.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
counts=collections.Counter(b['name'] for b in blocks)
states={name: sorted({json.dumps(b['states'],sort_keys=True) for b in blocks if b['name']==name}) for name in counts}
(dest/'docs/paleta-extraida.json').write_text(json.dumps({'size':size,'count':len(blocks),'counts':counts,'states':states,'sha256':out['sha256']},ensure_ascii=False,indent=2),encoding='utf-8')
print('size',size,'count',len(blocks),'palette',len(p),'types',len(counts));print(json.dumps(counts,ensure_ascii=False,indent=2))
