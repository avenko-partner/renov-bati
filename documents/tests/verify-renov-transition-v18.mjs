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
const hero=['content.js','preferences.js','hero-gallery.js'];
const identity=s=>s.$('#hero-image').dataset.heroId;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} versus ${b}`);
await check('Syntaxe de tous les scripts et feuilles CSS',()=>{for(const f of fs.readdirSync(root)){if(f.endsWith('.js'))new vm.Script(read(f));if(f.endsWith('.css'))cssTree.parse(read(f));}});
await check('Trois pages : liens locaux, ancres, ressources, srcset, alternatives et IDs uniques',()=>{
 const docs=new Map(['index.html','projets.html','informations.html'].map(f=>[f,new JSDOM(read(f)).window.document]));for(const [file,d]of docs){const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);for(const img of d.querySelectorAll('img'))assert.ok(img.hasAttribute('alt'));for(const el of d.querySelectorAll('[href],[src],[srcset]')){const refs=[el.getAttribute('href'),el.getAttribute('src'),...(el.getAttribute('srcset')||'').split(',').map(x=>x.trim().split(/\s/)[0])].filter(Boolean);for(const ref of refs){if(/^(http|tel:|mailto:|data:|blob:)/.test(ref))continue;const [name,hash]=ref.split('#'),target=name?path.normalize(name):file;if(name)assert.ok(fs.existsSync(path.join(root,name)),ref);if(hash&&docs.has(target))assert.ok(docs.get(target).getElementById(decodeURIComponent(hash)),ref);}}}assert.ok(!fs.existsSync(path.join(root,'zones-intervention.html')));
});
await check('Régression v15 reproduite en simulation : éléments visibles pendant la sortie puis retour à une opacité de départ',async()=>{
 const s=scene({base:baseline});await s.settle();await s.advance(1780);const during=s.opacity('.hero-line-inner');assert.equal(during,1);await s.advance(360);const after=s.opacity('.hero-line-inner');assert.equal(after,.35);measurements.baseline_v15={at_exit_start_ms:1780,opacity_during_overlay_exit:during,at_overlay_hidden_ms:2140,opacity_after_overlay_hidden:after,method:'Opacité issue de la cascade CSS et des keyframes, pas pixels rendus.'};s.close();
});
await check('Etat initial caché derrière le logo ; les animations sont créées avant que sa sortie commence',async()=>{
 const s=scene();await s.settle();for(const sel of ['.hero-line-inner','.hero-copy>.eyebrow','.hero-brief','.hero-controls','.hero-project'])assert.equal(s.opacity(sel),0,sel);assert.equal(s.animations.length,0);await s.advance(1779);assert.equal(s.animations.length,0);await s.advance(1);const entrance=s.animations.filter(a=>!a.target.classList.contains('hero-view-progress'));assert.equal(entrance.length,7);assert.ok(entrance.every(a=>a.start===1780));assert.equal(s.$('#brand-intro').hidden,false);assert.ok(s.d.documentElement.classList.contains('intro-leaving'));assert.ok(s.$('main').hasAttribute('inert'));assert.equal(s.events[0].event,'leaving');s.close();
});
await check('L’entrée de chaque composant est monotone avant, pendant et après la disparition du préloader',async()=>{
 const s=scene();await s.settle();const selectors=['.hero-line-inner','.hero-line:nth-child(2) .hero-line-inner','.hero-copy>.eyebrow','.hero-brief','.hero-controls','.hero-project'];const traces=Object.fromEntries(selectors.map(x=>[x,[]]));for(const time of [0,1700,1780,1820,1900,2000,2139,2140,2200,2380,2440,3000]){await s.advance(time-s.now);for(const sel of selectors)traces[sel].push({at:time,opacity:s.opacity(sel)});}for(const [sel,values]of Object.entries(traces)){for(let i=1;i<values.length;i++)assert.ok(values[i].opacity>=values[i-1].opacity,sel);assert.equal(values.at(-1).opacity,1);}measurements.entrance_opacity_traces=traces;assert.equal(s.events.filter(x=>x.event==='complete').length,1);s.close();
});
await check('Fin de l’intro à 2140 ms : aucun nouveau démarrage d’animation ; la boucle photo seule démarre',async()=>{
 const s=scene();await s.settle();await s.advance(2140);assert.equal(s.$('#brand-intro').hidden,true);assert.equal(s.$('main').hasAttribute('inert'),false);assert.equal(s.$('main').hasAttribute('aria-busy'),false);assert.equal(s.animations.filter(a=>a.start===2140&&!a.target.classList.contains('hero-view-progress')).length,0);assert.equal(s.animations.filter(a=>a.start===2140&&a.target.classList.contains('hero-view-progress')).length,1);assert.equal(s.errors.length,0);s.close();
});
await check('Script craft chargé une seconde après l’intro : aucun élément déjà visible n’est réanimé',async()=>{
 const s=scene({scripts:['content.js','preferences.js','intro.js','app.js','hero-gallery.js']});await s.settle();await s.advance(3140);assert.equal(s.opacity('.hero-line-inner'),1);s.w.eval(read('craft.js'));await flush();assert.equal(s.animations.filter(a=>!a.target.classList.contains('hero-view-progress')).length,0);assert.equal(s.opacity('.hero-line-inner'),1);s.close();
});
await check('Script craft arrivé pendant la sortie : état préparé et entrée unique sans composant visible auparavant',async()=>{
 const s=scene({scripts:['content.js','preferences.js','intro.js']});await s.settle();await s.advance(1900);assert.equal(s.opacity('.hero-line-inner'),0);s.w.eval(read('craft.js'));await flush();assert.equal(s.animations.length,7);assert.ok(s.animations.every(a=>a.start===1900));await s.advance(240);assert.ok(s.opacity('.hero-line-inner')>0);assert.equal(s.animations.length,7);s.close();
});
await check('Resize pendant la sortie : annulation sûre, contenu dans son état final et aucun retour à zéro',async()=>{
 const s=scene();await s.settle();await s.advance(1930);const previous=s.opacity('.hero-line-inner');assert.ok(previous>0);await s.resized();assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.opacity('.hero-controls'),1);await s.advance(1070);assert.equal(s.opacity('.hero-line-inner'),1);s.close();
});
await check('Scroll immédiatement après le préloader : entrée annulée sans bloquer les contrôles ni faire disparaître le texte',async()=>{
 const s=scene();await s.settle();await s.advance(2140);await s.scroll(100);assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.active.filter(a=>!a.target.classList.contains('hero-view-progress')).length,0);assert.ok(s.$('.site-header').classList.contains('is-scrolled'));assert.equal(s.raf.size,0);await s.advance(4500);assert.equal(identity(s),'bain-pierre');s.close();
});
await check('Sans Web Animations, le contenu est visible au début de la sortie et reste utilisable',async()=>{
 const s=scene({animation:false});await s.settle();assert.equal(s.opacity('.hero-line-inner'),0);await s.advance(1780);assert.equal(s.opacity('.hero-line-inner'),1);await s.advance(360);assert.equal(s.opacity('.hero-line-inner'),1);await s.advance(4500);assert.equal(identity(s),'bain-pierre');s.close();
});
await check('Mouvements réduits avant le chargement : aucun préloader ni entrée cachée',async()=>{
 const s=scene({reduced:true});await s.settle();assert.equal(s.d.documentElement.classList.contains('intro-pending'),false);assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.animations.length,0);assert.equal(s.$('#hero-autoplay').disabled,true);s.close();
});
await check('Réduction des mouvements pendant le fondu : sortie immédiate, contenu final et aucun effet restant',async()=>{
 const s=scene();await s.settle();await s.advance(1900);await s.motion(true);assert.equal(s.$('#brand-intro').hidden,true);assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.active.length,0);s.close();
});
await check('Ancre directe et retour historique : pas d’entrée tardive ni de préloader',async()=>{
 for(const options of [{hash:'#devis'},{history:'back_forward'}]){const s=scene(options);await s.settle();assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.d.documentElement.classList.contains('intro-pending'),false);assert.equal(s.animations.filter(a=>!a.target.classList.contains('hero-view-progress')).length,0);s.close();}
});
await check('Ressource principale lente : logo gardé et libération au plafond de 3500 ms, sans animation tardive',async()=>{
 const s=scene({resources:false});await s.settle();await s.advance(3499);assert.equal(s.$('#brand-intro').hidden,false);await s.advance(1);assert.equal(s.$('#brand-intro').hidden,true);assert.equal(s.opacity('.hero-line-inner'),1);assert.equal(s.animations.filter(a=>!a.target.classList.contains('hero-view-progress')).length,0);s.releaseHero();await flush();await s.advance(500);assert.equal(s.opacity('.hero-line-inner'),1);s.close();
});
await check('Échap avant et pendant la sortie restitue le focus et ne relance pas l’intro',async()=>{
 for(const time of [500,1900]){const s=scene();await s.settle();await s.advance(time);await s.key('body','Escape');assert.equal(s.$('#brand-intro').hidden,true);assert.equal(s.$('main').hasAttribute('inert'),false);await s.advance(1000);assert.equal(s.opacity('.hero-line-inner'),1);s.close();}
});
await check('Aucune animation des sections suivantes avant la fin de l’intro ; elles restent disponibles ensuite',async()=>{
 const s=scene();await s.settle();assert.equal(s.io.filter(x=>x.options?.rootMargin==='0px 0px 80px 0px').length,0);await s.advance(2140);assert.equal(s.io.filter(x=>x.options?.rootMargin==='0px 0px 80px 0px').length,1);for(const selector of ['.expertise-photo','.expertise-overview','.expertise-services'])await s.intersect(selector,true);assert.equal(s.animations.filter(a=>a.target.closest('.expertise-columns')).length,3);s.close();
});
await check('Menu accessible de 320 à 1440 px, double segment, Escape, liens et changement de largeur',async()=>{
 for(const [width,segments]of [[320,false],[375,false],[540,false],[760,false],[820,false],[960,false],[1100,false],[1101,false],[1440,true],[1440,false]]){const s=scene({scripts:['content.js','preferences.js','app.js'],preloader:false,width,segments});await s.settle();assert.equal(s.$('.main-nav').hasAttribute('inert'),width<=1100||segments);await s.click('.menu-toggle');assert.equal(s.$('.menu-toggle').getAttribute('aria-expanded'),'true');assert.equal(s.$('.main-nav').hasAttribute('inert'),false);await s.key('.menu-toggle','Escape');assert.equal(s.d.activeElement,s.$('.menu-toggle'));assert.equal(s.d.body.classList.contains('menu-open'),false);await s.click('.menu-toggle');await s.click('.main-nav a');assert.equal(s.$('.menu-toggle').getAttribute('aria-expanded'),'false');s.w.innerWidth=1600;await s.resized();s.close();}
});
await check('Premiers scrolls : mesures mises en cache, progression exacte et événements regroupés',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();const initial=s.reads;for(let i=0;i<20;i++)await s.scroll(100+i*100);assert.equal(s.reads,initial);near(Number(s.$('.page-progress').style.transform.match(/\(([^)]+)\)/)[1]),2000/(14000-900));for(let i=0;i<50;i++)s.w.dispatchEvent(new s.w.Event('scroll'));assert.equal(s.raf.size,1);await s.frame();s.close();
});
await check('Quatre cycles complets à 4500 ms, légende et fiche synchronisées sans annonce automatique',async()=>{
 const s=scene({scripts:hero,preloader:false});await s.settle();const seq=['bain-pierre','cuisine','piscine'];for(let i=0;i<12;i++){await s.advance(4499);assert.equal(identity(s),i?seq[(i-1)%3]:'piscine');await s.advance(1);assert.equal(identity(s),seq[i%3]);assert.equal(s.$('#hero-selected-project').dataset.project,identity(s));assert.equal(s.$('#hero-view-status').textContent,'');assert.equal(s.active.filter(a=>a.target.classList.contains('hero-view-progress')).length,1);}assert.equal(s.raf.size,0);s.close();
});
await check('Pause conserve 40 % ; reprise sur les 2700 ms restantes',async()=>{
 const s=scene({scripts:hero,preloader:false});await s.settle();await s.advance(1800);await s.runIdle();await s.click('#hero-autoplay');near(s.fraction(),.4);await s.advance(10000);assert.equal(identity(s),'piscine');await s.click('#hero-autoplay');await s.advance(2699);assert.equal(identity(s),'piscine');await s.advance(1);assert.equal(identity(s),'bain-pierre');s.close();
});
await check('Un seul préchargement différé de photo ; un choix manuel repart sur un délai entier',async()=>{
 const s=scene({scripts:hero,preloader:false});await s.settle();assert.equal(s.images.length,0);await s.advance(1000);assert.equal(s.images.length,0);await s.runIdle();assert.equal(s.images.length,1);assert.equal(s.images[0].fetchPriority,'low');await s.click('[data-hero-view="cuisine"]');assert.equal(identity(s),'cuisine');assert.equal(s.images[1].fetchPriority,'high');near(s.fraction(),0);await s.advance(4500);assert.equal(identity(s),'piscine');s.close();
});
await check('En double segment, le chargement des photos utilise la largeur du panneau et suit ses changements',async()=>{
 const s=scene({scripts:hero,preloader:false,width:1114,height:720,segments:true,pane:540});await s.settle();assert.equal(s.$('#hero-image').sizes,'540px');await s.advance(1000);await s.runIdle();assert.equal(s.images[0].sizes,'540px');s.pane=320;await s.resized();assert.equal(s.$('#hero-image').sizes,'320px');await s.click('[data-hero-view="cuisine"]');assert.equal(s.images[1].sizes,'320px');assert.equal(s.$('#hero-image').sizes,'320px');s.close();
});
await check('Dernier clic gagnant après un décodage lent ; erreur conserve la vue actuelle',async()=>{
 const s=scene({scripts:hero,preloader:false,autoImages:false});await s.settle();await s.click('[data-hero-view="bain-pierre"]');const first=s.images[0];first.hold=true;first.load();await flush();assert.equal(identity(s),'piscine');await s.click('[data-hero-view="cuisine"]');s.images[1].load();await flush();assert.equal(identity(s),'cuisine');first.release();await flush();assert.equal(identity(s),'cuisine');await s.click('[data-hero-view="piscine"]');s.images[2].fail();await flush();assert.equal(identity(s),'cuisine');assert.ok(s.$('#hero-view-status').textContent.includes('ne peut pas être chargée'));s.close();
});
await check('Onglet masqué, ouverture hors écran et focus clavier suspendent le temps restant',async()=>{
 for(const mode of ['visibility','intersection','keyboard']){const s=scene({scripts:hero,preloader:false});await s.settle();await s.advance(1125);await s.runIdle();if(mode==='visibility')await s.visible(false);if(mode==='intersection')await s.intersect('.hero-stage',false);if(mode==='keyboard'){await s.key('[data-hero-view="piscine"]','Tab');s.$('[data-hero-view="piscine"]').focus();await flush();}near(s.fraction(),.25);await s.advance(10000);assert.equal(identity(s),'piscine');if(mode==='visibility')await s.visible(true);if(mode==='intersection')await s.intersect('.hero-stage',true);if(mode==='keyboard'){s.$('[data-hero-view="piscine"]').dispatchEvent(new s.w.MouseEvent('pointerdown',{bubbles:true}));await flush();}await s.advance(3375);assert.equal(identity(s),'bain-pierre');s.close();}
});
await check('Resize et scroll ne réinitialisent pas le délai photographique et nettoient les copies de fondu',async()=>{
 const s=scene({scripts:hero,preloader:false});await s.settle();await s.advance(1800);await s.runIdle();await s.resized();near(s.fraction(),.4);await s.advance(2700);assert.equal(identity(s),'bain-pierre');assert.ok(s.$('.hero-image-ghost'));await s.scroll(100);assert.equal(s.$('.hero-image-ghost'),null);assert.equal(s.active.filter(a=>a.target.classList.contains('hero-view-progress')).length,1);s.close();
});
await check('Avant/après, galerie filtrée et fiche projet fonctionnent encore sur des formats étroits',async()=>{
 const s=scene({scripts:['content.js','preferences.js','app.js'],preloader:false,width:375});await s.settle();assert.equal(s.w.RENOV_DATA.projects.length,13);for(const [filter,n]of [['interieur',4],['exterieur',3],['professionnel',1],['all',8]]){await s.click('[data-filter="'+filter+'"]');assert.equal([...s.d.querySelectorAll('[data-project-card]')].filter(e=>!e.hidden).length,n);}await s.click('[data-compare="100"]');assert.equal(s.$('#compare-range').value,'100');await s.key('#compare-range','Home');assert.equal(s.$('#compare-range').value,'0');await s.key('#compare-range','End');assert.equal(s.$('#compare-range').value,'100');await s.click('[data-project="commerce"]');assert.equal(s.$('#project-dialog').open,true);assert.ok(s.$('#project-dialog-title').textContent.length>0);await s.click('[data-dialog-close]');await s.advance(300);assert.equal(s.$('#project-dialog').open,false);assert.equal(s.d.body.classList.contains('dialog-open'),false);s.close();
});
await check('Formulaire : validation, coordonnées accentuées, brouillon réel et retour à la saisie',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();s.$('#quote-form').dispatchEvent(new s.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(s.$('#quote-firstname').getAttribute('aria-invalid'),'true');for(const [key,value]of Object.entries({firstname:'Émilie',lastname:'Martin',phone:'06 12 34 56 78',email:'emilie@example.fr'}))s.$('#quote-'+key).value=value;s.$('#quote-form').dispatchEvent(new s.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(s.$('#quote-form').hidden,true);assert.ok(s.$('#quote-email-link').href.startsWith('mailto:artugrul.ertan@orange.fr'));assert.ok(decodeURIComponent(s.$('#quote-email-link').href).includes('Émilie'));await s.click('#quote-edit');assert.equal(s.$('#quote-form').hidden,false);s.close();
});
await check('Ruban transparent des douze références : pause et réduction des animations',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();assert.equal(s.$('#logo-group').children.length,12);await s.click('#marquee-pause');assert.ok(s.$('#logo-marquee').classList.contains('is-paused'));await s.click('#marquee-pause');assert.equal(s.$('#logo-marquee').classList.contains('is-paused'),false);await s.motion(true);await s.frame();assert.equal(s.$('#marquee-pause').disabled,true);s.close();
});
await check('Molette et gestes tactiles restent libres ; la préférence de mouvement reste accessible',async()=>{
 const s=scene();await s.settle();await s.advance(2140);for(const type of ['wheel','touchmove']){const e=new s.w.Event(type,{bubbles:true,cancelable:true});s.$('.hero-stage').dispatchEvent(e);assert.equal(e.defaultPrevented,false);}await s.click('#motion-toggle');assert.ok(s.d.documentElement.classList.contains('reduce-motion'));assert.equal(s.opacity('.hero-line-inner'),1);s.close();
});
await check('Logo original, 69 contours, palette, fichiers médias et contenu légal/SEO préservés',()=>{
 const before=new JSDOM(read('index.html',baseline)).window.document,after=new JSDOM(read('index.html')).window.document;assert.equal(after.querySelectorAll('.intro-trace').length,69);assert.equal(after.querySelector('#brand-intro').innerHTML,before.querySelector('#brand-intro').innerHTML);assert.equal(after.querySelector('#business-data').textContent,before.querySelector('#business-data').textContent);assert.equal(after.querySelector('meta[name="description"]').content,before.querySelector('meta[name="description"]').content);
 let assets=0;function compare(folder){for(const f of fs.readdirSync(path.join(baseline,folder),{withFileTypes:true})){const name=path.join(folder,f.name);if(f.isDirectory())compare(name);else{assert.deepEqual(fs.readFileSync(path.join(root,name)),fs.readFileSync(path.join(baseline,name)));assets++;}}}compare('assets');measurements.identical_asset_files=assets;assert.equal(read('content.js'),read('content.js',baseline));assert.equal(read('informations.html'),read('informations.html',baseline));
});

await check('Après accueil : chaque visuel est observé séparément, sans masquer le contenu',async()=>{
 const s=scene({preloader:false,scripts:['preferences.js','craft.js']});await s.settle();
 const ob=s.io.find(o=>o.options?.rootMargin==='0px 0px 80px 0px');assert.equal(ob.options.threshold,0);
 assert.ok(!ob.targets.has(s.$('.material-layout')));assert.ok(ob.targets.has(s.$('.material-photo')));assert.ok(ob.targets.has(s.$('.material-detail')));
 for(const selector of ['.projects-heading','[data-project-card]','.expertise-photo','.expertise-overview','.expertise-services','.material-heading','.material-photo','.material-detail','.material-context','.comparison-wrap','.warranty-grid article','.contact-copy','.quote-panel'])await s.intersect(selector,true);
 assert.ok(s.animations.length>=15);for(const a of s.animations){for(const frame of a.frames){assert.equal(frame.opacity,undefined);assert.equal(frame.clipPath,undefined);assert.equal(frame.height,undefined);}assert.ok(a.options.duration<=760);}
 assert.equal(s.$('.material-photo').style.visibility,'');assert.equal(s.$('.project-photo').style.opacity,'');s.close();
});
await check('Ancre et scroll rapide : aucun retour en arrière des composants déjà dans la zone de lecture',async()=>{
 const s=scene({preloader:false,scripts:['preferences.js','craft.js']});await s.settle();const target=s.$('.material-photo'),ob=s.io.find(o=>o.targets.has(target));
 ob.cb([{target,isIntersecting:true,boundingClientRect:{top:200}}]);assert.equal(s.animations.length,0);assert.ok(!ob.targets.has(target));
 ob.cb([{target,isIntersecting:true,boundingClientRect:{top:850}}]);assert.equal(s.animations.length,0);s.close();
});
await check('Une animation par visuel ; les projets masqués restent observés jusqu’à leur affichage',async()=>{
 const s=scene({preloader:false,scripts:['preferences.js','craft.js']});await s.settle();const target=s.$('[data-project-card]'),ob=s.io.find(o=>o.targets.has(target));
 target.hidden=true;await s.intersect('[data-project-card]',true);assert.equal(s.animations.length,0);assert.ok(ob.targets.has(target));target.hidden=false;await s.intersect('[data-project-card]',true);assert.equal(s.animations.length,2);assert.ok(!ob.targets.has(target));await s.intersect('[data-project-card]',true);assert.equal(s.animations.length,2);await s.advance(800);assert.equal(s.active.length,0);s.close();
});
await check('Resize, page masquée et réduction des mouvements restituent les états finaux sans laisser de style caché',async()=>{
 for(const event of ['resize','pagehide','reduce']){const s=scene({preloader:false,scripts:['preferences.js','craft.js']});await s.settle();await s.intersect('.material-photo',true);assert.equal(s.active.length,1);if(event==='resize')await s.resized();if(event==='pagehide')s.w.dispatchEvent(new s.w.Event('pagehide'));if(event==='reduce')await s.motion(true);assert.equal(s.active.length,0);assert.equal(s.$('.material-photo').style.transform,'');assert.equal(s.$('.material-photo').style.opacity,'');s.close();}
 const s=scene({preloader:false,reduced:true,scripts:['preferences.js','craft.js']});await s.settle();await s.intersect('.material-photo',true);assert.equal(s.active.length,0);s.close();
});
await check('Filtres rapides : annulation avant mesures, translations seules, pas de hauteur animée ou de texte déformé',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();const cards=[...s.d.querySelectorAll('[data-project-card]')];let reads=0;
 cards.forEach((card,i)=>{card.getBoundingClientRect=()=>{reads++;assert.equal(s.active.filter(a=>cards.includes(a.target)).length,0,'Les anciennes transformations doivent être annulées avant mesure');const filtered=s.$('#project-grid').classList.contains('is-filtered');return {left:filtered?i*110:i*160,top:i*100,width:filtered?300:450,height:400};};});
 for(const f of ['interieur','exterieur','all','professionnel','all'])await s.click('[data-filter="'+f+'"]');assert.ok(reads>0);assert.ok(s.animations.some(a=>cards.includes(a.target)));
 for(const a of s.animations){for(const frame of a.frames){assert.equal(frame.height,undefined);assert.ok(!String(frame.transform).includes('scale('));}}
 await s.advance(900);assert.equal(s.$('.project-ghost'),null);assert.equal(s.active.length,0);assert.equal(cards.filter(x=>!x.hidden).length,8);s.close();
});
await check('Fiche projet : une seule transition photo, aucune lecture de largeur forcée, fermeture et réduction nettoient les effets',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();
 Object.defineProperty(s.$('#project-dialog-image'),'offsetWidth',{get(){throw new Error('Lecture forcée interdite');}});
 const project=s.w.RENOV_DATA.projects.find(p=>p.images.length>1);assert.ok(project);await s.click('[data-project="'+project.id+'"]');assert.equal(s.$('#project-dialog').open,true);
 assert.equal(s.active.filter(a=>a.target.id==='project-dialog-image').length,0);
 await s.click('#project-photo-next');await s.click('#project-photo-prev');assert.equal(s.active.filter(a=>a.target.id==='project-dialog-image').length,1);
 await s.motion(true);assert.equal(s.active.filter(a=>a.target.id==='project-dialog-image').length,0);await s.motion(false);
 await s.click('#project-photo-next');await s.resized();assert.equal(s.active.filter(a=>a.target.id==='project-dialog-image').length,0);
 await s.click('#project-photo-next');await s.click('[data-dialog-close]');await s.advance(300);assert.equal(s.$('#project-dialog').open,false);assert.equal(s.active.length,0);s.close();
});
await check('Accueil, logo, carrousel, données et médias inchangés depuis la version acceptée 17',()=>{
 const accepted='/workspace/scratch/c0b4d42c8e27/renov-bati-baseline-v17/renov-bati-premium';
 for(const name of ['intro.js','intro.css','intro-boot.js','hero-gallery.js','content.js','index.html','projets.html','informations.html'])assert.deepEqual(fs.readFileSync(path.join(root,name)),fs.readFileSync(path.join(accepted,name)));
 const old=fs.readFileSync(path.join(accepted,'craft.js'),'utf8'),current=read('craft.js');const heroPart=x=>x.slice(x.indexOf('  function enterHero('),x.indexOf('  function ',x.indexOf('  function enterHero(')+5));assert.equal(heroPart(current),heroPart(old));
});

const report={status:'PASS',date:'2026-10-13',version:18,checks:checks.length,coverage:checks,measurements,environment:'Simulation DOM avec horloge, Image/decode, Web Animations, IntersectionObserver et ResizeObserver contrôlés, plus analyse de la cascade CSS.',limits:['Aucun rendu navigateur ni capture visuelle réalisé.','Les traces d’opacité sont calculées depuis la cascade et les keyframes. La simulation interpole linéairement pour vérifier le sens de progression ; elle ne mesure pas le rendu réel de la courbe d’accélération.','Les tests de largeur et segments sont des scénarios CSS, pas des appareils physiques.','Aucune mesure FPS ou Core Web Vitals.']};fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,report:reportPath}));
