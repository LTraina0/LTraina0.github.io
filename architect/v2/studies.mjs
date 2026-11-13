// Public review combinations; the CLI also accepts continuous design parameters.
export const choices={
  study:{roof:'Coberturas',palette:'Gradientes',kit:'Componentes',facade:'Fachada integrada · 0.2.1',refined:'Fachada refinada · 0.2.2',shipwreck:'O Último Encalhe · 0.3',sections:'Anatomia naval · estudos de escala',stern:'Popa · painel desprendido',sternwork:'Andorinha · acabamentos navais'},
  phase:{intact:'Popa íntegra',broken:'Popa rompida',displaced:'Painel deslocado'},
  specimen:{hull:'A · Seção de casco',breach:'B · Ruptura estrutural',deck:'C · Convés tombado'},
  resolution:{compact:'Compacta · 1×',middle:'Intermediária · 1,5×',large:'Ampliada · 2×'},
  composition:{haven:'Abrigo da popa · principal',rift:'Fenda transversal',drift:'Deriva lateral'},
  condition:{weathered:'Madeira envelhecida',repaired:'Percurso reparado'},
  console:{balanced:'Consolo escalonado',fan:'Consolo em leque'},
  capital:{timber:'Capitel de madeira',anvil:'Bigorna · experimental'},
  surface:{mineral:'Mineral',patina:'Cobre e pátina'},
  edition:{A:'A · Tradicional',B:'B · Ornamental',C:'C · Experimental'},
  distribution:{contextual:'Arquitetônica',illustrative:'Régua vertical · comparação'},
  family:{gable:'Duas águas',hip:'Quatro águas',irimoya:'Irimoya',tiered:'Sobreposto'},
  curve:{straight:'Reta',swept:'Ascendente'},
  bracket:{single:'Simples',compound:'Composto'},
  detail:{plain:'Liso',carved:'Ornamentado'},
  finish:{original:'Paleta estrutural',mineral:'Mineral',ember:'Quente',tidal:'Fria',blossom:'Floral'},
  pattern:{linear:'Linear',steps:'Degraus',density:'Densidade',clusters:'Agrupamentos',mosaic:'Mosaico'},
  component:{colonnade:'Colunata',lantern:'Luminária',crest:'Acrotério',finial:'Pináculo'},
  variation:{mineral:'Mineral',timber:'Madeira'}
};
export const fields={roof:['family','curve','bracket','detail','finish'],palette:['finish','pattern'],kit:['component','variation'],facade:['edition','distribution'],refined:['console','capital','surface'],shipwreck:['composition','condition'],sections:['specimen','resolution'],stern:['phase'],sternwork:['phase']};
export const defaults={study:'roof',family:'irimoya',curve:'swept',bracket:'compound',detail:'carved',finish:'original',pattern:'density',component:'colonnade',variation:'mineral',edition:'B',distribution:'contextual',console:'balanced',capital:'timber',surface:'mineral',composition:'haven',condition:'weathered',specimen:'breach',resolution:'middle',phase:'intact'};
export function valuesFor(field,study){
  const values=Object.keys(choices[field]);
  return field==='finish' && study==='palette'?values.filter(s=>s!=='original'):values;
}
export function studyKey(p){return [p.study,...fields[p.study].map(k=>p[k])].join('-');}
export function studies(){
  const entries=[];
  for(const study of Object.keys(fields)){
    let set=[{study}];
    for(const field of fields[study]) set=set.flatMap(p=>valuesFor(field,study).map(v=>({...p,[field]:v})));
    entries.push(...set);
  }
  return entries;
}
