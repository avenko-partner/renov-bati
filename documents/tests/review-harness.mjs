import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
import * as cssTree from 'css-tree';
import {styleEngine} from './renov-css-cascade-v16.mjs';
const root=process.argv[2]||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const reportPath=process.argv[4]||path.join(root,'documents/verification-accueil-revue-20261017.json');
const read=(file,base=root)=>fs.readFileSync(path.join(base,file),'utf8');
const checks=[],measurements={};
async function check(name,fn){await fn();checks.push(name);}
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
function scene({base=root,page='index.html',scripts=['content.js','preferences.js','intro.js','site-header.js','app.js','craft.js','hero-gallery.js'],preloader=true,animation=true,reduced=false,width=1440,height=900,segments=false,pane=540,resources=true,autoImages=true,history='navigate',hash='',noIdle=false}={}){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(read(page,base),{url:'https://renov-bati.test/'+page+hash,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,d=w.document,$=s=>d.querySelector(s),timers=new Map(),raf=new Map(),idle=new Map(),animations=[],images=[],io=[],ro=[],media=new Map(),events=[];
 let clock=0,serial=0,hidden=false,readingWidth=segments?pane:width,heroResolve,geometryReads=0,scrollHeight=14000;
 w.innerWidth=width;w.innerHeight=height;w.scrollY=0;Object.defineProperty(w.performance,'now',{value:()=>clock});w.performance.getEntriesByType=()=>[{type:history}];
 w.matchMedia=q=>{if(!media.has(q))media.set(q,{matches:q.includes('reduced-motion')?reduced:q.includes('viewport-segments')?segments:false,callbacks:[],addEventListener(t,fn){this.callbacks.push(fn);},removeEventListener(t,fn){this.callbacks=this.callbacks.filter(f=>f!==fn);}});return media.get(q);};
 const later=(fn,ms=0,kind='timeout')=>{const id=++serial;timers.set(id,{at:clock+Number(ms),fn,kind});return id;};
 w.setTimeout=(fn,ms)=>later(fn,ms);w.clearTimeout=id=>timers.delete(id);w.requestAnimationFrame=fn=>{const id=++serial;raf.set(id,fn);return id;};w.cancelAnimationFrame=id=>raf.delete(id);
 if(!noIdle){w.requestIdleCallback=(fn,{timeout=1000}={})=>{const id=++serial,deadline=later(()=>{idle.delete(id);fn({didTimeout:true});},timeout,'idle');idle.set(id,{fn,deadline});return id;};w.cancelIdleCallback=id=>{timers.delete(idle.get(id)?.deadline);idle.delete(id);};}
 Object.defineProperty(d,'hidden',{get:()=>hidden});Object.defineProperty(d.documentElement,'scrollHeight',{get:()=>{geometryReads++;return scrollHeight;}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:readingWidth,bottom:800,width:readingWidth,height:800};};
 for(const [i,a]of [...d.querySelectorAll('.main-nav a')].entries())if(a.hash&&a.getAttribute('href').startsWith('#'))$(a.hash).getBoundingClientRect=()=>{geometryReads++;return {left:0,top:1200+i*2500-w.scrollY,width:readingWidth,height:1000};};
 if($('.hero-stage'))Object.defineProperty($('.hero-stage'),'clientWidth',{get:()=>readingWidth});if($('#logo-marquee'))Object.defineProperty($('#logo-marquee'),'clientWidth',{get:()=>readingWidth});if($('#logo-group'))$('#logo-group').getBoundingClientRect=()=>({width:$('#logo-group').children.length*248});if($('#compare-stage'))$('#compare-stage').getBoundingClientRect=()=>({left:40,top:0,width:600,height:800});
 w.ResizeObserver=class{constructor(cb){this.cb=cb;this.targets=new Set();ro.push(this);}observe(el){this.targets.add(el);}disconnect(){this.targets.clear();}};
 w.IntersectionObserver=class{constructor(cb,options){this.cb=cb;this.options=options;this.targets=new Set();io.push(this);}observe(el){this.targets.add(el);}unobserve(el){this.targets.delete(el);}disconnect(){this.targets.clear();}};
 w.HTMLImageElement.prototype.decode=function(){if(this.id==='hero-image'&&!resources)return new Promise(resolve=>{heroResolve=resolve;});return this.hold?new Promise(resolve=>(this.waiters||=[]).push(resolve)):Promise.resolve();};
 const srcDescriptor=Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype,'src');
 w.Image=function(){const image=d.createElement('img');images.push(image);let complete=false,natural=0;image.waiters=[];image.hold=false;
  Object.defineProperty(image,'complete',{get:()=>complete});Object.defineProperty(image,'naturalWidth',{get:()=>natural});
  image.load=()=>{complete=true;natural=1000;image.dispatchEvent(new w.Event('load'));};image.fail=()=>image.dispatchEvent(new w.Event('error'));image.release=()=>{image.waiters.splice(0).forEach(fn=>fn());};
  Object.defineProperty(image,'src',{get(){return srcDescriptor.get.call(this);},set(value){srcDescriptor.set.call(this,value);if(autoImages)queueMicrotask(image.load);}});return image;
 };
 d.fonts={ready:Promise.resolve()};const videos=new WeakMap();w.HTMLMediaElement.prototype.play=function(){videos.set(this,true);return Promise.resolve();};w.HTMLMediaElement.prototype.pause=function(){videos.set(this,false);};w.HTMLMediaElement.prototype.load=function(){};Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return !videos.get(this);}});
 if(animation)w.Element.prototype.animate=function(frames,options){let resolve,reject;const finished=new Promise((a,b)=>{resolve=a;reject=b;});finished.catch(()=>{});const a={target:this,frames,options,start:clock,state:'running',finished,onfinish:null,oncancel:null};const end=later(()=>{a.state='finished';a.onfinish?.();resolve();},(options.duration||0)+(options.delay||0),'animation');a.cancel=()=>{if(a.state==='cancelled')return;timers.delete(end);a.state='cancelled';a.oncancel?.();reject(new Error('cancelled'));};animations.push(a);return a;};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('button')?.focus();};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.Blob=Blob;w.URL.createObjectURL=()=> 'blob:draft';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){if(this.download)return;this.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 d.addEventListener('renov-intro-leaving',()=>events.push({event:'leaving',at:clock,overlayHidden:$('#brand-intro').hidden}));d.addEventListener('renov-intro-complete',()=>events.push({event:'complete',at:clock}));
 const navigations=[];w.__reviewNavigate=href=>navigations.push(href);if(preloader)w.eval(read('intro-boot.js',base));for(const file of scripts)w.eval(file==='page-navigation.js'?read(file,base).replace('location.assign(target.href)','window.__reviewNavigate(target.href)'):read(file,base));d.addEventListener('click',e=>{e.reviewIntercepted=e.defaultPrevented;e.preventDefault();});
 const s={dom,w,d,$,navigations,timers,raf,idle,animations,images,io,ro,media,events,errors,base,
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

export {scene,flush,root,read,check,checks,measurements};
