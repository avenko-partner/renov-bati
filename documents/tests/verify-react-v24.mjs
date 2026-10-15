import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
import * as cssTree from 'css-tree';
import {styleEngine} from './renov-css-cascade-v16.mjs';
const root=process.argv[2]||'/workspace/sites/renov-bati-premium/dist';
const baseline=process.argv[3]||'/workspace/scratch/c0b4d42c8e27/renov-bati-baseline-v15/renov-bati-premium';
const reportPath=process.argv[4]||path.join(root,'../documents/verification-transition-responsive-v18.json');
const read=(file,base=root)=>fs.readFileSync(path.join(base,file),'utf8');
const checks=[],measurements={};
async function check(name,fn){await fn();checks.push(name);}
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
function scene({base=root,scripts=['content.js','preferences.js','intro.js','app.js','craft.js','hero-gallery.js'],preloader=true,animation=true,reduced=false,width=1440,height=900,segments=false,pane=540,resources=true,autoImages=true,history='navigate',hash='',noIdle=false}={}){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(read('index.html',base),{url:'https://renov-bati.test/index.html'+hash,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,d=w.document,$=s=>d.querySelector(s),timers=new Map(),raf=new Map(),idle=new Map(),animations=[],images=[],io=[],ro=[],media=new Map(),events=[];
 let clock=0,serial=0,hidden=false,readingWidth=segments?pane:width,heroResolve,geometryReads=0,scrollHeight=14000;
 w.innerWidth=width;w.innerHeight=height;w.scrollY=0;Object.defineProperty(w.performance,'now',{value:()=>clock});w.performance.getEntriesByType=()=>[{type:history}];
 w.matchMedia=q=>{if(!media.has(q))media.set(q,{matches:q.includes('reduced-motion')?reduced:q.includes('viewport-segments')?segments:false,callbacks:[],addEventListener(t,fn){this.callbacks.push(fn);},removeEventListener(t,fn){this.callbacks=this.callbacks.filter(f=>f!==fn);}});return media.get(q);};
 const later=(fn,ms=0,kind='timeout')=>{const id=++serial;timers.set(id,{at:clock+Number(ms),fn,kind});return id;};
 w.setTimeout=(fn,ms)=>later(fn,ms);w.clearTimeout=id=>timers.delete(id);w.requestAnimationFrame=fn=>{const id=++serial;raf.set(id,fn);return id;};w.cancelAnimationFrame=id=>raf.delete(id);
 if(!noIdle){w.requestIdleCallback=(fn,{timeout=1000}={})=>{const id=++serial,deadline=later(()=>{idle.delete(id);fn({didTimeout:true});},timeout,'idle');idle.set(id,{fn,deadline});return id;};w.cancelIdleCallback=id=>{timers.delete(idle.get(id)?.deadline);idle.delete(id);};}
 Object.defineProperty(d,'hidden',{get:()=>hidden});Object.defineProperty(d.documentElement,'scrollHeight',{get:()=>{geometryReads++;return scrollHeight;}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:readingWidth,bottom:800,width:readingWidth,height:800};};
 for(const [i,a]of [...d.querySelectorAll('.main-nav a')].entries())$(a.hash).getBoundingClientRect=()=>{geometryReads++;return {left:0,top:1200+i*2500-w.scrollY,width:readingWidth,height:1000};};
 Object.defineProperty($('.hero-stage'),'clientWidth',{get:()=>readingWidth});Object.defineProperty($('#logo-marquee'),'clientWidth',{get:()=>readingWidth});$('#logo-group').getBoundingClientRect=()=>({width:$('#logo-group').children.length*248});$('#compare-stage').getBoundingClientRect=()=>({left:40,top:0,width:600,height:800});
 w.ResizeObserver=class{constructor(cb){this.cb=cb;this.targets=new Set();ro.push(this);}observe(el){this.targets.add(el);}disconnect(){this.targets.clear();}};
 w.IntersectionObserver=class{constructor(cb,options){this.cb=cb;this.options=options;this.targets=new Set();io.push(this);}observe(el){this.targets.add(el);}unobserve(el){this.targets.delete(el);}disconnect(){this.targets.clear();}};
 class Photo{
  constructor(){this.complete=false;this.naturalWidth=0;this.waiters=[];this.hold=false;this.decodes=0;images.push(this);}
  set src(value){this._src=value;if(autoImages)queueMicrotask(()=>this.load());}get src(){return this._src;}
  load(){this.complete=true;this.naturalWidth=1000;this.onload?.();}fail(){this.onerror?.();}
  decode(){this.decodes++;return this.hold?new Promise(resolve=>this.waiters.push(resolve)):Promise.resolve();}
  release(){this.waiters.splice(0).forEach(fn=>fn());}removeAttribute(name){delete this[name];}
 }
 w.Image=Photo;w.HTMLImageElement.prototype.decode=function(){if(this.id==='hero-image'&&!resources)return new Promise(resolve=>{heroResolve=resolve;});return Promise.resolve();};d.fonts={ready:Promise.resolve()};
 if(animation)w.Element.prototype.animate=function(frames,options){let resolve,reject;const finished=new Promise((a,b)=>{resolve=a;reject=b;});finished.catch(()=>{});const a={target:this,frames,options,start:clock,state:'running',finished,onfinish:null,oncancel:null};const end=later(()=>{a.state='finished';a.onfinish?.();resolve();},(options.duration||0)+(options.delay||0),'animation');a.cancel=()=>{if(a.state==='cancelled')return;timers.delete(end);a.state='cancelled';a.oncancel?.();reject(new Error('cancelled'));};animations.push(a);return a;};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('button')?.focus();};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.Blob=Blob;w.URL.createObjectURL=()=> 'blob:draft';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){if(this.download)return;const e=new w.MouseEvent('click',{bubbles:true,cancelable:true});e.preventDefault();this.dispatchEvent(e);};
 d.addEventListener('renov-intro-leaving',()=>events.push({event:'leaving',at:clock,overlayHidden:$('#brand-intro').hidden}));d.addEventListener('renov-intro-complete',()=>events.push({event:'complete',at:clock}));
 if(preloader)w.eval(read('intro-boot.js',base));for(const file of scripts)w.eval(read(file,base));
 const s={dom,w,d,$,timers,raf,idle,animations,images,io,ro,media,events,errors,base,
  get now(){return clock;},get reads(){return geometryReads;},set pane(v){readingWidth=v;},set pageHeight(v){scrollHeight=v;},get active(){return animations.filter(x=>x.state==='running');},
  async settle(){await flush();await this.frame();},
  async frame(){const queue=[...raf];raf.clear();queue.forEach(([,fn])=>fn(clock));await flush();},
  async advance(ms){const target=clock+ms;let loops=0;while(true){const next=[...timers].filter(([,x])=>x.at<=target).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!next)break;if(++loops>10000)throw new Error('Runaway');clock=next[1].at;timers.delete(next[0]);next[1].fn();await flush();}clock=target;await flush();},
  async runIdle(){for(const [id,job]of [...idle]){idle.delete(id);timers.delete(job.deadline);job.fn({didTimeout:false});}await flush();},
  async click(selector){$(selector).click();await flush();},
  async key(selector,key,more={}){const e=new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...more});$(selector).dispatchEvent(e);await flush();return e;},
  async scroll(y){w.scrollY=y;w.dispatchEvent(new w.Event('scroll'));await this.frame();},
  async resized(){w.dispatchEvent(new w.Event('resize'));await this.frame();},
  async visible(value){hidden=!value;d.dispatchEvent(new w.Event('visibilitychange'));await flush();},
  async intersect(selector,value){const target=$(selector);for(const ob of io)if(ob.targets.has(target))ob.cb([{target,isIntersecting:value}]);await flush();},
  async motion(value){const m=media.get('(prefers-reduced-motion: reduce)');m.matches=value;for(const fn of m.callbacks.slice())fn();await flush();},
  releaseHero(){heroResolve?.();},
  css(selector){return styleEngine(base,d,{w:w.innerWidth,h:w.innerHeight,hs:segments?2:1,paneW:readingWidth,fine:true,reduced:media.get('(prefers-reduced-motion: reduce)')?.matches}).selected(selector);},
  opacity(selector){const el=$(selector),a=animations.findLast(x=>x.target===el&&x.state==='running'&&x.frames[0].opacity!==undefined);if(a){const progress=Math.max(0,Math.min(1,(clock-a.start-(a.options.delay||0))/a.options.duration));return a.frames[0].opacity+(a.frames[1].opacity-a.frames[0].opacity)*progress;}return Number(this.css(selector).opacity??1);},
  fraction(){const fill=$('[aria-pressed="true"] .hero-view-progress'),a=animations.findLast(x=>x.target===fill&&x.state==='running');if(a){const from=Number(a.frames[0].transform.match(/scaleX\(([^)]+)\)/)[1]);return from+(1-from)*(clock-a.start)/a.options.duration;}return Number(fill.style.transform.match(/scaleX\(([^)]+)\)/)?.[1]||0);},
  close(){dom.window.close();}
 };return s;
}

const results=[];
async function run(name,fn){await fn();results.push(name);}
const options={preloader:false,scripts:['content.js','preferences.js','app.js']};
async function flushReact(s){await flush();await s.advance(0);await flush();}
async function reactScene(extra={}){const s=scene({...options,...extra});await s.settle();s.w.eval(read('projects-react.js'));await flushReact(s);for(const key of ['click','key','motion','resized']){const original=s[key].bind(s);s[key]=async(...args)=>{const value=await original(...args);await flushReact(s);return value;};}return s;}
await run('Vrai bundle React : ouverture, décodage, miniatures, navigation, fermeture et focus',async()=>{
 const s=await reactScene();const link=s.$('[data-project="cuisine"]');s.w.RENOV_PROJECTS.open('cuisine',link);await flushReact(s);assert.equal(s.$('#project-dialog').open,true);assert.ok(s.$('#project-dialog-title').textContent.includes('Cuisine'));assert.equal(s.$('.project-react-stage').getAttribute('aria-busy'),'false');assert.equal(s.$('#project-dialog-image').style.visibility,'visible');assert.equal(s.$('#project-dialog-comparison'),null);assert.equal(s.$('.project-thumbnails').children.length,2);
 await s.click('#project-photo-next');assert.ok(s.$('#project-dialog-image').src.includes('cuisine-detail'));assert.equal(s.$('#project-photo-count').textContent,'02 / 02');assert.ok(s.$('.project-react-previous'));await s.advance(800);assert.equal(s.$('.project-react-previous'),null);await s.click('[data-dialog-close]');await s.advance(300);assert.equal(s.$('#project-dialog').open,false);assert.equal(s.d.activeElement,link);assert.equal(s.d.body.classList.contains('dialog-open'),false);assert.equal(s.errors.length,0);s.close();
});
await run('Dernière demande gagnante et photo gardée pendant un décodage lent',async()=>{
 const s=await reactScene({autoImages:false});s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flushReact(s);assert.equal(s.$('#project-dialog-image').style.visibility,'hidden');s.images[0].load();await flushReact(s);assert.equal(s.$('#project-dialog-image').style.visibility,'visible');await s.click('#project-photo-next');const pending=s.images[1];pending.hold=true;pending.load();await flushReact(s);assert.ok(s.$('#project-dialog-image').src.includes('cuisine-lumiere'));await s.click('#project-photo-prev');pending.release();await flushReact(s);assert.ok(s.$('#project-dialog-image').src.includes('cuisine-lumiere'));assert.equal(s.$('.project-react-stage').getAttribute('aria-busy'),'false');s.close();
});
await run('Erreur de photo, reprise et délai de chargement borné',async()=>{
 const s=await reactScene({autoImages:false});s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flush();s.images[0].load();await flush();await s.click('#project-photo-next');s.images[1].fail();await flushReact(s);assert.ok(s.$('#project-dialog-image').src.includes('cuisine-lumiere'));assert.ok(s.$('.project-load-status').textContent.includes('Réessayez'));await s.click('.project-load-status button');s.images[2].load();await flushReact(s);assert.ok(s.$('#project-dialog-image').src.includes('cuisine-detail'));await s.click('#project-photo-prev');await s.advance(15000);assert.ok(s.$('.project-load-status').textContent.includes('Réessayez'));s.close();
});
await run('Vue agrandie, Échap en deux étapes et navigation clavier',async()=>{
 const s=await reactScene();s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flush();await s.click('.project-photo-expand');assert.ok(s.$('#project-dialog').classList.contains('is-photo-mode'));s.$('#project-dialog').dispatchEvent(new s.w.Event('cancel',{cancelable:true}));await flushReact(s);assert.equal(s.$('#project-dialog').classList.contains('is-photo-mode'),false);assert.equal(s.$('#project-dialog').open,true);await s.key('#project-dialog','ArrowRight');assert.equal(s.$('#project-photo-count').textContent,'02 / 02');s.$('#project-dialog').dispatchEvent(new s.w.Event('cancel',{cancelable:true}));await flush();await s.advance(300);assert.equal(s.$('#project-dialog').open,false);s.close();
});
await run('Réduction des mouvements et redimensionnement annulent les animations',async()=>{
 const s=await reactScene();s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flush();await s.click('#project-photo-next');await s.resized();assert.equal(s.$('.project-react-previous'),null);assert.equal(s.active.length,0);await s.motion(true);await s.click('#project-photo-prev');assert.equal(s.active.length,0);await s.click('[data-dialog-close]');assert.equal(s.$('#project-dialog').open,false);s.close();
});
await run('Changement de projet et fermeture pendant un chargement ne réintroduisent pas une ancienne photo',async()=>{
 const s=await reactScene({autoImages:false});s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flushReact(s);const old=s.images[0];s.w.RENOV_PROJECTS.open('commerce',s.$('[data-project="commerce"]'));await flush();old.load();await flushReact(s);assert.equal(s.$('#project-dialog-title').textContent,'Carrelage en grande surface');s.images[1].load();await flushReact(s);assert.ok(s.$('#project-dialog-image').src.includes('sol-commercial'));await s.click('[data-dialog-close]');await s.advance(300);assert.equal(s.$('#project-dialog').open,false);s.close();
});
await run('Glissement tactile horizontal ; le déplacement vertical ne change pas la photo',async()=>{
 const s=await reactScene();s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flushReact(s);const stage=s.$('.project-react-stage');
 const pointer=(type,x,y)=>{const e=new s.w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y});Object.defineProperty(e,'pointerType',{value:'touch'});stage.dispatchEvent(e);};
 pointer('pointerdown',200,200);pointer('pointerup',190,80);await flushReact(s);assert.equal(s.$('#project-photo-count').textContent,'01 / 02');pointer('pointerdown',200,200);pointer('pointerup',80,190);await flushReact(s);assert.equal(s.$('#project-photo-count').textContent,'02 / 02');s.close();
});
await run('Chargement React sur intention seulement, clic réel et dernière ouverture gagnante',async()=>{
 const s=scene(options);await s.settle();s.w.eval(read('projects-loader.js'));assert.equal(s.$('script[src="./projects-react.js"]'),null);const first=s.$('[data-project="cuisine"]'),last=s.$('[data-project="commerce"]');
 first.dispatchEvent(new s.w.MouseEvent('click',{bubbles:true,cancelable:true}));last.dispatchEvent(new s.w.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(s.d.querySelectorAll('script[src="./projects-react.js"]').length,1);s.w.eval(read('projects-react.js'));s.$('script[src="./projects-react.js"]').onload();await flushReact(s);assert.equal(s.$('#project-dialog-title').textContent,'Carrelage en grande surface');assert.equal(s.$('#project-dialog').open,true);s.close();
});
await run('Échap annule une ouverture en attente ; aucune précharge React pendant le préloader',async()=>{
 const s=scene(options);await s.settle();s.w.eval(read('projects-loader.js'));const link=s.$('[data-project="cuisine"]');s.d.documentElement.classList.add('intro-pending');link.dispatchEvent(new s.w.MouseEvent('pointerover',{bubbles:true}));assert.equal(s.$('script[src="./projects-react.js"]'),null);s.d.documentElement.classList.remove('intro-pending');link.dispatchEvent(new s.w.MouseEvent('click',{bubbles:true,cancelable:true}));await s.key('body','Escape');s.w.eval(read('projects-react.js'));s.$('script[src="./projects-react.js"]').onload();await flushReact(s);assert.equal(s.$('#project-dialog').open,false);s.close();
});
await run('Les treize projets s’ouvrent avec leurs données et photos ; les cadres restent bornés sur mobile et bureau',async()=>{
 const s=await reactScene();for(const p of s.w.RENOV_DATA.projects){s.w.RENOV_PROJECTS.open(p.id,s.$('[data-project="commerce"]'));await flushReact(s);assert.equal(s.$('#project-dialog-title').textContent,p.title);assert.ok(s.$('#project-dialog-image').src.includes(p.images[0].file));assert.equal(s.$('#project-dialog-details').children.length,p.details.length);await s.click('[data-dialog-close]');await s.advance(300);}
 for(const [w,h]of [[320,568],[390,844],[760,1024],[820,1180],[1440,900],[1920,1080],[844,390]]){s.w.innerWidth=w;s.w.innerHeight=h;s.w.RENOV_PROJECTS.open('cuisine',s.$('[data-project="cuisine"]'));await flushReact(s);const css=s.css('.project-react-stage>img');assert.equal(css['object-fit'],'contain');assert.ok(css.height.includes('svh'));await s.click('[data-dialog-close]');await s.advance(300);}s.close();
});
await run('Accueil, données SEO et tous les médias identiques à la livraison 23',()=>{
 const accepted='/workspace/scratch/c0b4d42c8e27/renov-bati-baseline-v23/renov-bati-premium';
 for(const name of ['intro.js','intro.css','intro-boot.js','hero-gallery.js','craft.js','content.js','projets.html','informations.html','preparer-publication.py'])assert.deepEqual(fs.readFileSync(path.join(root,name)),fs.readFileSync(path.join(accepted,name)));
 const d=new JSDOM(read('index.html')).window.document,b=new JSDOM(fs.readFileSync(path.join(accepted,'index.html'),'utf8')).window.document;assert.equal(d.querySelector('main').innerHTML,b.querySelector('main').innerHTML);assert.equal(d.querySelector('#business-data').textContent,b.querySelector('#business-data').textContent);assert.equal(d.title,b.title);assert.equal(d.querySelector('meta[name="description"]').content,b.querySelector('meta[name="description"]').content);
 let files=0;function compare(folder){for(const entry of fs.readdirSync(path.join(accepted,folder),{withFileTypes:true})){const relative=path.join(folder,entry.name);if(entry.isDirectory())compare(relative);else{assert.deepEqual(fs.readFileSync(path.join(root,relative)),fs.readFileSync(path.join(accepted,relative)));files++;}}}compare('assets');assert.equal(files,78);d.defaultView.close();b.defaultView.close();
});
console.log(JSON.stringify({status:'PASS',checks:results.length,results}));
fs.writeFileSync(path.join(root,'../documents/verification-react-v24.json'),JSON.stringify({status:'PASS',version:24,checks:results.length,results,environment:'Vrai bundle React production exécuté dans jsdom ; horloge, chargements et Web Animations contrôlés.',limits:['Pas de navigateur rendu, capture visuelle ou mesure FPS.']},null,2)+'\n');
