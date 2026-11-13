// Coordinates denote cell centres in the integer lattice. The stern uses only half turns.
export function sourceCoordinates(b,stern){
  if(b.piece==='panel'&&stern.panelTransform.turns===2){
    const [dx,dy,dz]=stern.panelTransform.translation;
    return [dx-b.x,b.y-dy,dz-b.z];
  }
  return [b.x,b.y,b.z];
}
export function identifyCell(b,stern){
  const origin=sourceCoordinates(b,stern);
  return {...b,origin,sourceCell:stern.canonicalId+'/'+origin.join(',')};
}

