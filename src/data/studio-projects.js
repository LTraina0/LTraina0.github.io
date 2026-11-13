export const andorinhaUrl='/andorinha/';
export const rigReviewUrl='/andorinha/aparelho/';
export const cabinReviewUrl='/andorinha/cabine/';
export const hullReviewUrl='/andorinha/costado/';
export const studioProjects=[
  {id:'andorinha-ultimo-encalhe',label:'Andorinha — O Último Encalhe',href:andorinhaUrl},
  {id:'bamboo',label:'Casa de Bambu'},
  {id:'bamboo-tower',label:'Casa de Bambu · estudo da torre'},
  {id:'portal-1.0.3',label:'Portal Escarlate · 1.0.3 · Fachada original'},
  {id:'portal-2.3.0',label:'Portal Escarlate · 2.3.0 · Subterrâneo'},
  {id:'portal-2.4.0',label:'Portal Escarlate · 2.4.0 · Pátio completo'},
  {id:'telhado-oriental',label:'Telhado oriental · Laboratório'},
  {id:'atelier-02',label:'Ateliê de arquitetura · 0.2'},
  {id:'fachada-021',label:'Fachada integrada · 0.2.1'},
  {id:'fachada-022',label:'Fachada refinada · 0.2.2',href:'/?build=fachada-022&study=refined'}
].map(project=>({...project,href:project.href||'/?build='+project.id}));
export const navalArchive=[
  ['Costado C1/C2 · Reprovados','/andorinha/costado/'],
  ['Naufrágio 0.3','/?build=naufragio-03'],
  ['Anatomia naval','/?build=estudos-navais'],
  ['Popa e painel','/?build=popa-painel'],
  ['Acabamentos','/?build=popa-refinada'],
  ['Carpintaria','/?build=andorinha-carpintaria'],
  ['Creeping Winter','/?build=andorinha-polar'],
  ['Escotilha','/escotilha/']
];
