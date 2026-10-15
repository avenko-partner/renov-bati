import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const folder=fileURLToPath(new URL('.',import.meta.url));
const base=fileURLToPath(new URL('../../',import.meta.url));
const publicRoot=existsSync(base+'dist/index.html')?base+'dist/':base;
await build({entryPoints:[folder+'viewer.jsx'],outfile:publicRoot+'projects-react.js',bundle:true,minify:true,format:'iife',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'},legalComments:'external'});
