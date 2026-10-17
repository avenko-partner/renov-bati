(() => {
 'use strict';
 const projects=window.RENOV_PORTFOLIO;if(!projects?.length)return;
 const $=(s,scope=document)=>scope.querySelector(s),reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 const byId=new Map();projects.forEach(p=>{byId.set(p.id,p);p.aliases.forEach(id=>byId.set(id,p));});
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg>';
 const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
 function counts(p){const photos=p.media.filter(m=>m.kind==='photo').length,films=p.media.length-photos;return [photos?`${photos} photo${photos>1?'s':''}`:'',films?`${films} film${films>1?'s':''}`:''].filter(Boolean).join(' · ');}
 const grid=$('#work-grid'),filters=[...document.querySelectorAll('[data-work-filter]')];let filter='all',limit=10,filterEffect=null;
 function card(p,index){
  const m=p.media.find(m=>m.id===p.cover),article=document.createElement('article');article.className='work-card'+(m.kind==='video'?' work-card-video':'');article.id=p.id;
  const link=document.createElement('a');link.className='work-card-link';link.href='#'+p.id;link.dataset.work=p.id;link.setAttribute('aria-haspopup','dialog');link.setAttribute('aria-label',p.title+' — '+counts(p));
  const frame=document.createElement('div');frame.className='work-card-frame';const image=new Image();image.src=m.kind==='photo'?m.src:(m.poster||m.thumb);image.alt=p.title;image.width=m.posterWidth||m.width;image.height=m.posterHeight||m.height;image.loading='lazy';image.decoding='async';
  if(m.kind==='photo'&&m.thumb!==m.src){const thumbWidth=m.thumb.startsWith('./assets/photos')?Math.min(720,m.width):Math.round(m.width*Math.min(420/m.width,520/m.height));image.srcset=`${m.thumb} ${thumbWidth}w, ${m.src} ${m.width}w`;image.sizes='(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 48vw';}
  let visual=image;
  if(m.kind==='video'&&m.poster){
   image.srcset=`${m.thumb} ${m.thumbWidth}w, ${m.poster} ${m.posterWidth}w`;image.sizes='(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 48vw';image.style.objectPosition=m.coverPosition||'center';
   if(m.coverDetail){
    const views=document.createElement('div'),detail=new Image();views.className='work-cover-views';detail.className='work-cover-detail';detail.src=m.coverDetail;detail.alt='';detail.setAttribute('aria-hidden','true');detail.width=m.coverDetailWidth;detail.height=m.coverDetailHeight;detail.loading='lazy';detail.decoding='async';views.append(image,detail);visual=views;
   }
  }
  const count=document.createElement('span');count.className='work-count';count.textContent=counts(p);const open=document.createElement('span');open.className='work-card-open';open.setAttribute('aria-hidden','true');open.innerHTML=arrow;frame.append(visual,count,open);
  const caption=document.createElement('div');caption.className='work-card-caption';const text=document.createElement('div'),label=document.createElement('p'),title=document.createElement('h2'),number=document.createElement('span');label.textContent=p.label;title.textContent=p.title;number.className='work-index';number.setAttribute('aria-hidden','true');number.textContent=String(index+1).padStart(2,'0');text.append(label,title);caption.append(text,number);link.append(frame,caption);article.append(link);return article;
 }
 function render({append=false,focus=false,hydrate=false}={}){
  if(!grid)return;const list=projects.filter(p=>filter==='all'?p.category!=='inspirations':p.category===filter),shown=list.slice(0,limit),previous=grid.children.length;
  if(!hydrate){if(!append)grid.replaceChildren();shown.slice(append?previous:0).forEach((p,i)=>grid.append(card(p,(append?previous:0)+i)));}
  $('#work-result').textContent=filter==='inspirations'?`${list.length} sélection d’ambiances`:`${list.length} réalisations`;
  $('#work-progress').textContent=`${shown.length} / ${list.length}`;$('#work-more').hidden=shown.length>=list.length;
  if(focus)grid.children[previous]?.querySelector('a')?.focus({preventScroll:true});
 }
 if(grid){
  const more=$('#work-more'),sentinel=more.closest('.work-more');
  let observer=null,autoFrame=0,nearEnd=false,pageActive=true;
  const appendEffects=new Set();
  function cancelAppendEffects(){appendEffects.forEach(effect=>effect.cancel());appendEffects.clear();}
  function watchEnd(){
   if(!observer)return;observer.disconnect();nearEnd=false;
   if(pageActive&&!more.hidden)observer.observe(sentinel);
  }
  function addBatch(focus=false){
   if(more.hidden)return;
   const start=grid.children.length;limit+=10;render({append:true,focus});nearEnd=false;
   if(!reduced()){
    [...grid.children].slice(start).forEach((node,i)=>{
     if(typeof node.animate!=='function')return;
     const effect=node.animate([{opacity:.6,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:Math.min(i,4)*25,easing:'cubic-bezier(.22,.75,.22,1)',fill:'backwards'});
     appendEffects.add(effect);effect.finished?.then(()=>appendEffects.delete(effect),()=>appendEffects.delete(effect));
    });
   }
   watchEnd();
  }
  function queueBatch(){
   if(autoFrame||!nearEnd||more.hidden||!pageActive||document.hidden||document.documentElement.classList.contains('intro-pending')||document.body.classList.contains('dialog-open'))return;
   autoFrame=requestAnimationFrame(()=>{autoFrame=0;if(nearEnd&&!document.hidden&&!document.body.classList.contains('dialog-open')&&pageActive)addBatch(false);});
  }
  function startAuto(){
   if(observer||typeof IntersectionObserver!=='function')return;
   observer=new IntersectionObserver(entries=>{
    const entry=entries.find(e=>e.target===sentinel);if(!entry)return;
    nearEnd=entry.isIntersecting;queueBatch();
   },{rootMargin:'0px 0px 600px 0px',threshold:0});watchEnd();
  }
  render({hydrate:grid.children.length===10});
  filters.forEach(b=>b.addEventListener('click',()=>{
   cancelAnimationFrame(autoFrame);autoFrame=0;cancelAppendEffects();
   filter=b.dataset.workFilter;limit=10;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterEffect?.cancel();render();watchEnd();
   if(!reduced()&&typeof grid.animate==='function'){filterEffect=grid.animate([{opacity:.5},{opacity:1}],{duration:240,easing:'ease-out'});filterEffect.finished?.catch(()=>{});}
  }));
  more.addEventListener('click',()=>{cancelAnimationFrame(autoFrame);autoFrame=0;addBatch(true);});
  if(document.documentElement.classList.contains('intro-pending'))document.addEventListener('renov-intro-complete',startAuto,{once:true});else startAuto();
  document.addEventListener('renov-gallery-change',queueBatch);
  document.addEventListener('visibilitychange',queueBatch);
  document.addEventListener('renov-motion-change',()=>{if(reduced())cancelAppendEffects();});
  window.addEventListener('pagehide',()=>{pageActive=false;cancelAnimationFrame(autoFrame);autoFrame=0;observer?.disconnect();cancelAppendEffects();});
  window.addEventListener('pageshow',event=>{if(event.persisted){pageActive=true;watchEnd();}});
 }
 // One native dialog serves every project and every home-page shortcut.
 const dialog=document.createElement('dialog');dialog.id='work-viewer';dialog.className='work-viewer';dialog.setAttribute('aria-labelledby','work-viewer-title');
 dialog.innerHTML=`<div class="work-viewer-top"><p class="work-viewer-label" id="work-viewer-label"></p><button type="button" class="work-viewer-close" aria-label="Fermer le chantier">Fermer ${icon('M6 6l12 12M6 18 18 6')}</button></div><div class="work-viewer-layout"><div class="work-viewer-main"><div class="work-media-stage" id="work-media-stage"><div class="work-media-status" role="status" hidden></div></div><div class="work-media-controls"><p class="work-media-counter" aria-live="polite"></p><p class="work-media-type"></p><div><button type="button" data-work-prev aria-label="Média précédent">${icon('M19 12H5m6-6-6 6 6 6')}</button><button type="button" data-work-next aria-label="Média suivant">${icon('M5 12h14m-6-6 6 6-6 6')}</button><button type="button" data-work-expand aria-label="Agrandir le média" aria-pressed="false">${icon('M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5')}</button></div></div></div><aside class="work-viewer-copy"><h2 id="work-viewer-title"></h2><p class="work-viewer-description"></p><ul class="work-viewer-details"></ul><div class="work-viewer-thumbs" role="group" aria-label="Photos et films du chantier"></div><a class="text-link" href="./index.html#devis">Parlons de votre projet ${arrow}</a></aside></div>`;document.body.append(dialog);
 const stage=$('#work-media-stage',dialog),status=$('.work-media-status',dialog),thumbs=$('.work-viewer-thumbs',dialog),counter=$('.work-media-counter',dialog),type=$('.work-media-type',dialog),previous=$('[data-work-prev]',dialog),next=$('[data-work-next]',dialog),expand=$('[data-work-expand]',dialog);
 let project=null,current=0,desired=0,sequence=0,pending=null,active=null,opener=null,closing=false,closeTimer=0,closeSequence=0,gesture=null,opening=null;
 let transition=null,queued=null,loadNoticeTimer=0;const effects=new Set();
 const phaseLabel=m=>({before:'Avant les travaux',work:'Pendant les travaux',after:'Après les travaux'}[m.phase]||'');
 function animate(node,frames,options){if(reduced()||!node?.animate)return null;const effect=node.animate(frames,{duration:320,easing:'cubic-bezier(.22,.7,.22,1)',fill:'backwards',...options});effects.add(effect);effect.finished?.then(()=>effects.delete(effect),()=>effects.delete(effect));return effect;}
 function cancelEffects(){effects.forEach(e=>{try{e.cancel();}catch{}});effects.clear();}
 function clearLoadNotice(){clearTimeout(loadNoticeTimer);loadNoticeTimer=0;}
 function cancelPending(){sequence++;pending?.();pending=null;clearLoadNotice();if(queued){discard(queued.node);queued=null;}}
 function discard(node){if(!node)return;if(node.tagName==='VIDEO'){node.pause();node.removeAttribute('src');node.load();}node.remove();}
 function announce(text,retry=false){status.replaceChildren(document.createTextNode(text));status.hidden=!text;if(retry){const br=document.createElement('br'),button=document.createElement('button');button.type='button';button.textContent='Réessayer';button.addEventListener('click',()=>request(desired));status.append(br,button);}}
 function finishTransition(t){
  if(transition!==t)return;
  transition=null;clearTimeout(t.timer);
  // Set the resting style before releasing the animation: no transparent frame.
  t.node.style.opacity='1';t.node.style.zIndex='1';t.node.style.willChange='';
  try{t.effect.cancel();}catch{}
  discard(t.old);
  const ready=queued;queued=null;
  if(ready)present(ready.node,ready.index,ready.token);
 }
 function resetMedia(){
  const t=transition;transition=null;
  if(t){clearTimeout(t.timer);try{t.effect.cancel();}catch{}discard(t.old);}
  if(queued){discard(queued.node);queued=null;}
  [...stage.querySelectorAll('img,video')].forEach(discard);active=null;
 }
 function present(node,index,token){
  if(token!==sequence||!dialog.open||closing){discard(node);return;}
  clearLoadNotice();announce('');
  // Let an ongoing dissolve finish. Only the most recent decoded view is queued.
  if(transition){if(queued)discard(queued.node);queued={node,index,token};return;}
  const old=active,canFade=old&&!reduced()&&typeof node.animate==='function';
  active=node;current=index;node.className='work-active';node.style.opacity=canFade?'0':'1';node.style.zIndex=canFade?'2':'1';
  if(old){old.className='work-previous';old.style.opacity='1';old.style.zIndex='1';}
  stage.insertBefore(node,status);clearLoadNotice();announce('');stage.removeAttribute('aria-busy');
  const m=project.media[index],phase=phaseLabel(m);
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(project.media.length).padStart(2,'0')}`;
  type.textContent=m.kind==='video'?`Film${phase?' · '+phase.replace(' les travaux',''):''} · sans son`:(phase||'Photographie');
  type.title=m.kind==='video'?`${m.duration} secondes · sans son`:phase;
  [...thumbs.children].forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
  if(canFade){
   // Both media layers fill the same fixed stage. Its opaque background is part
   // of the incoming layer, so changing portrait/landscape ratios leaves no ghost edges.
   node.style.willChange='opacity';
   const effect=node.animate([{opacity:0},{opacity:1}],{duration:480,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
   const t={node,old,effect,timer:0};transition=t;
   effect.finished.then(()=>finishTransition(t),()=>finishTransition(t));
   t.timer=setTimeout(()=>finishTransition(t),560);
  }else discard(old);
  if(node.tagName==='VIDEO')node.play().catch(()=>{});
 }
 function request(index){
  if(!project||!dialog.open||closing)return;cancelPending();const token=sequence;desired=(index+project.media.length)%project.media.length;const target=desired,m=project.media[target];stage.setAttribute('aria-busy','true');
  announce(active?'':'Chargement…');
  if(active)loadNoticeTimer=setTimeout(()=>{if(token===sequence)announce('Chargement…');},400);
  if(active?.tagName==='VIDEO')active.pause();
  const image=new Image();let alive=true;
  const cleanup=()=>{alive=false;clearTimeout(timer);image.onload=image.onerror=null;if(pending===abort)pending=null;};
  const abort=()=>{cleanup();image.removeAttribute('src');};
  const fail=()=>{if(!alive||token!==sequence)return;cleanup();clearLoadNotice();stage.removeAttribute('aria-busy');announce(m.kind==='video'?'Le film ne peut pas être chargé.':'Cette photographie ne peut pas être chargée.',true);};
  const timer=setTimeout(fail,15000);pending=abort;
  image.alt=project.title+' — '+(phaseLabel(m)||'vue '+(target+1));image.width=m.width;image.height=m.height;image.decoding='async';image.onerror=fail;
  image.onload=async()=>{
   try{await image.decode?.();}catch{if(!image.naturalWidth){fail();return;}}
   if(!alive||token!==sequence||!dialog.open||closing)return;cleanup();
   if(m.kind==='photo'){present(image,target,token);return;}
   const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.setAttribute('muted','');video.controls=true;video.playsInline=true;video.preload='none';video.poster=m.poster||m.thumb;video.width=m.width;video.height=m.height;video.setAttribute('aria-label',project.title+' — film sans son');video.src=m.src;
   video.addEventListener('error',()=>{if(active===video&&dialog.open)announce('Le film ne peut pas être chargé.',true);},{once:true});present(video,target,token);
  };
  // Decode the video poster too; never replace a visible view with an empty player.
  image.src=m.kind==='photo'?m.src:(m.poster||m.thumb);
 }
 function setExpanded(value){dialog.classList.toggle('is-expanded',value);expand.setAttribute('aria-pressed',String(value));expand.setAttribute('aria-label',value?'Revenir à la galerie':'Agrandir le média');}
 function open(id,source=null){
  const selected=byId.get(id);if(!selected)return false;cancelPending();++closeSequence;clearTimeout(closeTimer);closing=false;cancelEffects();resetMedia();project=selected;opener=source||document.activeElement;desired=current=0;setExpanded(false);
  $('#work-viewer-title').textContent=project.title;$('#work-viewer-label').textContent=project.label+' / '+counts(project);$('.work-viewer-description',dialog).textContent=project.description;
  const details=$('.work-viewer-details',dialog);details.replaceChildren();project.details.forEach(text=>{const li=document.createElement('li');li.textContent=text;details.append(li);});thumbs.replaceChildren();
  project.media.forEach((m,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`${phaseLabel(m)?phaseLabel(m)+' — ':''}${m.kind==='video'?'Film':'Photo'} ${i+1} sur ${project.media.length}`);button.setAttribute('aria-current',String(i===0));const image=new Image();image.src=m.thumb;image.alt='';image.width=m.width;image.height=m.height;image.loading='lazy';image.decoding='async';button.append(image);if(m.kind==='video'){const play=document.createElement('span');play.className='work-thumb-film';play.innerHTML='<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 3 13 8 5 13Z" fill="currentColor"/></svg>';play.setAttribute('aria-hidden','true');button.append(play);}button.addEventListener('click',()=>request(i));thumbs.append(button);});previous.disabled=next.disabled=project.media.length<2;
  if(!dialog.open){document.dispatchEvent(new CustomEvent('renov-close-menu'));dialog.showModal();document.body.classList.add('dialog-open','work-dialog-open');opening=animate(dialog,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280});}dialog.scrollTop=0;$('.work-viewer-copy',dialog).scrollTop=0;thumbs.scrollLeft=0;document.dispatchEvent(new CustomEvent('renov-gallery-change'));request(0);return true;
 }
 function finishClose(){clearTimeout(closeTimer);closeTimer=0;cancelPending();cancelEffects();resetMedia();if(dialog.open)dialog.close();closing=false;document.body.classList.remove('dialog-open','work-dialog-open');setExpanded(false);document.dispatchEvent(new CustomEvent('renov-gallery-change'));if(opener?.isConnected)opener.focus?.({preventScroll:true});}
 function close(){if(!dialog.open||closing)return;closing=true;const closeToken=++closeSequence;cancelPending();if(active?.tagName==='VIDEO')active.pause();const effect=animate(dialog,[{opacity:1},{opacity:0}],{duration:180,easing:'ease-in'});if(effect){const done=()=>{if(closeToken===closeSequence)finishClose();};effect.finished?.then(done,done);closeTimer=setTimeout(done,220);}else finishClose();}
 $('.work-viewer-close',dialog).addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();if(dialog.classList.contains('is-expanded'))setExpanded(false);else close();});dialog.addEventListener('close',()=>{if(project&&!closing){finishClose();}});
 previous.addEventListener('click',()=>request(desired-1));next.addEventListener('click',()=>request(desired+1));expand.addEventListener('click',()=>setExpanded(!dialog.classList.contains('is-expanded')));
 dialog.addEventListener('keydown',e=>{if(e.target.tagName==='VIDEO'||e.ctrlKey||e.altKey||e.metaKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();request(desired+(e.key==='ArrowLeft'?-1:1));}});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
 stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.isPrimary===false||active?.tagName==='VIDEO')return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY};});stage.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.5)request(desired+(dx<0?1:-1));});stage.addEventListener('pointercancel',()=>{gesture=null;});
 document.addEventListener('click',e=>{const link=e.target.closest?.('[data-work],[data-project]');if(!link||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const id=link.dataset.work||link.dataset.project;if(!byId.has(id))return;e.preventDefault();open(id,link);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active?.tagName==='VIDEO')active.pause();});document.addEventListener('renov-motion-change',()=>{cancelEffects();filterEffect?.cancel();if(reduced()&&transition)finishTransition(transition);});window.addEventListener('pagehide',finishClose);
 // Existing project anchors still open the matching group, including old names.
 if(grid){const id=decodeURIComponent(location.hash.slice(1));if(byId.has(id)){if(document.documentElement.classList.contains('intro-pending'))document.addEventListener('renov-intro-complete',()=>open(id),{once:true});else open(id);}}
 window.RENOV_PORTFOLIO_VIEWER={open,close};
})();
