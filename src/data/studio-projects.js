export const studioProjects=[
  {id:'bamboo',label:'Casa de Bambu'},
  {id:'bamboo-tower',label:'Casa de Bambu · estudo da torre'},
  {id:'andorinha-v1',label:'Andorinha · V1'},
  {id:'andorinha-v1-teste-a',label:'Andorinha · V1 · Teste A (Velas Orgânicas)'},
  {id:'andorinha-v1-teste-b',label:'Andorinha · V1 · Teste B (Véus Echelman)'},
  {id:'andorinha-v3',label:'Andorinha · V3'},
  {id:'andorinha-estudos',label:'Andorinha · Estudos de galeria e cabine'},
  {id:'portal-1.0.3',label:'Portal Escarlate · 1.0.3 · Fachada original'},
  {id:'portal-2.3.0',label:'Portal Escarlate · 2.3.0 · Subterrâneo'},
  {id:'portal-2.4.0',label:'Portal Escarlate · 2.4.0 · Pátio completo'},
  {id:'telhado-oriental',label:'Telhado oriental · Laboratório'},
  {id:'atelier-02',label:'Ateliê de arquitetura · 0.2'},
  {id:'fachada-021',label:'Fachada integrada · 0.2.1'},
 {id:'fachada-022',label:'Fachada refinada · 0.2.2',href:'/?build=fachada-022&study=refined'},
 {id:'farm-musgo-v1',label:'Farm de Musgo · V1 (Base 7×7)',category:'farms'},
 {id:'farm-musgo',label:'Farm de Musgo · v3 (Gerador de Pedra · Bedrock)',category:'farms'}
].map(project=>({...project,category:project.category||'builds',href:project.href||'/?build='+project.id}));
