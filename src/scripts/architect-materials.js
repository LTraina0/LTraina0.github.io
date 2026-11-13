// Reads recommendations computed by the offline agent for this Bedrock catalog.
export function materialDiscovery(catalog){
  const details=document.createElement('details');details.className='origin-settings lab-discovery';
  const summary=document.createElement('summary');summary.textContent='Explorar combinações';details.append(summary);
  const select=(label,id)=>{
    const field=document.createElement('label'),input=document.createElement('select');
    input.id=id;field.append(label+' ',input);details.append(field);return input;
  };
  const seed=select('Bloco inicial','material-seed'),role=select('Aplicação','material-role');
  for(const [id,name] of Object.entries({wall:'Parede',roof:'Cobertura',foundation:'Fundação',structure:'Estrutura',ornament:'Ornamento'}))
    role.add(new Option(name,id));
  const result=document.createElement('ul');result.setAttribute('aria-live','polite');details.append(result);
  document.querySelector('.origin-settings').before(details);
  const cache=new Map();
  let family='mineral',request=0;
  async function refresh(){
    if(!details.open||!seed.value)return;
    const ticket=++request,id=seed.value;
    try{
      if(!cache.has(id)) cache.set(id,fetch('/modelos/materiais/'+encodeURIComponent(id.split(':')[1])+'.json').then(r=>{
        if(!r.ok)throw Error('HTTP '+r.status);return r.json();
      }));
      const sets=await cache.get(id);if(ticket!==request)return;
      result.replaceChildren(...sets[family][role.value].map(item=>{
        const li=document.createElement('li'),name=document.createElement('strong');
        name.textContent=item.label;li.title=item.id;li.append(name,' · '+item.reason);return li;
      }));
    }catch{cache.delete(id);if(ticket===request)result.textContent='Falha ao carregar. Reabra as combinações para tentar novamente.';}
  }
  seed.onchange=role.onchange=details.ontoggle=refresh;
  return function update(model,finish){
    family=finish==='original'?'mineral':finish;
    const prev=seed.value,ids=Object.keys(model.materials).filter(id=>catalog[id].measured);
    seed.replaceChildren(...ids.map(id=>new Option(catalog[id].label,id)));
    if(ids.includes(prev))seed.value=prev;details.hidden=!ids.length;
    if(!ids.length){request++;result.replaceChildren();}else refresh();
  };
}
