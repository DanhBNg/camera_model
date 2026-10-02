import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const blender=process.env.BLENDER_BIN || 'C:/Users/AMLT/Desktop/explode/tools/blender-5.2.2-windows-x64/blender.exe';
mkdirSync('artifacts/blender',{recursive:true});
for(const stage of ['build','verify']){
 const result=spawnSync(blender,['--background','--factory-startup','--disable-autoexec','--python-exit-code','3','--python',`blender/camera/${stage}.py`],{encoding:'utf8',maxBuffer:32*1024*1024});
 const log=(result.stdout||'')+(result.stderr||'');writeFileSync(`artifacts/blender/${stage}.log`,log);
 const markers=log.split(/\r?\n/).filter(l=>/^AGENT_(OK|FAIL)\b/.test(l));
 if(result.error||result.status!==0||!markers.at(-1)?.startsWith('AGENT_OK ')){
  console.error(result.error||log.slice(-9000));process.exit(1);
 }
 console.log(markers.at(-1));
}
