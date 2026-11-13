from pathlib import Path
import json,hashlib,collections
workspace=Path(__file__).resolve().parents[2]
exec((workspace/'scripts/decode-testes.py').read_text('utf-8').split('def decode():')[0])
root=Path(__file__).resolve().parent; src=workspace/'output/extracao-casa-bambu-2026-11-10/Casa de bambu e tres pontes - sem subterraneo e apoios.mcstructure'; raw=src.read_bytes(); n=NBT(raw).root(); m=json.loads((root/'public/model.json').read_text(encoding='utf-8')); a=n['structure']['block_indices']; pal=n['structure']['palette']['default']['block_palette']; sx,sy,sz=n['size']; ref=[]
for i,v in enumerate(a[0]):
 if v>=0:ref.append({'x':i//(sy*sz),'y':i//sz%sy,'z':i%sz,**pal[v]})
assert m['size']==[17,14,59] and m['blocks']==ref and len(ref)==772
assert len(pal)==80 and all(i==-1 for i in a[1]); assert len({(b['x'],b['y'],b['z']) for b in ref})==772
assert hashlib.sha256(raw).hexdigest()==m['sha256']=='cfe06902c84a68fb263aef2dbec9cfc6ed40536de737d0d9c3a3f5456c3217fd'
print('PASS: arquivo, dimensões, posições, IDs e estados; 772 células únicas; segunda camada vazia; hash.')
