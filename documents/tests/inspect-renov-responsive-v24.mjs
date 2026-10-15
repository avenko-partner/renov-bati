import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {styleEngine,numeric,tracks,tokenize} from './renov-css-cascade-v16.mjs';
const root=process.argv[2]||'/workspace/sites/renov-bati-premium/dist';
const output=process.argv[3]||path.join(root,'../documents/verification-geometrie-responsive-v24.json');
const profiles=[[320,480],[320,568],[360,640],[375,667],[390,844],[414,896],[430,932],[480,800],[540,720],[600,800],[640,900],[641,900],[700,900],[760,1024],[761,1024],[768,1024],[820,1180],[900,1200],[960,768],[961,768],[1024,768],[1100,800],[1101,800],[1280,800],[1440,900],[1680,1050],[1920,1080],[2560,1440],[568,320],[667,375],[844,390],[932,430],[1024,600]].map(([w,h])=>({w,h,fine:w>960}));
profiles.push({w:1114,h:720,hs:2,paneW:540,paneH:720},{w:1440,h:900,hs:2,paneW:700,paneH:900},{w:1000,h:720,hs:2,paneW:320,paneH:720},{w:540,h:1114,vs:2,paneW:540,paneH:540});
profiles.push({w:390,h:844,safeTop:47,safeBottom:34},{w:430,h:932,safeTop:59,safeBottom:34},{w:844,h:390,safeLeft:44,safeRight:44,safeBottom:21});
const records=[];
for(const p of profiles){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')),d=dom.window.document;d.documentElement.classList.add('js');d.querySelector('#hero-switcher').classList.add('is-ready');
 const c=styleEngine(root,d,p),num=(props,name,percent)=>numeric(props[name],props,p,{percent:percent??p.w});
 const lane=p.hs===2?p.paneW:p.w,shell=c.selected('.projects-section'),padding=num(shell,'padding-left')+num(shell,'padding-right'),content=Math.min(lane,1680)-padding;
 const stage=c.selected('.hero-stage'),layout=c.selected('.hero-layout'),title=c.selected('.hero-copy h1'),main=c.selected('.hero-main'),header=c.selected('.header-inner');
 const columns=tracks(layout['grid-template-columns']),gap=num(layout,'column-gap'),layoutWidth=lane-num(layout,'padding-left')-num(layout,'padding-right');
 const introWidth=columns.length===1?layoutWidth:(layoutWidth-gap)*columns[0]/columns.reduce((a,b)=>a+b,0);
 const intro=c.selected('.hero-intro');let titleWidth=introWidth;if(intro['max-width']&&intro['max-width']!=='none')titleWidth=Math.min(titleWidth,num(intro,'max-width'));
 const selected=c.selected('#hero-switcher'),selectorColumns=tracks(selected['grid-template-columns']).length;
 const gallery=c.selected('.project-grid'),services=c.selected('.expertise-columns article'),fields=c.selected('.quote-fields'),footer=c.selected('.footer-top'),materials=c.selected('.material-layout');
 const headingSelectors=['.expertise-heading h2','.projects-heading h2','.transformation-copy h2','.warranty-heading h2','.contact-copy h2','.territory-heading h2'];
 const headings=headingSelectors.map(selector=>{const props=c.selected(selector);return {selector,size:num(props,'font-size')};});
 const rec={...p,reading_width:lane,content_width:content,header_height:num(header,'height'),hero_columns:columns.length,hero_title_size:num(title,'font-size'),hero_title_width:titleWidth,hero_line_whitespace:c.selected('.hero-line-inner')['white-space'],selector_columns:selectorColumns,photo_height:main.position==='relative'?num(main,'height'):null,gallery_columns:tracks(gallery['grid-template-columns']).length,service_columns:services.display==='flex'?1:tracks(services['grid-template-columns']).length,quote_columns:tracks(fields['grid-template-columns']).length,footer_columns:tokenize(footer['grid-template-columns']).length,material_columns:tracks(materials['grid-template-columns']).length,headings};
 assert.ok(content>0);assert.ok(rec.hero_title_width>0);assert.equal(rec.header_height,num(header,'--header-size'));assert.ok(rec.header_height>=70&&rec.header_height<=108);assert.ok(rec.hero_title_size>=36&&rec.hero_title_size<=88);
 const compact=p.w<=640||p.hs===2;
 if(compact){assert.equal(rec.gallery_columns,1,JSON.stringify(rec));assert.equal(rec.quote_columns,1,JSON.stringify(rec));assert.equal(rec.material_columns,1,JSON.stringify(rec));assert.equal(rec.footer_columns,2);}
 if(p.w<=760||p.hs===2){assert.equal(rec.hero_columns,1);assert.equal(rec.selector_columns,3);assert.equal(rec.hero_line_whitespace,'normal');}
 if(p.w>1100&&p.hs!==2){assert.equal(rec.hero_columns,2);assert.equal(rec.gallery_columns,6);assert.equal(rec.quote_columns,2);}
 const landscape=p.w<=960&&p.h<=540&&p.w>p.h;
 if(landscape){assert.ok(rec.photo_height<=230);assert.equal(rec.header_height,70);assert.ok(rec.hero_title_size<=46);}
 if((p.w<=760||p.hs===2)&&!landscape)assert.ok(rec.photo_height>=220&&rec.photo_height<=420);
 const menu=c.selected('.main-nav'),dialog=c.selected('.project-dialog'),introSvg=c.selected('.intro-emblem');
 if(p.w<=1100||p.hs===2){const max=num(menu,'max-height');assert.ok(max>0&&max<=(p.vs===2?p.paneH:p.h)-rec.header_height-(p.safeTop||0)+1e-6,JSON.stringify({profile:p,max,header:rec.header_height,value:menu['max-height']}));rec.menu_height_limit=max;}
 rec.dialog_width_limit=num(dialog,'max-width',lane);assert.ok(rec.dialog_width_limit<=lane-20&&rec.dialog_width_limit>0);
 rec.dialog_height_limit=num(dialog,'max-height',p.h);assert.ok(rec.dialog_height_limit>0);if(p.vs===2)assert.ok(rec.dialog_height_limit<=p.paneH-20);
 if(p.hs===2){assert.ok(rec.dialog_width_limit<=p.paneW-20);const overlay=c.selected('.brand-intro');assert.equal(num(overlay,'width'),p.paneW);}
 rec.preloader_logo_height=num(introSvg,'height');assert.ok(rec.preloader_logo_height<(p.vs===2?p.paneH:p.h));
 rec.touch_targets={};for(const selector of ['.brand','.menu-toggle','.header-quote','.hero-switcher button','.compare-toolbar button','.project-filters button','.dialog-close','.project-dialog-controls button','.footer-address a','.footer-top nav a']){const props=c.selected(selector);const minimum=Math.max(num(props,'min-height'),props.height&&props.height!=='auto'?num(props,'height'):0);assert.ok(minimum>=44,selector);rec.touch_targets[selector]=minimum;}records.push(rec);dom.window.close();
}
const report={status:'PASS',date:'2026-10-13',version:24,profiles:records.length,method:'Lecture de la cascade CSS avec sélecteurs DOM, spécificité, règles media, variables et calculs des largeurs disponibles. Aucune mise en page par moteur de navigateur.',limits:['Ces profils sont des tailles CSS et des segments simulés, pas des appareils physiques.','Les calculs ne vérifient pas les retours à la ligne réels, les pixels affichés, le zoom natif ou le clavier virtuel.'],records};fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,profiles:report.profiles,output}));
