import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {scene,root,flush} from './review-harness.mjs';
import {styleEngine,tracks,numeric} from './renov-css-cascade-v16.mjs';
const checks=[];async function check(name,fn){await fn();checks.push(name);}
const portfolio=options=>scene({page:'projets.html',preloader:false,width:390,height:844,scripts:['preferences.js','portfolio-data.js','portfolio.js'],...options});
const count=s=>s.$('#work-grid').children.length;
const list=s=>Array.from(s.w.RENOV_PORTFOLIO).filter(p=>p.category!=='inspirations');
function observers(s){const target=s.$('.work-pagination-end');const active=s.io.filter(o=>o.targets.has(target));return {target,end:active[0],warm:active[1]};}
function trigger(s,o,{inside=true,bottom=s.w.innerHeight,live=bottom}={}){
 const target=s.$('.work-pagination-end');target.getBoundingClientRect=()=>({left:0,top:live-1,bottom:live,width:100,height:1});
 o.cb([{target,isIntersecting:inside,intersectionRatio:inside?1:0,boundingClientRect:{top:bottom-1,bottom,height:1}}]);
}
await check('Sur téléphone et panneau Duo, le prochain lot arrive 140 à 260 px avant la fin ; sur ordinateur, le seuil reste la fin exacte',async()=>{
 for(const p of [{width:320,height:568},{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:540,height:720},{width:844,height:390},{width:1114,height:720,segments:true},{width:1440,height:900}]){
  const s=portfolio(p);await s.settle();const o=observers(s),mobile=p.width<=700||p.segments||(p.width<=960&&p.height<=540),ahead=mobile?Math.min(260,Math.max(140,Math.round(p.height*.3))):0;
  assert.equal(o.end.options.rootMargin,ahead?`0px 0px ${ahead}px 0px`:'0px');assert.equal(o.end.options.threshold,mobile?0:1);assert.equal(Boolean(o.warm),Boolean(mobile));
  trigger(s,o.end,{inside:false,bottom:p.height+ahead+1});await s.frame();assert.equal(count(s),10);
  trigger(s,o.end,{bottom:p.height+ahead});await s.frame();assert.equal(count(s),20);assert.equal(s.errors.length,0);s.close();
 }
});
await check('Seules les deux couvertures suivantes sont préparées, une fois, sans créer de carte ni télécharger un film',async()=>{
 const s=portfolio();await s.settle();const o=observers(s),before=s.images.length,expected=list(s).slice(10,12);trigger(s,o.warm,{bottom:1500});await flush();assert.equal(count(s),10);assert.equal(s.images.length,before+2);const prepared=s.images.slice(before);
 for(const [i,img]of prepared.entries()){const m=expected[i].media.find(m=>m.id===expected[i].cover);assert.equal(img.getAttribute('src'),m.kind==='photo'?m.src:(m.poster||m.thumb));assert.ok(!img.src.endsWith('.mp4'));assert.equal(img.fetchPriority,'low');}
 trigger(s,o.warm,{bottom:1400});await flush();assert.equal(s.images.length,before+2);assert.equal(s.d.querySelectorAll('video').length,0);trigger(s,o.end,{bottom:1000});await s.frame();assert.equal(count(s),20);
 for(const [i,img]of prepared.entries()){const shown=s.$('#work-grid').children[10+i].querySelector('img');assert.equal(shown.getAttribute('src'),img.getAttribute('src'));assert.equal(shown.getAttribute('srcset'),img.getAttribute('srcset'));assert.equal(shown.sizes,img.sizes);}s.close();
});
await check('Un déclenchement ajoute dix cartes et garde le focus ; les entrées anciennes ne déclenchent pas le lot suivant',async()=>{
 const s=portfolio();await s.settle();const o=observers(s),focus=s.$('[data-work]');focus.focus();let initialCount=count(s);o.target.getBoundingClientRect=()=>({left:0,top:count(s)===initialCount?999:5999,bottom:count(s)===initialCount?1000:6000,width:100,height:1});
 const entry={target:o.target,isIntersecting:true,boundingClientRect:{top:999,bottom:1000,height:1}};for(let i=0;i<5;i++)o.end.cb([entry]);assert.equal(count(s),10);await s.frame();assert.equal(count(s),20);assert.equal(s.d.activeElement,focus);o.end.cb([entry]);await s.frame();assert.equal(count(s),20);
 initialCount=20;o.end.cb([entry]);await s.frame();assert.equal(count(s),30);assert.equal(new Set([...s.$('#work-grid').children].map(x=>x.id)).size,30);s.close();
});
await check('Un défilement lent ne perd pas le seuil quand le repère n’entre que d’une fraction de pixel',async()=>{
 const s=portfolio();await s.settle();const o=observers(s);trigger(s,o.end,{bottom:844+253+.5});await s.frame();assert.equal(count(s),20);s.close();
});
await check('L’ajout mobile est visible immédiatement, sans fondu ni cascade retardée ; la réduction des mouvements est respectée',async()=>{
 for(const reduced of [false,true]){const s=portfolio({reduced});await s.settle();trigger(s,observers(s).end,{bottom:1000});await s.frame();const effects=s.animations.filter(a=>a.target.classList.contains('work-card'));assert.equal(effects.length,reduced?0:10);for(const effect of effects){assert.equal(effect.options.delay,0);assert.ok(effect.options.duration<=280);assert.equal(effect.frames[0].opacity,undefined);assert.equal(effect.frames[1].opacity,undefined);}s.close();}
});
await check('Changer de filtre annule la préparation et les ajouts en attente ; les couvertures préparées suivent le nouveau filtre',async()=>{
 const s=portfolio();await s.settle();let o=observers(s);trigger(s,o.warm,{bottom:1500});await flush();const first=s.images.slice();trigger(s,o.end,{bottom:1000});await s.click('[data-work-filter="interieurs"]');await s.frame();assert.equal(count(s),10);assert.ok(first.every(img=>!img.hasAttribute('src')));assert.ok([...s.$('#work-grid').children].every(c=>s.w.RENOV_PORTFOLIO.find(p=>p.id===c.id).category==='interieurs'));
 const expected=Array.from(s.w.RENOV_PORTFOLIO).filter(p=>p.category==='interieurs').slice(10,12),n=s.images.length;o=observers(s);trigger(s,o.warm,{bottom:1500});await flush();assert.equal(s.images.length-n,expected.length);for(const [i,p]of expected.entries()){const m=p.media.find(m=>m.id===p.cover);assert.equal(s.images[n+i].getAttribute('src'),m.kind==='photo'?m.src:(m.poster||m.thumb));}s.close();
});
await check('La préparation et la pagination attendent la fin du préloader et se suspendent quand l’onglet est masqué',async()=>{
 const s=portfolio({preloader:true,scripts:['preferences.js','intro.js','portfolio-data.js','portfolio.js']});await s.settle();assert.equal(s.io.filter(o=>o.targets.has(s.$('.work-pagination-end'))).length,0);await s.advance(2140);const o=observers(s);assert.ok(o.end&&o.warm);const before=s.images.length;await s.visible(false);trigger(s,o.warm,{bottom:1500});trigger(s,o.end,{bottom:1000});await s.frame();assert.equal(count(s),10);assert.equal(s.images.length,before);await s.visible(true);await s.frame();assert.equal(count(s),20);s.close();
});
await check('Le menu de galerie garde la pagination en pause ; après fermeture un seul lot est ajouté',async()=>{
 const s=portfolio();await s.settle();s.w.RENOV_PORTFOLIO_VIEWER.open('piscine');await flush();trigger(s,observers(s).end,{bottom:1000});await s.frame();assert.equal(count(s),10);await s.click('.work-viewer-close');await s.advance(240);await s.frame();assert.equal(count(s),20);s.close();
});
await check('Rotation et retour arrière rétablissent les bons seuils ; un ancien observateur ne peut pas ajouter de lot',async()=>{
 const s=portfolio({width:1440,height:900});await s.settle();const old=observers(s).end;s.w.innerWidth=390;s.w.innerHeight=844;await s.resized();const o=observers(s);assert.notEqual(o.end,old);assert.equal(o.end.options.rootMargin,'0px 0px 253px 0px');trigger(s,old,{bottom:1000});await s.frame();assert.equal(count(s),10);s.w.dispatchEvent(new s.w.Event('pagehide'));trigger(s,o.end,{bottom:1000});await s.frame();assert.equal(count(s),10);s.w.dispatchEvent(new s.w.PageTransitionEvent('pageshow',{persisted:true}));trigger(s,observers(s).end,{bottom:1000});await s.frame();assert.equal(count(s),20);s.close();
});
await check('Le bouton manuel garde le même ajout par dix, y compris sans IntersectionObserver',async()=>{
 const s=portfolio({scripts:[]});s.w.IntersectionObserver=undefined;s.w.eval(fs.readFileSync(path.join(root,'preferences.js'),'utf8'));s.w.eval(fs.readFileSync(path.join(root,'portfolio-data.js'),'utf8'));s.w.eval(fs.readFileSync(path.join(root,'portfolio.js'),'utf8'));await s.click('#work-more');assert.equal(count(s),20);assert.equal(s.d.activeElement,s.$('#work-grid').children[10].querySelector('a'));s.close();
});
await check('Le bouton des réalisations est placé avec le devis, avant le téléphone, avec une icône SVG et un accès direct au portfolio',async()=>{
 const s=scene({preloader:false,scripts:['preferences.js','site-header.js','page-navigation.js']});await s.settle();const button=s.$('.hero-discover'),actions=s.$('.hero-actions');assert.equal(button.parentElement,actions);assert.equal([...actions.children].indexOf(button),1);assert.equal([...actions.children].indexOf(s.$('.hero-phone')),2);assert.ok(button.classList.contains('button'));assert.ok(!button.classList.contains('text-link'));assert.equal(button.getAttribute('href'),'./projets.html');assert.equal(button.textContent.trim(),'Voir les réalisations');assert.ok(button.querySelector('svg.direction-icon'));assert.equal(s.$('#hero-image').dataset.heroId,'piscine');await s.click('.hero-discover');await s.advance(120);assert.deepEqual(s.navigations,['https://renov-bati.test/projets.html']);s.close();
});
await check('Le bouton conserve au moins 56 px de hauteur et une disposition cohérente de 320 à 3840 px, dont Duo',async()=>{
 const s=scene({preloader:false,scripts:[]});s.d.documentElement.classList.add('js');const profiles=[{w:320,h:568},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:540,h:720},{w:760,h:1024},{w:844,h:390},{w:960,h:768},{w:1100,h:900},{w:1114,h:720,hs:2,paneW:540},{w:1280,h:720},{w:1440,h:900},{w:1920,h:1080},{w:3840,h:2160}];
 for(const p of profiles){const css=styleEngine(root,s.d,{fine:p.w>760,...p}),actions=css.selected('.hero-actions'),button=css.selected('.hero-discover');assert.equal(actions.display,'grid');assert.equal(tracks(actions['grid-template-columns']).length,p.w<=1100||p.hs===2?1:2);assert.equal(button.width,'100%');assert.ok(numeric(button['min-height'],button,p)>=56);assert.equal(button['margin-top'],'0');assert.equal(button.border,'1px solid var(--gold)');assert.equal(button.color,'var(--gold)');assert.ok(button.background.includes('rgba(22,1,0,.92)'));assert.equal(button['font-size'],'13px');assert.notEqual(button['white-space'],'nowrap');}s.close();
});
const report={status:'PASS',date:'2026-10-17',checks:checks.length,coverage:checks,policy:'Lots de dix. Anticipation mobile de 30 % de la hauteur, bornée à 140–260 px ; préparation de deux images de couverture à une hauteur de fenêtre maximum avant la fin. Aucun préchargement de vidéo.',limits:['Simulation DOM, IntersectionObserver, horloge et cascade CSS ; pas de rendu navigateur ou d’appareil physique.','Les URLs de préparation et d’affichage sont comparées, sans mesure réelle du cache, des temps réseau ou des FPS.']};fs.writeFileSync(path.join(root,'documents/verification-fluidite-mobile-cta-20261017.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks}));
