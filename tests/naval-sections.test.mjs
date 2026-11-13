import assert from 'node:assert/strict';
import test from 'node:test';
import {generateSectionStudy,resolutions} from '../architect/v3/section-studies.mjs';
import {catalog,validateModel} from '../architect/v2/laboratory.mjs';
import {kitVolume,surfaceContact} from '../architect/v2/kit-shapes.mjs';

for(const specimen of ['hull','breach','deck'])test('Uma peça conectada após a fratura · '+specimen,()=>{
  for(const resolution of Object.keys(resolutions)){
    const model=generateSectionStudy({specimen,resolution});
    validateModel(model);
    const coord=(x,y,z)=>[x,y,z].join(',');
    const cells=new Map(model.blocks.map(b=>[coord(b.x,b.y,b.z),b]));
    const volume=b=>kitVolume(catalog[b.id].shape,b.states);
    const stack=[model.blocks[0]], visited=new Set(stack);
    while(stack.length){
      const b=stack.pop();
      for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
        const n=cells.get(coord(b.x+d[0],b.y+d[1],b.z+d[2]));
        if(n && !visited.has(n) && surfaceContact(volume(b),volume(n),d)){
          visited.add(n);stack.push(n);
        }
      }
    }
    assert.equal(visited.size,cells.size,'fragmento solto em '+resolution);
    if(specimen==='breach'){
      const maxZ=module=>Math.max(...model.blocks.filter(b=>b.module===module).map(b=>b.z));
      assert.ok(maxZ('ribs')>maxZ('deck'),'o cavername deve prolongar a ferida além do convés');
      assert.ok(model.blocks.some(b=>b.appearance.ruleId==='exposed-strake-end'));
    }
    if(specimen==='deck'){
      const bays=model.blocks.filter(b=>b.module==='cross');
      assert.ok(bays.some(b=>b.states.pillar_axis==='y'),'costela presa ao vau');
      assert.ok(model.blocks.filter(b=>b.module==='planks').some(b=>b.id.endsWith('stairs')));
    }
  }
});
