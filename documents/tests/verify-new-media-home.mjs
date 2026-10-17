import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {scene,flush,root,read} from './review-harness.mjs';import {styleEngine} from './renov-css-cascade-v16.mjs';
const checks=[];async function check(name,fn){await fn();checks.push(name);}
const scripts=['content.js','preferences.js','site-header.js','app.js','portfolio-data.js','portfolio.js','hero-gallery.js'];
const expected=['bain-blanc-or','bain-noir-blanc','terrasse-stores'];
await check('Les trois nouvelles réalisations sont visibles dans le premier lot avec des couvertures et détails locaux',async()=>{
 const s=scene({page:'projets.html',preloader:false,scripts:['preferences.js','portfolio-data.js','portfolio.js']});await s.settle();assert.equal(s.$('#work-grid').children.length,10);assert.equal(s.$('#work-progress').textContent,'10 / 51');assert.equal(s.$('#work-result').textContent,'51 réalisations');assert.equal(s.d.querySelectorAll('video').length,0);
 for(const id of expected){const card=s.d.getElementById(id);assert.ok(card);const project=s.w.RENOV_PORTFOLIO.find(p=>p.id===id),m=project.media[0];assert.equal(project.cover,m.id);assert.equal(card.querySelector('.work-count').textContent,'1 film');assert.ok(card.querySelector('img').src.endsWith(m.poster.slice(1)));assert.equal(card.querySelector('.work-cover-views').children.length,2);assert.ok(!card.innerHTML.includes('.mp4'));}
 s.close();
});
await check('Chaque nouveau film se lit seulement dans sa fiche, sans son, avec commandes et arrêt à la fermeture',async()=>{
 const s=scene({page:'projets.html',preloader:false,scripts:['preferences.js','portfolio-data.js','portfolio.js']});await s.settle();
 for(const id of expected){await s.click('#'+id+' [data-work]');await flush();const dialog=s.$('#work-viewer'),video=s.$('.work-active');assert.equal(dialog.open,true);assert.equal(video.tagName,'VIDEO');assert.equal(video.muted,true);assert.equal(video.defaultMuted,true);assert.equal(video.controls,true);assert.equal(video.playsInline,true);assert.equal(video.preload,'none');assert.equal(video.paused,false);assert.equal(s.$('.work-media-counter').textContent,'01 / 01');assert.ok(s.$('.work-media-type').textContent.includes('sans son'));assert.ok(s.$('[data-work-next]').disabled);assert.ok(s.$('[data-work-prev]').disabled);await s.click('.work-viewer-close');await s.advance(240);assert.equal(dialog.open,false);assert.equal(video.paused,true);assert.equal(video.hasAttribute('src'),false);assert.equal(s.d.querySelectorAll('video').length,0);}
 assert.equal(s.errors.length,0);s.close();
});
await check('Les huit cartes et les trois photos des métiers ouvrent exactement les chantiers de leurs images',async()=>{
 const s=scene({preloader:false,scripts});await s.settle();const links=[...s.d.querySelectorAll('[data-project-card] .project-open,.expertise-photo')];assert.equal(links.length,11);
 for(const link of links){const id=link.dataset.project,project=s.w.RENOV_PORTFOLIO.find(p=>p.id===id);assert.ok(project,id);const src=link.querySelector('img').getAttribute('src');assert.ok(project.media.some(m=>m.src===src),id+' '+src);link.click();await flush();assert.equal(s.$('#work-viewer-title').textContent,project.title);assert.equal(s.$('.work-viewer-thumbs').children.length,project.media.length);await s.click('.work-viewer-close');await s.advance(240);}
 assert.equal(s.errors.length,0);s.close();
});
await check('La nouvelle ouverture garde une boucle de 4,5 secondes, les légendes et cadrages synchronisés',async()=>{
 const s=scene({preloader:false,scripts:['content.js','preferences.js','hero-gallery.js']});await s.settle();assert.equal(s.$('#hero-image').dataset.heroId,'piscine');
 for(const id of ['veranda-lumiere','cuisine','piscine','veranda-lumiere','cuisine','piscine']){await s.advance(4499);const previous=s.$('#hero-image').dataset.heroId;assert.notEqual(previous,id);await s.advance(1);assert.equal(s.$('#hero-image').dataset.heroId,id);assert.equal(s.$('#hero-selected-project').dataset.project,id);assert.equal(s.$('[data-hero-view="'+id+'"]').getAttribute('aria-pressed'),'true');assert.equal(s.$('#hero-image').style.objectPosition,s.$('[data-hero-view="'+id+'"]').dataset.heroPosition);assert.ok(!s.$('#hero-image').src.includes('hero-bain-pierre'));}
 assert.equal(s.errors.length,0);s.close();
});
await check('Les images principales des sections de l’accueil sont distinctes, hors miniatures et logos',async()=>{
 const s=scene({preloader:false,scripts:[]});const nodes=[...s.d.querySelectorAll('#hero-image,[data-project-card] img,.expertise-photo img,.material-layout img,.compare-after img,.compare-before img,.dual-screen-photo')];const paths=nodes.map(n=>n.getAttribute('src'));assert.equal(new Set(paths).size,paths.length);assert.equal(s.d.querySelectorAll('[data-project-card][data-category="interieur"]').length,2);assert.equal(s.d.querySelectorAll('[data-project-card][data-category="professionnel"]').length,1);assert.equal(s.d.querySelectorAll('[data-project-card][data-category="exterieur"]').length,5);assert.ok(s.$('.expertise-photo').dataset.project==='maconnerie-construction');assert.equal(s.$('.material-copy a').dataset.project,'demeure-pierre');s.close();
});
await check('Les vidéos ouvertes gardent leurs proportions et leur cadrage entier sur les principaux formats',async()=>{
 const s=scene({page:'projets.html',preloader:false,scripts:['preferences.js','portfolio-data.js','portfolio.js']});await s.settle();
 const profiles=[{w:320,h:568},{w:375,h:812},{w:430,h:932},{w:540,h:720},{w:844,h:390},{w:1114,h:720,hs:2,paneW:540},{w:1280,h:720},{w:1920,h:1080},{w:3840,h:2160}];
 for(const id of expected){s.w.RENOV_PORTFOLIO_VIEWER.open(id);await flush();for(const p of profiles){const css=styleEngine(root,s.d,{fine:true,...p});assert.equal(css.selected('.work-active')['object-fit'],'contain');assert.equal(css.selected('.work-active').width,'100%');assert.equal(css.selected('.work-active').height,'100%');assert.equal(css.selected('.work-active')['max-height'],'100%');}await s.click('.work-viewer-close');await s.advance(240);}
 s.close();
});
const report={status:'PASS',date:'2026-10-17',checks:checks.length,coverage:checks,limitations:['Simulation DOM, horloge et cascade CSS ; pas de rendu navigateur ni d’appareil physique.','La lecture et l’arrêt sont vérifiés par événements simulés ; la validité des fichiers, l’absence d’audio et le décodage complet sont vérifiés séparément par FFmpeg/ffprobe.']};fs.writeFileSync(path.join(root,'documents/verification-integration-films-accueil-20261017.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks}));
