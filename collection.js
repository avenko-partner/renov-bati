(() => {
 'use strict';
 const items=window.RENOV_COLLECTION,grid=document.querySelector('#collection-grid');if(!items?.length||!grid)return;
 const $=s=>document.querySelector(s),filters=[...document.querySelectorAll('[data-collection-filter]')],dialog=$('#collection-dialog'),content=$('#collection-content');
 const size=12;let page=0,filter='all',selection=[],position=0,opener=null,activeMedia=null;
 const list=()=>items.filter(m=>filter==='all'||(filter==='video'?m.kind==='video':m.category===filter));
 function render(focus=false){
  const all=list(),pages=Math.max(1,Math.ceil(all.length/size));page=Math.min(Math.max(0,page),pages-1);grid.replaceChildren();
  all.slice(page*size,(page+1)*size).forEach(m=>{
   const button=document.createElement('button');button.type='button';button.className='collection-card';button.dataset.media=m.id;
   button.setAttribute('aria-label',(m.kind==='video'?'Lire le film : ':'Agrandir : ')+m.title);
   const frame=document.createElement('span');frame.className='collection-card-frame';const img=new Image();img.src=m.thumb;img.alt=m.title;img.width=m.width;img.height=m.height;img.loading='lazy';img.decoding='async';frame.append(img);
   const kind=document.createElement('span');kind.className='collection-kind';kind.textContent=m.kind==='video'?`▶ Film · ${m.duration} s`:m.category==='ambiances'?'Inspiration':'Photographie';frame.append(kind);
   const title=document.createElement('span');title.className='collection-card-title';title.textContent=m.title;button.append(frame,title);button.addEventListener('click',()=>{selection=all;position=selection.indexOf(m);opener=button;show();});grid.append(button);
  });
  $('#collection-prev').disabled=page===0;$('#collection-next').disabled=page===pages-1;$('#collection-page').textContent=`${page+1} / ${pages}`;
  $('#collection-status').textContent=`${all.length} médias · ${page*size+1} à ${Math.min((page+1)*size,all.length)}`;
  if(focus){const first=grid.querySelector('button');first?.focus({preventScroll:true});$('#collection').scrollIntoView({behavior:window.RENOV_MOTION?.reduced()?'instant':'smooth',block:'start'});}
 }
 filters.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.collectionFilter;page=0;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
 $('#collection-prev').addEventListener('click',()=>{page--;render(true);});$('#collection-next').addEventListener('click',()=>{page++;render(true);});
 function release(){if(activeMedia?.tagName==='VIDEO'){activeMedia.pause();activeMedia.removeAttribute('src');activeMedia.load();}activeMedia=null;content.replaceChildren();}
 function show(){
  release();const m=selection[position];$('#collection-dialog-title').textContent=m.title;$('#media-position').textContent=`${position+1} / ${selection.length}${m.category==='ambiances'?' · Visuel d’inspiration':''}`;
  const media=m.kind==='video'?document.createElement('video'):new Image();activeMedia=media;
  if(m.kind==='video'){media.muted=true;media.defaultMuted=true;media.setAttribute('muted','');media.controls=true;media.playsInline=true;media.preload='none';media.poster=m.thumb;media.setAttribute('aria-label',m.title+' — film sans son');}else{media.alt=m.title;media.decoding='async';}
  media.width=m.width;media.height=m.height;media.src=m.src;content.append(media);
  media.addEventListener('error',()=>{if(activeMedia!==media)return;const message=document.createElement('p');message.textContent='Ce média n’a pas pu être chargé. ';const retry=document.createElement('button');retry.type='button';retry.textContent='Réessayer';retry.addEventListener('click',show);message.append(retry);content.replaceChildren(message);},{once:true});
  if(!dialog.open){dialog.showModal();document.body.classList.add('collection-open');}
  // Only this explicit click/navigation can start a film. No background download.
  if(m.kind==='video')media.play().catch(()=>{});
 }
 function move(delta){position=(position+delta+selection.length)%selection.length;show();}
 $('#media-prev').addEventListener('click',()=>move(-1));$('#media-next').addEventListener('click',()=>move(1));$('#collection-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{release();document.body.classList.remove('collection-open');opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',e=>{if(e.target.tagName==='VIDEO')return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&activeMedia?.tagName==='VIDEO')activeMedia.pause();});window.addEventListener('pagehide',release);
 // Additional authentic before/after pairs remain available without replacing the original comparison.
 const stage=$('#collection-compare'),range=stage.querySelector('input'),before=$('#pair-before'),after=$('#pair-after');let pointer=null,pairRequest=0;
 const pairs={facade:{before:28,after:29,title:'La façade retrouve son unité',a:'Maison avant rénovation de la façade et des abords',b:'Maison après rénovation de la façade, garage et accès'},extension:{before:44,after:43,title:'La maison s’ouvre au jardin',a:'Façade et extension pendant les travaux, avant les finitions',b:'La même maison après travaux, avec extension vitrée et façade terminée'}};
 function set(value){const n=Math.max(0,Math.min(100,Number(value)));range.value=n;stage.style.setProperty('--reveal',n+'%');const label=`${Math.round(n)} % avant`;if(range.getAttribute('aria-valuetext')!==label)range.setAttribute('aria-valuetext',label);const output=$('#pair-value');if(output.textContent!==label)output.textContent=label;}
 range.addEventListener('input',()=>set(range.value));
 document.querySelectorAll('[data-pair]').forEach(button=>button.addEventListener('click',()=>{
  const request=++pairRequest,pair=pairs[button.dataset.pair];const pending=[new Image(),new Image()];let loaded=0;
  pending.forEach((img,i)=>{img.onload=()=>{if(request!==pairRequest||++loaded!==2)return;before.src=pending[0].src;after.src=pending[1].src;before.alt=pair.a;after.alt=pair.b;$('#pair-title').textContent=pair.title;set(50);range.dispatchEvent(new Event('change',{bubbles:true}));};img.src=items.find(m=>m.id===`photo-${String(i?pair.after:pair.before).padStart(3,'0')}`).src;});
  document.querySelectorAll('[data-pair]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 }));
 document.querySelectorAll('[data-pair-value]').forEach(b=>b.addEventListener('click',()=>{set(b.dataset.pairValue);range.dispatchEvent(new Event('change',{bubbles:true}));}));
 function pointerValue(e){const rect=stage.getBoundingClientRect();if(rect.width)set((e.clientX-rect.left)/rect.width*100);}
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false)return;pointer=e.pointerId;stage.setPointerCapture?.(pointer);pointerValue(e);});stage.addEventListener('pointermove',e=>{if(pointer===e.pointerId)pointerValue(e);});
 const end=e=>{if(e.pointerId!==pointer)return;pointer=null;};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);
 render();
})();
