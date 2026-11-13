import {generateRoof} from './roof.mjs';
import {transformModel} from './model.mjs';
import {validate} from './validate.mjs';
import {readFile} from 'node:fs/promises';
import {parseArgs} from 'node:util';

// stdout is a canonical JSON stream; the CLI does not access a world or installation.
try{
  const {values,positionals}=parseArgs({allowPositionals:true,options:{
    pitch:{type:'string'},lift:{type:'string'},width:{type:'string'},length:{type:'string'},
    palette:{type:'string'},rotate:{type:'string'},'mirror-x':{type:'boolean'},'mirror-z':{type:'boolean'}
  }});
  if(positionals[0]==='validate' && positionals.length===2){
    console.log(JSON.stringify(validate(JSON.parse(await readFile(positionals[1],'utf8')))));
  } else if(positionals[0]==='roof' && positionals.length===1){
    const p={};
    for(const k of ['pitch','lift']) if(values[k]!==undefined) p[k]=Number(values[k]);
    if(values.palette!==undefined) p.palette=values.palette;
    for(const [k,half] of [['width','halfWidth'],['length','halfLength']]) {
      if(values[k]!==undefined) p[half]=(Number(values[k])-1)/2;
    }
    let model=generateRoof(p);
    if(values.rotate!==undefined||values['mirror-x']||values['mirror-z']){
      const turns=Number(values.rotate??0)/90;
      model=transformModel(model,{turns,mirrorX:!!values['mirror-x'],mirrorZ:!!values['mirror-z']});
    }
    validate(model);
    console.log(JSON.stringify(model));
  } else throw Error('Uso: node architect/cli.mjs roof [--pitch 0.75 --lift 1 --width 21 --length 29 --palette slate --rotate 90 --mirror-x] | validate arquivo.json');
}catch(error){console.error(error.message);process.exitCode=1;}

