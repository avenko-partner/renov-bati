import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {scene,flush,root,read,check,checks} from './review-harness.mjs';
import {styleEngine} from './renov-css-cascade-v16.mjs';

const pages=['index.html','projets.html','informations.html'];
const portfolio=options=>scene({page:'projets.html',preloader:false,scripts:['preferences.js','portfolio-data.js','portfolio.js'],...options});
const count=s=>s.$('#work-grid').children.length;
function end(s,{inside=true,bottom=s.w.innerHeight,repeat=1}={}){
 const target=s.$('.work-pagination-end'),observer=s.io.find(o=>o.targets.has(target));assert.ok(observer,'Repère observé');
 for(let i=0;i<repeat;i++)observer.cb([{target,isIntersecting:inside,intersectionRatio:inside?1:0,boundingClientRect:{top:bottom-1,bottom,height:1}}]);
}
const click=(s,selector,options={})=>{const event=new s.w.MouseEvent('click',{button:0,bubbles:true,cancelable:true,...options});s.$(selector).dispatchEvent(event);return event;};
function navigation(page,options={}){return scene({page,preloader:false,scripts:['preferences.js','page-navigation.js'],...options});}

await check('Un lot reste limité à dix tant que sa fin est sous le viewport, même à moins de 600 px',async()=>{
 const s=portfolio();await s.settle();assert.equal(count(s),10);
 const target=s.$('.work-pagination-end'),ob=s.io.find(o=>o.targets.has(target));assert.equal(s.$('#work-grid').nextElementSibling,target);assert.equal(ob.options.rootMargin,'0px');assert.equal(ob.options.threshold,1);
 for(const bottom of [s.w.innerHeight+600,s.w.innerHeight+200,s.w.innerHeight+1]){end(s,{inside:false,bottom});await s.frame();assert.equal(count(s),10);}
 s.close();
});
await check('Une arrivée à la fin ajoute exactement dix cartes ; la fin du nouveau lot doit être atteinte à son tour',async()=>{
 const s=portfolio();await s.settle();const focus=s.$('[data-work]');focus.focus();end(s,{repeat:4});assert.equal(count(s),10);await s.frame();assert.equal(count(s),20);assert.equal(s.d.activeElement,focus);
 end(s,{inside:false,bottom:3600});await s.frame();assert.equal(count(s),20);await s.advance(20000);await s.frame();assert.equal(count(s),20);
 end(s);await s.frame();assert.equal(count(s),30);assert.equal(new Set([...s.$('#work-grid').children].map(x=>x.id)).size,30);s.close();
});
await check('La fin des lots successifs révèle 10, 20, 30, 40, 50, 51 cartes puis arrête l’observation',async()=>{
 const s=portfolio();await s.settle();for(const n of [20,30,40,50,51]){end(s);await s.frame();assert.equal(count(s),n);}
 assert.equal(s.$('#work-more').hidden,true);assert.equal(s.$('.work-pagination-end').hidden,true);assert.equal(s.$('#work-progress').textContent,'51 / 51');assert.equal(s.io.filter(o=>o.targets.has(s.$('.work-pagination-end'))).length,0);s.close();
});
await check('Un saut au pied de page compte comme une fin atteinte ; les lots ne se vident pas seuls',async()=>{
 const s=portfolio();await s.settle();end(s,{inside:false,bottom:-20});await s.frame();assert.equal(count(s),20);end(s,{inside:false,bottom:2500});await s.frame();assert.equal(count(s),20);s.close();
});
await check('Bouton manuel et déclenchement automatique simultanés partagent un seul ajout et le focus manuel',async()=>{
 const s=portfolio();await s.settle();end(s);await s.click('#work-more');await s.frame();assert.equal(count(s),20);assert.equal(s.d.activeElement,s.$('#work-grid').children[10].querySelector('a'));s.close();
});
await check('Changer de filtre annule l’ajout en attente et conserve uniquement les chantiers de ce filtre',async()=>{
 const s=portfolio();await s.settle();end(s);await s.click('[data-work-filter="toitures"]');await s.frame();const list=s.w.RENOV_PORTFOLIO.filter(p=>p.category==='toitures');assert.equal(count(s),list.length);assert.deepEqual([...s.$('#work-grid').children].map(x=>x.id),Array.from(list,p=>p.id));assert.equal(s.$('.work-pagination-end').hidden,true);
 await s.click('[data-work-filter="interieurs"]');assert.equal(count(s),10);end(s,{inside:false,bottom:1600});await s.frame();assert.equal(count(s),10);end(s);await s.frame();assert.equal(count(s),s.w.RENOV_PORTFOLIO.filter(p=>p.category==='interieurs').length);s.close();
});
await check('Un onglet masqué suspend l’ajout ; il reprend à son retour si la fin est atteinte',async()=>{
 const s=portfolio();await s.settle();await s.visible(false);end(s);await s.frame();assert.equal(count(s),10);await s.visible(true);await s.frame();assert.equal(count(s),20);s.close();
});
await check('Une galerie ouverte suspend l’ajout et sa fermeture le reprend sans recadrer le média',async()=>{
 const s=portfolio();await s.settle();await s.click('[data-work]');await flush();assert.equal(s.$('#work-viewer').open,true);end(s);await s.frame();assert.equal(count(s),10);assert.ok(s.$('.work-active'));
 await s.click('.work-viewer-close');await s.advance(220);await s.frame();assert.equal(count(s),20);assert.equal(s.$('#work-viewer').open,false);s.close();
});
await check('La pagination attend la fin réelle du préloader',async()=>{
 const s=portfolio({preloader:true,scripts:['preferences.js','intro.js','portfolio-data.js','portfolio.js']});await s.settle();assert.equal(count(s),10);assert.equal(s.$('.work-pagination-end').hidden,false);assert.equal(s.io.filter(o=>o.targets.has(s.$('.work-pagination-end'))).length,0);
 await s.advance(2140);end(s);await s.frame();assert.equal(count(s),20);s.close();
});
await check('Retour arrière et absence d’IntersectionObserver gardent le bouton utilisable',async()=>{
 const s=portfolio();await s.settle();end(s);s.w.dispatchEvent(new s.w.Event('pagehide'));await s.frame();assert.equal(count(s),10);s.w.dispatchEvent(new s.w.PageTransitionEvent('pageshow',{persisted:true}));end(s);await s.frame();assert.equal(count(s),20);s.close();
 const a=scene({page:'projets.html',preloader:false,scripts:[]});a.w.IntersectionObserver=undefined;a.w.eval(read('portfolio-data.js'));a.w.eval(read('portfolio.js'));await a.click('#work-more');assert.equal(count(a),20);a.close();
});
await check('Mouvements réduits : mêmes lots, sans animations d’entrée',async()=>{
 const s=portfolio({reduced:true});await s.settle();end(s);await s.frame();assert.equal(count(s),20);assert.equal(s.animations.length,0);s.close();
});
await check('Une ancre mal encodée ne casse ni la grille ni l’ouverture des fiches',async()=>{
 const s=portfolio({hash:'#%E0%A4%A'});await s.settle();assert.ok(s.w.RENOV_PORTFOLIO_VIEWER);await s.click('[data-work]');assert.equal(s.$('#work-viewer').open,true);assert.equal(s.errors.length,0);s.close();
});

await check('Trois pages : départ couvert sans dessiner une partie du logo et destination dessinée une seule fois',async()=>{
 for(const page of pages){
  const s=navigation(page);await s.settle();const link=s.$('a[href="./'+(page==='index.html'?'projets.html':'index.html')+'"]');assert.ok(link);
  const selector='#review-navigation';link.id='review-navigation';const e=click(s,selector);assert.equal(e.reviewIntercepted,true);assert.ok(s.d.documentElement.classList.contains('page-departing'));assert.equal(s.$('#brand-intro').hidden,false);
  let css=styleEngine(root,s.d,{w:1440,h:900,fine:true});assert.equal(css.selected('.intro-center').visibility,'hidden');assert.equal(css.selected('.intro-trace').animation,'none');assert.equal(css.selected('.intro-trace').opacity,'0');
  assert.equal(s.navigations.length,0);await s.advance(119);assert.equal(s.navigations.length,0);await s.advance(1);assert.equal(s.navigations.length,1);s.close();
  const incoming=scene({page,preloader:true,scripts:['preferences.js','intro.js']});await incoming.settle();assert.ok(incoming.d.documentElement.classList.contains('intro-running'));assert.ok(!incoming.d.documentElement.classList.contains('page-departing'));
  css=styleEngine(root,incoming.d,{w:1440,h:900,fine:true});assert.ok(css.selected('.intro-trace').animation.startsWith('logo-outline'));await incoming.advance(1359);assert.equal(incoming.w.RENOV_INTRO.drawDone,false);await incoming.advance(1);assert.equal(incoming.w.RENOV_INTRO.drawDone,true);await incoming.advance(780);assert.equal(incoming.$('#brand-intro').hidden,true);assert.equal(incoming.events.filter(x=>x.event==='complete').length,1);assert.equal(incoming.errors.length,0);incoming.close();
 }
});
await check('Deux clics pendant le départ ne produisent qu’une navigation ; annulation et bfcache rendent la page utilisable',async()=>{
 for(const recovery of ['timeout','history']){const s=navigation('index.html');await s.settle();click(s,'a[href="./projets.html"]');click(s,'a[href="./projets.html"]');await s.advance(120);assert.equal(s.navigations.length,1);assert.ok(s.$('main').hasAttribute('inert'));
 if(recovery==='timeout')await s.advance(9880);else s.w.dispatchEvent(new s.w.PageTransitionEvent('pageshow',{persisted:true}));assert.ok(!s.d.documentElement.classList.contains('page-departing'));assert.ok(!s.$('main').hasAttribute('inert'));assert.equal(s.$('#brand-intro').hidden,true);s.close();}
});
await check('Les ancres, liens externes, nouvel onglet et clics modifiés ne lancent pas de transition de page',async()=>{
 const s=navigation('index.html');await s.settle();for(const selector of ['a[href="#devis"]','.agency-credit','a[href^="tel:"]','a[href^="mailto:"]'])assert.equal(click(s,selector).reviewIntercepted,false,selector);
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}])assert.equal(click(s,'a[href="./projets.html"]',options).reviewIntercepted,false);
 await s.advance(200);assert.equal(s.navigations.length,0);s.close();
});
await check('Mouvements réduits : pas de voile ni de délai ajouté aux changements de page',async()=>{
 const s=navigation('index.html',{reduced:true});await s.settle();assert.equal(click(s,'a[href="./projets.html"]').reviewIntercepted,false);assert.ok(!s.d.documentElement.classList.contains('page-departing'));assert.equal(s.navigations.length,0);s.close();
});
await check('Un lien sortant d’une galerie ferme la couche native avant de couvrir le document',async()=>{
 const s=portfolio({scripts:['preferences.js','portfolio-data.js','portfolio.js','page-navigation.js']});await s.settle();await s.click('[data-work]');assert.equal(s.$('#work-viewer').open,true);click(s,'.work-viewer-copy a');assert.equal(s.$('#work-viewer').open,false);assert.ok(s.d.documentElement.classList.contains('page-departing'));await s.advance(120);assert.equal(s.navigations.length,1);s.close();
});
await check('Le crédit Avenko partner est présent sur les trois pages et reste accessible sur les formats étroits',async()=>{
 for(const page of pages){const s=navigation(page);const credit=s.$('.footer-credit'),link=credit.querySelector('a');assert.equal(link.textContent,'Avenko partner');assert.equal(link.href,'https://avenkopartner.com/');assert.equal(link.target,'_blank');assert.ok(link.relList.contains('noopener')&&link.relList.contains('noreferrer'));assert.ok(credit.textContent.includes('© 2026 Renov Bati'));assert.ok(credit.textContent.includes('By Avenko partner'));
 for(const [w,h,hs]of [[320,568,1],[375,812,1],[540,720,1],[1114,720,2],[1440,900,1],[3840,2160,1]]){const css=styleEngine(root,s.d,{w,h,hs,fine:w>760});assert.equal(css.selected('.footer-credit')['flex-wrap'],'wrap');assert.equal(css.selected('.agency-credit')['min-height'],'44px');if(w<=640)assert.equal(css.selected('.footer-bottom').display,'block');}s.close();}
});

await check('Le formulaire rejette les injections HTML, caractères de contrôle et numéros surdimensionnés',async()=>{
 for(const [field,value]of [['firstname','<img src=x onerror=alert(1)>'],['firstname','Jean\u0000'],['lastname','Dupont\u007f'],['phone','06 12 34 56 78\u0007'],['phone',' '.repeat(50)+'0'.repeat(42)],['email','a\u0000@example.fr']]){
  const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();const values={firstname:'Élise',lastname:'D’Angelo',phone:'+33 6 12 34 56 78',email:'elise@example.fr', [field]:value};for(const [key,text]of Object.entries(values))s.$('#quote-'+key).value=text;
  s.$('#quote-form').dispatchEvent(new s.w.Event('submit',{cancelable:true,bubbles:true}));assert.equal(s.$('#quote-'+field).getAttribute('aria-invalid'),'true',field);assert.equal(s.$('#quote-form').hidden,false);assert.equal(s.$('#quote-result').hidden,true);assert.equal(s.$('#quote-summary').querySelector('img'),null);s.close();
 }
});
await check('Un devis valide prépare seulement un brouillon encodé, avec récapitulatif texte modifiable',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js']});await s.settle();for(const [key,value]of Object.entries({firstname:'Élise',lastname:'D’Angelo & Cie',phone:'+33 6 12 34 56 78',email:'elise+devis@example.fr'}))s.$('#quote-'+key).value=value;
 s.$('#quote-form').dispatchEvent(new s.w.Event('submit',{cancelable:true,bubbles:true}));assert.equal(s.$('#quote-result').hidden,false);const mail=new URL(s.$('#quote-email-link').href);assert.equal(mail.protocol,'mailto:');assert.equal(mail.pathname,'artugrul.ertan@orange.fr');assert.ok(mail.searchParams.get('body').includes('D’Angelo & Cie'));assert.ok(mail.searchParams.get('body').includes('elise+devis@example.fr'));assert.equal([...mail.searchParams].length,2);assert.equal(s.$('#quote-summary').children.length,3);await s.click('#quote-edit');assert.equal(s.$('#quote-form').hidden,false);assert.equal(s.$('#quote-firstname').value,'Élise');assert.equal(s.errors.length,0);s.close();
});

await check('Le comparateur conserve sa course complète 0 → 100 → 0 et ses commandes de pause',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','app.js','comparison-auto.js']});await s.settle();await s.intersect('#compare-stage',true);await s.frame();assert.equal(Number(s.$('#compare-range').value),0);
 for(const expected of [100,0,100,0]){for(let i=0;i<120;i++){await s.advance(75);await s.frame();}assert.ok(Math.abs(Number(s.$('#compare-range').value)-expected)<.02);}
 await s.click('.compare-auto');const value=s.$('#compare-range').value;await s.advance(2000);await s.frame();assert.equal(s.$('#compare-range').value,value);await s.click('.compare-auto');await s.frame();await s.advance(75);await s.frame();assert.ok(Number(s.$('#compare-range').value)>0);await s.motion(true);const reduced=s.$('#compare-range').value;await s.advance(2000);await s.frame();assert.equal(s.$('#compare-range').value,reduced);s.close();
});
await check('Une photo décodée remplace la précédente par fondu ; un clic plus récent attend la fin du fondu en cours',async()=>{
 const s=portfolio({autoImages:false});await s.settle();s.w.RENOV_PORTFOLIO_VIEWER.open('veranda-lumiere');const first=s.images.at(-1);first.load();await flush();assert.equal(s.$('.work-active'),first);
 await s.click('.work-viewer-thumbs button:nth-child(2)');const second=s.images.at(-1);second.hold=true;second.load();await flush();assert.equal(s.$('.work-active'),first);second.release();await flush();assert.equal(s.$('.work-active'),second);assert.equal(s.$('.work-previous'),first);assert.equal(first.style.opacity,'1');
 await s.click('.work-viewer-thumbs button:nth-child(3)');const third=s.images.at(-1);third.load();await flush();assert.equal(s.$('.work-active'),second);await s.advance(480);assert.equal(s.$('.work-active'),third);await s.advance(480);assert.equal(s.$('.work-previous'),null);assert.equal(s.$('.work-active').style.opacity,'1');assert.equal(s.$('#work-media-stage').querySelectorAll('img,video').length,1);s.close();
});
await check('Les médias ouverts et les miniatures gardent leur cadrage entier sur mobile, paysage, double segment et grand écran',async()=>{
 const s=portfolio();await s.settle();s.w.RENOV_PORTFOLIO_VIEWER.open('veranda-lumiere');await flush();
 for(const p of [{w:320,h:568},{w:375,h:812},{w:540,h:720},{w:844,h:390},{w:1114,h:720,hs:2,paneW:540},{w:1440,h:900},{w:3840,h:2160}]){const css=styleEngine(root,s.d,{fine:true,...p});assert.equal(css.selected('.work-active')['object-fit'],'contain');assert.equal(css.selected('.work-active').width,'100%');assert.equal(css.selected('.work-active').height,'100%');assert.equal(css.selected('.work-active')['max-height'],'100%');assert.equal(css.selected('.work-viewer-thumbs img')['object-fit'],'contain');assert.equal(css.selected('.site-work')['overflow-anchor'],'none');}
 s.close();
});

const report={status:'PASS',date:'2026-10-17',checks:checks.length,coverage:checks,environment:'Simulation DOM, horloge et chargements contrôlés, événements IntersectionObserver simulés, analyse de cascade CSS. La navigation assign est instrumentée dans le test uniquement.',limits:['Pas de rendu dans un navigateur ni sur appareil physique.','Le seuil est simulé depuis des rectangles explicites, sans mesure de défilement réelle.','Aucune mesure FPS, Core Web Vitals ou test d’intrusion distant.']};
const reportPath=path.join(root,'documents/verification-navigation-videos-20261017.json');fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,report:reportPath}));
