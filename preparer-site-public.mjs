#!/usr/bin/env node
// Prépare uniquement les fichiers publics. Aucun déploiement ni dépendance.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {seoSettings,prepareSeo} from './preparer-seo.mjs';

const source=path.dirname(fileURLToPath(import.meta.url));
const output=path.join(source,'site-public');
const seo=seoSettings(process.env);
const marker='.renov-public-build';
const pages=['index.html','projets.html','informations.html'];
const files=new Set(pages);
const localFile=ref=>{
  if(!ref.startsWith('./'))throw new Error(`Ressource non locale : ${ref}`);
  const name=ref.slice(2);
  if(name.includes('/')||!/^[-a-z0-9]+\.(?:css|js)$/.test(name))throw new Error(`Ressource non autorisée : ${ref}`);
  return name;
};
for(const page of pages){
  const html=fs.readFileSync(path.join(source,page),'utf8');
  for(const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi))files.add(localFile(match[1]));
  for(const match of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi))files.add(localFile(match[1]));
}
for(const name of ['robots.txt','sitemap.xml'])if(fs.existsSync(path.join(source,name)))files.add(name);
if(fs.existsSync(path.join(source,'projects-react.js.LEGAL.txt')))files.add('projects-react.js.LEGAL.txt');

const manifest=fs.readFileSync(path.join(source,'portfolio-data.js'),'utf8');
const projects=JSON.parse(manifest.replace(/^window\.RENOV_PORTFOLIO\s*=\s*/,'').trim().replace(/;$/,''));
const collection=new Set(projects.flatMap(p=>p.media.flatMap(m=>['src','thumb','poster','coverDetail'].map(k=>m[k]).filter(Boolean))).filter(p=>p.startsWith('./assets/collection/')).map(p=>p.slice(2)));
const allowedAsset=/\.(?:webp|avif|jpe?g|png|svg|mp4|woff2?|ttf|otf|txt)$/i;
function walk(directory){
  for(const item of fs.readdirSync(directory,{withFileTypes:true})){
    if(item.isSymbolicLink())throw new Error('Les liens symboliques ne sont pas publiés.');
    const absolute=path.join(directory,item.name),relative=path.relative(source,absolute).split(path.sep).join('/');
    if(item.isDirectory())walk(absolute);
    else if(item.isFile()&&allowedAsset.test(item.name)&&(!relative.startsWith('assets/collection/')||collection.has(relative)))files.add(relative);
  }
}
walk(path.join(source,'assets'));
for(const file of collection)if(!files.has(file))throw new Error(`Média manquant : ${file}`);
// Valider toutes les entrées avant de remplacer une précédente sortie générée.
for(const file of files){
  const absolute=path.resolve(source,file);
  if(!absolute.startsWith(source+path.sep)||!fs.lstatSync(absolute).isFile()||fs.lstatSync(absolute).isSymbolicLink())throw new Error(`Fichier public invalide : ${file}`);
}
if(fs.existsSync(output)){
  if(fs.lstatSync(output).isSymbolicLink()||!fs.existsSync(path.join(output,marker)))throw new Error('Le dossier site-public existe et ne provient pas de ce générateur. Il est conservé.');
  fs.rmSync(output,{recursive:true,force:true});
}
fs.mkdirSync(output,{recursive:true});
for(const file of files){
  const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(source,file),target);
}
prepareSeo(output,pages,seo);
fs.writeFileSync(path.join(output,marker),'Sortie publique générée. Ne pas modifier ici.\n');
let bytes=0,count=0;
function measure(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())measure(file);else if(item.name!==marker){count++;bytes+=fs.statSync(file).size;}}}
measure(output);
console.log(`${pages.length} pages, ${count} fichiers publics, ${collection.size} médias et aperçus de collection, ${(bytes/1e6).toFixed(2)} Mo. Dossier : ${output}. Aucune publication effectuée.`);
console.log(seo.origin?`URL SEO : ${seo.origin}`:'Domaine absent : URL relatives conservées. SITE_URL pourra être renseignée dans Vercel.');
if(seo.preview)console.log('Prévisualisation : robots.txt bloque l’exploration et les trois pages portent noindex.');
