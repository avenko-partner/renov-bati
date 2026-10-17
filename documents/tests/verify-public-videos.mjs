import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as cssTree from 'css-tree';
const root=process.argv[2]||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(root,'site-public');
const seo=process.argv[3]||path.join(root,'site-publication-verification');
const pages=['index.html','projets.html','informations.html'];
const files=base=>fs.readdirSync(base,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(base,x.name)).map(n=>x.name+'/'+n):[x.name]);
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
const read=(file,base=root)=>fs.readFileSync(path.join(base,file),'utf8');
const context={window:{}};vm.runInNewContext(read('portfolio-data.js'),context);vm.runInNewContext(read('content.js'),context);
const projects=context.window.RENOV_PORTFOLIO;
const publicFiles=files(output),publicSet=new Set(publicFiles);
check('La sortie Vercel ne contient que les trois pages, leurs ressources locales et les médias, sans documents privés',()=>{
 assert.equal(publicFiles.filter(x=>x.endsWith('.html')).length,3);
 for(const name of ['documents/','ressources/','LIRE-MOI','preparer-','.git/','node_modules/','projects-react.js','projects-loader.js'])assert.ok(!publicFiles.some(x=>x.startsWith(name)),name);
 for(const page of pages)assert.equal(read(page,output),read(page));
 assert.equal(publicFiles.filter(x=>x.endsWith('.js')).length,12);assert.equal(publicFiles.filter(x=>x.endsWith('.css')).length,10);
});
check('Les 278 médias et aperçus référencés sont présents, sans ancien aperçu inutilisé dans la collection',()=>{
 const wanted=new Set(projects.flatMap(p=>p.media.flatMap(m=>['src','thumb','poster','coverDetail'].map(key=>m[key]).filter(x=>x?.includes('/collection/')))).map(x=>x.slice(2)));
 assert.equal(wanted.size,278);assert.deepEqual(new Set(publicFiles.filter(x=>x.startsWith('assets/collection/'))),wanted);
 for(const name of wanted)assert.equal(Buffer.compare(fs.readFileSync(path.join(root,name)),fs.readFileSync(path.join(output,name))),0);
 assert.equal(projects.length,52);assert.equal(projects.filter(p=>p.category!=='inspirations').length,51);
});
check('Toutes les ressources HTML, CSS et données chargées sont présentes dans l’export public',()=>{
 const docs=new Map(pages.map(page=>[page,new JSDOM(read(page,output),{url:'https://renov-bati.test/'+page}).window.document]));
 const ids=new Set(projects.flatMap(p=>[p.id,...p.aliases]));
 for(const [page,d]of docs){
  const localIds=[...d.querySelectorAll('[id]')].map(x=>x.id);assert.equal(new Set(localIds).size,localIds.length);
  for(const el of d.querySelectorAll('[src],[href],[srcset]')){
   const refs=[el.getAttribute('src'),el.getAttribute('href'),...(el.getAttribute('srcset')||'').split(',').map(x=>x.trim().split(/\s/)[0])].filter(Boolean);
   for(const ref of refs){if(/^(?:https?:|mailto:|tel:|data:|blob:)/.test(ref))continue;const [name,hash]=ref.split('#');if(name)assert.ok(publicSet.has(path.normalize(name)),page+' '+ref);if(hash){const target=name?path.normalize(name):page;assert.ok(docs.get(target)?.getElementById(decodeURIComponent(hash))||target==='projets.html'&&ids.has(hash),page+' '+ref);}}
  }
  for(const image of d.querySelectorAll('img'))assert.ok(image.hasAttribute('alt'));
 }
 function inspect(data){if(Array.isArray(data))data.forEach(inspect);else if(data&&typeof data==='object')Object.values(data).forEach(inspect);else if(typeof data==='string'&&data.startsWith('./assets/'))assert.ok(publicSet.has(data.slice(2)),data);}
 inspect(projects);inspect(context.window.RENOV_DATA);
 for(const file of publicFiles.filter(x=>x.endsWith('.css'))){const css=read(file,output);cssTree.parse(css);for(const m of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))if(m[1].startsWith('./'))assert.ok(publicSet.has(m[1].slice(2)),m[1]);}
});
check('Les scripts sont locaux et compatibles avec une CSP sans JavaScript inline ni évaluation dynamique',()=>{
 for(const file of publicFiles.filter(x=>x.endsWith('.js'))){const text=read(file,output);new vm.Script(text);assert.ok(!/\b(?:eval\s*\(|new\s+Function\s*\(|fetch\s*\(|XMLHttpRequest|sendBeacon|document\.cookie|localStorage|sessionStorage)\b/.test(text),file);}
 for(const page of pages){const d=new JSDOM(read(page,output)).window.document;for(const script of d.querySelectorAll('script'))assert.ok(script.getAttribute('src')?.startsWith('./')||script.type==='application/ld+json');for(const el of d.querySelectorAll('*'))for(const a of el.attributes){assert.ok(!/^on[a-z]+/.test(a.name),a.name);if(a.name==='href')assert.ok(!/^javascript:/i.test(a.value));}for(const link of d.querySelectorAll('a[target="_blank"]'))assert.ok(link.relList.contains('noopener')&&link.relList.contains('noreferrer'));assert.equal(d.querySelectorAll('iframe').length,0);}
});
check('Vercel : sortie publique dédiée, CSP, protection iframe, MIME, permissions et politique de référent configurés',()=>{
 const config=JSON.parse(read('vercel.json'));assert.equal(config.framework,null);assert.equal(config.outputDirectory,'site-public');assert.equal(config.buildCommand,'node preparer-site-public.mjs');
 const global=config.headers.find(x=>x.source==='/(.*)');const headers=Object.fromEntries(global.headers.map(x=>[x.key.toLowerCase(),x.value]));assert.equal(headers['x-content-type-options'],'nosniff');assert.equal(headers['x-frame-options'],'DENY');assert.equal(headers['referrer-policy'],'strict-origin-when-cross-origin');assert.ok(headers['permissions-policy'].includes('microphone=()'));
 for(const directive of ["default-src 'self'","script-src 'self'","connect-src 'none'","object-src 'none'","frame-ancestors 'none'","form-action 'none'"])assert.ok(headers['content-security-policy'].split('; ').includes(directive));assert.ok(!headers['content-security-policy'].includes('unsafe-eval'));assert.ok(config.headers.some(x=>x.source==='/assets/collection/:path*'&&x.headers.some(h=>h.value.includes('immutable'))));
 for(const value of Object.values(headers))assert.ok(!/[\r\n]/.test(value));
});
check('L’export SEO reste autonome : URLs du domaine de test, sitemap limité aux pages indexables et aucun générateur absent',()=>{
 assert.ok(!files(seo).some(x=>/^(?:documents|ressources)\//.test(x)));const config=JSON.parse(read('vercel.json',seo));assert.equal(config.buildCommand,undefined);assert.equal(config.outputDirectory,undefined);assert.ok(config.headers.some(x=>x.source==='/(.*)'));
 for(const page of pages){const d=new JSDOM(read(page,seo)).window.document;assert.equal(d.querySelector('link[rel="canonical"]').href,'https://verification-renov-bati.example/'+(page==='index.html'?'':page));assert.ok(!read(page).includes('verification-renov-bati.example'));for(const script of d.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(script.textContent);}
 const sitemap=read('sitemap.xml',seo);assert.ok(sitemap.includes('https://verification-renov-bati.example/projets.html'));assert.ok(!sitemap.includes('informations.html'));assert.ok(read('robots.txt',seo).includes('Sitemap: https://verification-renov-bati.example/sitemap.xml'));
});
const report={status:'PASS',date:'2026-10-17',checks:checks.length,coverage:checks,public_file_count:publicFiles.length,public_bytes:publicFiles.reduce((sum,file)=>sum+fs.statSync(path.join(output,file)).size,0),collection_assets:278,limits:['Contrôle statique de la configuration CSP et des références ; pas d’exécution de cette politique dans un navigateur.','En-têtes non vérifiés sur une réponse HTTP Vercel : aucun déploiement effectué.','Aucun test d’intrusion ni vérification des accès au compte Vercel ou à la messagerie.']};fs.writeFileSync(path.join(root,'documents/verification-export-videos-20261017.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
