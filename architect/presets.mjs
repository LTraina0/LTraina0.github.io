// The web adapter only exposes combinations that the build has validated.
export const pitches=[{id:'suave',value:.5,label:'Suave'},{id:'classica',value:.75,label:'Clássica'},{id:'ingreme',value:1,label:'Íngreme'}];
export const lifts=[{id:'reto',value:0,label:'Reto'},{id:'curvo',value:1,label:'Curvo'},{id:'elevado',value:2,label:'Elevado'}];
export const finishes=[{id:'slate',label:'Ardósia'},{id:'basalt',label:'Pedra-negra'}];
export const variantId=(pitch,lift,finish)=>[pitch,lift,finish].join('-');
