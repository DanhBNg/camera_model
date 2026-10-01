import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base='src/demos/atelier-camera/';
const [result,html,css]=await Promise.all([
  build({entryPoints:[base+'viewer.js'],bundle:true,minify:true,format:'iife',write:false}),
  readFile(base+'index.html','utf8'),readFile(base+'style.css','utf8'),
]);
const output=html.replace('/* INLINE_CSS */',()=>css).replace('/* INLINE_JS */',()=>result.outputFiles[0].text.replaceAll('</script','<\\/script'));
await mkdir('dist',{recursive:true});
await Promise.all([writeFile('index.html',output),writeFile('dist/index.html',output)]);
console.log(`index.html + dist/index.html: ${(Buffer.byteLength(output)/1024/1024).toFixed(2)} MiB; all scripts and textures local/embedded.`);
