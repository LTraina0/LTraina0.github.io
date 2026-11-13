import {identifyCell} from '../v3/stern-space.mjs';
// The dictionary stores the full cell payload, including component metadata.
export function packModel(model) {
  const {blocks,...header}=model, dictionary=[],lookup=new Map(),cells=[];
  for(const {x,y,z,...block} of blocks){
    if(header.stern&&!header.stern.worldTransforms?.length){delete block.origin;delete block.sourceCell;}
    const signature=JSON.stringify(block);
    if(!lookup.has(signature)){lookup.set(signature,dictionary.length);dictionary.push(block);}
    cells.push(x,y,z,lookup.get(signature));
  }
  return {encoding:'buildsmine.cells/1',header,dictionary,cells};
}
export function unpackModel(packet) {
  if(packet.encoding!=='buildsmine.cells/1'||packet.cells.length%4) throw Error('Pacote de células inválido');
  const blocks=[];
  for(let i=0;i<packet.cells.length;i+=4){
    const [x,y,z,type]=packet.cells.slice(i,i+4), template=packet.dictionary[type];
    if(!template) throw Error('Tipo de célula inválido');
    const block={...template,x,y,z};
    blocks.push(packet.header.stern&&!block.origin?identifyCell(block,packet.header.stern):block);
  }
  return {...packet.header,blocks};
}
