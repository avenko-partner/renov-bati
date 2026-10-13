(() => {
  'use strict';
  const data=window.RENOV_DATA;if(!data?.projects?.length)return;
  const $=(s,scope=document)=>scope.querySelector(s),$$=(s,scope=document)=>[...scope.querySelectorAll(s)];
  const root=document.documentElement,body=document.body;
  const motionMedia=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(motionMedia?.matches);
  const header=$('.site-header'),toggle=$('.menu-toggle'),nav=$('.main-nav'),navLinks=$$('.main-nav a');
  const splitScreen=typeof matchMedia==='function'?matchMedia('(horizontal-viewport-segments: 2)'):{matches:false};
  const compactNavigation=()=>innerWidth<=1100||splitScreen.matches;
  function syncNavigation(){
    const concealed=compactNavigation()&&!header.classList.contains('menu-is-open');
    nav.toggleAttribute('inert',concealed);
    if(concealed)nav.setAttribute('aria-hidden','true');else nav.removeAttribute('aria-hidden');
  }
  const navEntries=navLinks.map(link=>({link,section:$(link.getAttribute('href')),top:Infinity}));
  const pageProgress=$('.page-progress');
  let scrollFrame=null,metricsDirty=true,scrollActive=true;
  let scrollMax=1,viewportHeight=innerHeight,currentLink=null,headerScrolled=null,lastProgress=-1;
  function updateScroll(){
    scrollFrame=null;if(!scrollActive)return;
    const y=scrollY;
    // Read geometry together, only after a real layout change, before any write.
    if(metricsDirty){
      viewportHeight=innerHeight;scrollMax=Math.max(1,root.scrollHeight-viewportHeight);
      navEntries.forEach(entry=>{entry.top=entry.section?entry.section.getBoundingClientRect().top+y:Infinity;});
      metricsDirty=false;
    }
    let current=null;
    navEntries.forEach(entry=>{if(entry.top<=y+viewportHeight*.3)current=entry.link;});
    const progress=Math.max(0,Math.min(1,y/scrollMax)),scrolled=y>40;
    if(progress!==lastProgress){if(pageProgress)pageProgress.style.transform=`scaleX(${progress})`;lastProgress=progress;}
    if(scrolled!==headerScrolled){header.classList.toggle('is-scrolled',scrolled);headerScrolled=scrolled;}
    if(current!==currentLink){
      navEntries.forEach(({link})=>{if(link===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
      currentLink=current;
    }
  }
  function requestScrollUpdate(){if(scrollActive&&scrollFrame===null)scrollFrame=requestAnimationFrame(updateScroll);}
  function invalidateScrollMetrics(){metricsDirty=true;requestScrollUpdate();}
  window.addEventListener('scroll',requestScrollUpdate,{passive:true});
  if(typeof ResizeObserver==='function'){
    const layoutObserver=new ResizeObserver(invalidateScrollMetrics);
    [document.body,document.querySelector('main'),header].filter(Boolean).forEach(surface=>layoutObserver.observe(surface));
  }
  document.fonts?.ready?.then(invalidateScrollMetrics,()=>{});
  document.addEventListener('renov-intro-complete',invalidateScrollMetrics);
  window.addEventListener('load',invalidateScrollMetrics,{once:true});
  window.addEventListener('pagehide',()=>{scrollActive=false;if(scrollFrame!==null)cancelAnimationFrame(scrollFrame);scrollFrame=null;});
  window.addEventListener('pageshow',event=>{if(event.persisted){scrollActive=true;invalidateScrollMetrics();}});
  updateScroll();
  function closeMenu(){header.classList.remove('menu-is-open');body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Ouvrir le menu');syncNavigation();}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');header.classList.toggle('menu-is-open',open);body.classList.toggle('menu-open',open);syncNavigation();});
  syncNavigation();
  splitScreen.addEventListener?.('change',()=>{if(!compactNavigation())closeMenu();else syncNavigation();});
  navLinks.forEach(link=>link.addEventListener('click',closeMenu));
  $('.header-quote').addEventListener('click',closeMenu);
  document.addEventListener('keydown',event=>{
    if(!body.classList.contains('menu-open'))return;
    if(event.key==='Escape'){closeMenu();toggle.focus();}
    if(event.key==='Tab'){
      const controls=[$('.site-header .brand'),...navLinks,$('.header-quote'),toggle],first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });

  // Authentic before/after photographs; the range and pointer share one value.
  const stage=$('#compare-stage'),range=$('#compare-range'),compareButtons=$$('[data-compare]');
  function setComparison(value){
    const numeric=Number(value);if(!Number.isFinite(numeric))return;
    const next=Math.max(0,Math.min(100,Math.round(numeric)));
    range.value=String(next);stage.style.setProperty('--reveal',next+'%');
    range.setAttribute('aria-valuetext',`Avant ${next} pour cent, après ${100-next} pour cent`);
    $('#compare-value').textContent=`${next} % avant`;
    $('.compare-label-before').hidden=next===0;$('.compare-label-after').hidden=next===100;
    compareButtons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.compare)===next)));
  }
  range.addEventListener('input',()=>{stage.classList.remove('is-settling');setComparison(range.value);});
  compareButtons.forEach(button=>button.addEventListener('click',()=>{stage.classList.toggle('is-settling',!reduced());setComparison(button.dataset.compare);}));
  range.addEventListener('keydown',event=>{
    const value=Number(range.value),step=event.shiftKey?10:2;
    const targets={ArrowLeft:value-step,ArrowDown:value-step,ArrowRight:value+step,ArrowUp:value+step,Home:0,End:100,PageDown:value-10,PageUp:value+10};
    if(targets[event.key]===undefined||event.ctrlKey||event.metaKey||event.altKey)return;
    event.preventDefault();stage.classList.remove('is-settling');setComparison(targets[event.key]);
  });
  let pointer=null;
  function comparePointer(event){const rect=stage.getBoundingClientRect();if(rect.width>0)setComparison((event.clientX-rect.left)/rect.width*100);}
  stage.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false)return;
    if(event.cancelable)event.preventDefault();pointer=event.pointerId;stage.classList.remove('is-settling');stage.classList.add('is-dragging');range.focus({preventScroll:true});
    try{range.setPointerCapture?.(event.pointerId);}catch{}
    comparePointer(event);
  });
  stage.addEventListener('pointermove',event=>{if(pointer===event.pointerId)comparePointer(event);});
  function release(event){if(pointer!==event.pointerId)return;try{range.releasePointerCapture?.(event.pointerId);}catch{}pointer=null;stage.classList.remove('is-dragging');}
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  setComparison(range.value);

  // Update the accessible result immediately; animate only its visual rearrangement.
  const filters=$$('[data-filter]'),cards=$$('[data-project-card]'),grid=$('#project-grid');
  const filterAnimations=new Set(),ghosts=new Set();let activeFilter='all';
  function stopFilterMotion(){
    [...filterAnimations].forEach(animation=>{try{animation.cancel();}catch{}});filterAnimations.clear();
    ghosts.forEach(ghost=>ghost.remove());ghosts.clear();
  }
  function animateFilter(target,frames,options,ghost=null){
    if(!target||reduced()||typeof target.animate!=='function'){ghost?.remove();ghosts.delete(ghost);return;}
    let animation;
    try{animation=target.animate(frames,{duration:580,easing:'cubic-bezier(.22,.75,.22,1)',fill:'none',...options});}catch{ghost?.remove();ghosts.delete(ghost);return;}
    if(!animation){ghost?.remove();ghosts.delete(ghost);return;}
    filterAnimations.add(animation);
    const settle=()=>{filterAnimations.delete(animation);ghost?.remove();ghosts.delete(ghost);animation.onfinish=animation.oncancel=null;invalidateScrollMetrics();};
    animation.onfinish=animation.oncancel=settle;animation.finished?.then(settle,settle);
  }
  function filterProjects(id){
    if(!filters.some(button=>button.dataset.filter===id)||id===activeFilter)return;
    const motion=!reduced()&&typeof grid.animate==='function';
    stopFilterMotion();
    const beforeGrid=motion?grid.getBoundingClientRect():null;
    const before=new Map(motion?cards.filter(card=>!card.hidden).map(card=>[card,card.getBoundingClientRect()]):[]);
    activeFilter=id;
    const visible=cards.filter(card=>id==='all'||card.dataset.category===id);
    cards.forEach(card=>{card.hidden=!visible.includes(card);card.classList.remove('is-featured','is-narrow','is-single','is-entering');});
    grid.classList.toggle('is-filtered',id!=='all');
    visible.forEach(card=>{
      const layout=id==='all'?card.dataset.layout:'standard',single=visible.length===1;
      card.classList.toggle('is-featured',layout==='wide');card.classList.toggle('is-narrow',layout==='portrait');card.classList.toggle('is-single',single);
      const img=card.querySelector('.project-photo img');
      if(img){const medium=layout==='wide'||single?'92vw':'46vw',wide=layout==='wide'?'62vw':layout==='portrait'?'30vw':'46vw';img.sizes=`(max-width: 640px) 92vw, (max-width: 960px) ${medium}, ${wide}`;}
    });
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===id)));
    $('#project-count').textContent=`${visible.length} ${visible.length===1?'réalisation':'réalisations'}`;
    invalidateScrollMetrics();
    if(!motion||beforeGrid.width<=0||beforeGrid.height<=0)return;
    // All final rectangles are read before any animation writes, avoiding layout interleaving.
    const after=new Map(visible.map(card=>[card,card.getBoundingClientRect()]));
    before.forEach((rect,card)=>{
      if(!card.hidden||rect.width<=0||rect.height<=0)return;
      const ghost=card.cloneNode(true);ghost.className='project-ghost';ghost.hidden=false;
      [...ghost.attributes].filter(attribute=>attribute.name.startsWith('data-')).forEach(attribute=>ghost.removeAttribute(attribute.name));
      ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
      ghost.querySelectorAll('[data-project]').forEach(el=>el.removeAttribute('data-project'));
      ghost.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));
      ghost.querySelectorAll('img').forEach(img=>{img.alt='';});
      ghost.setAttribute('inert','');ghost.setAttribute('aria-hidden','true');
      Object.assign(ghost.style,{left:(rect.left-beforeGrid.left)+'px',top:(rect.top-beforeGrid.top)+'px',width:rect.width+'px',height:rect.height+'px'});
      grid.append(ghost);ghosts.add(ghost);
      animateFilter(ghost,[{opacity:.9,transform:'translateY(0)'},{opacity:0,transform:'translateY(10px)'}],{duration:180},ghost);
    });
    visible.forEach((card,index)=>{
      const final=after.get(card),initial=before.get(card);if(final.width<=0||final.height<=0)return;
      if(initial){
        const dx=initial.left-final.left,dy=initial.top-final.top;
        if(Math.abs(dx)+Math.abs(dy)>1e-3)animateFilter(card,[{transform:`translate3d(${dx}px,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],{duration:580});
      }else{
        animateFilter(card,[{opacity:.85,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:Math.min(index*25,75),fill:'backwards'});
      }
    });
  }
  filters.forEach(button=>button.addEventListener('click',()=>filterProjects(button.dataset.filter)));
  document.addEventListener('renov-motion-change',()=>{if(reduced()){stopFilterMotion();stage.classList.remove('is-settling','is-dragging');}});
  motionMedia?.addEventListener?.('change',()=>{if(reduced())stopFilterMotion();});
  window.addEventListener('resize',stopFilterMotion,{passive:true});
  window.addEventListener('pagehide',()=>{stopFilterMotion();pointer=null;stage.classList.remove('is-dragging','is-settling');});

  let toastTimer;
  function toast(message){const element=$('#toast');clearTimeout(toastTimer);element.textContent=message;element.classList.add('is-visible');toastTimer=setTimeout(()=>element.classList.remove('is-visible'),2600);}
  const dialog=$('#project-dialog'),projects=new Map(data.projects.map(project=>[project.id,project]));
  let activeProject=null,photoIndex=0,opener=null,closingAnimation=null,closingDeadline=null,photoAnimation=null;
  function stopPhotoMotion(){
    if(photoAnimation){try{photoAnimation.cancel();}catch{}photoAnimation=null;}
  }
  window.addEventListener('resize',stopPhotoMotion,{passive:true});
  function finishDialogClose(){
    clearTimeout(closingDeadline);closingDeadline=null;
    if(closingAnimation){closingAnimation.onfinish=null;closingAnimation.cancel();closingAnimation=null;}
    dialog.classList.remove('is-closing');if(dialog.open)dialog.close();
  }
  function requestDialogClose(){
    if(!dialog.open||closingAnimation)return;
    if(reduced()||typeof dialog.animate!=='function'){finishDialogClose();return;}
    dialog.classList.add('is-closing');
    closingAnimation=dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:180,easing:'ease-in',fill:'none'});
    closingAnimation.onfinish=finishDialogClose;
    closingDeadline=setTimeout(finishDialogClose,240);
  }
  document.addEventListener('renov-motion-change',()=>{if(reduced()){stopPhotoMotion();if(closingAnimation)finishDialogClose();}});
  motionMedia?.addEventListener?.('change',()=>{if(reduced())stopPhotoMotion();});
  window.addEventListener('pagehide',()=>{stopPhotoMotion();if(closingAnimation)finishDialogClose();});
  function showPhoto(index){
    if(!activeProject)return;const count=activeProject.images.length;photoIndex=(index+count)%count;
    const photo=activeProject.images[photoIndex],image=$('#project-dialog-image');
    image.src=`./assets/photos/${photo.file}.webp`;image.alt=photo.alt;
    if(photo.mobileWidth&&photo.width){image.srcset=`./assets/photos/${photo.file}-mobile.webp ${photo.mobileWidth}w, ./assets/photos/${photo.file}.webp ${photo.width}w`;image.sizes='(max-width: 960px) 92vw, 60vw';}
    if(photo.width&&photo.height){image.width=photo.width;image.height=photo.height;}
    stopPhotoMotion();
    if(dialog.open&&!reduced()&&typeof image.animate==='function'){
      try{
        const effect=image.animate([{opacity:.85},{opacity:1}],{duration:300,easing:'ease-out'});photoAnimation=effect;
        effect.finished?.then(()=>{if(photoAnimation===effect)photoAnimation=null;},()=>{if(photoAnimation===effect)photoAnimation=null;});
      }catch{}
    }
    $('#project-photo-count').textContent=`${String(photoIndex+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;
    $('#project-photo-prev').disabled=count<=1;$('#project-photo-next').disabled=count<=1;
  }
  function openProject(id,trigger){
    const project=projects.get(id);if(!project||typeof dialog.showModal!=='function')return false;
    activeProject=project;opener=trigger;closeMenu();
    $('#project-dialog-title').textContent=project.title;$('#project-dialog-category').textContent=project.label;$('#project-dialog-description').textContent=project.description;
    const list=$('#project-dialog-details');list.replaceChildren();project.details.forEach(detail=>{const li=document.createElement('li');li.textContent=detail;list.append(li);});
    showPhoto(0);dialog.showModal();body.classList.add('dialog-open');return true;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-project]');if(link&&openProject(link.dataset.project,link))event.preventDefault();
  });
  $('[data-dialog-close]').addEventListener('click',requestDialogClose);
  dialog.addEventListener('cancel',event=>{event.preventDefault();requestDialogClose();});
  dialog.addEventListener('close',()=>{stopPhotoMotion();clearTimeout(closingDeadline);closingDeadline=null;if(closingAnimation){closingAnimation.onfinish=null;closingAnimation.cancel();closingAnimation=null;}dialog.classList.remove('is-closing');body.classList.remove('dialog-open');if(opener?.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)requestDialogClose();});
  $('#project-photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#project-photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));
  dialog.addEventListener('keydown',event=>{if(!dialog.open||!activeProject||activeProject.images.length<=1||event.ctrlKey||event.metaKey||event.altKey)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowRight'?1:-1));}});
  $('#project-dialog-quote').addEventListener('click',()=>dialog.close());

  // Both halves of the strip have identical widths, including on wide screens.
  const marquee=$('#logo-marquee'),track=$('.logo-track'),firstGroup=$('#logo-group'),secondGroup=$('.logo-group[aria-hidden=true]'),pause=$('#marquee-pause');
  let paused=false;
  const originals=[...firstGroup.children].map(logo=>logo.cloneNode(true));
  function buildMarquee(){
    firstGroup.querySelectorAll('[data-logo-repeat]').forEach(logo=>logo.remove());
    const width=firstGroup.getBoundingClientRect().width,view=marquee.clientWidth;
    if(!reduced()&&width>0&&view>width){const repeat=Math.min(4,Math.ceil(view/width));for(let i=1;i<repeat;i++)originals.forEach(original=>{const logo=original.cloneNode(true);logo.dataset.logoRepeat='true';logo.setAttribute('aria-hidden','true');$('img',logo).alt='';firstGroup.append(logo);});}
    secondGroup.innerHTML=firstGroup.innerHTML;$$('img',secondGroup).forEach(img=>{img.alt='';});
    const finalWidth=firstGroup.getBoundingClientRect().width;if(finalWidth>0)track.style.setProperty('--marquee-duration',`${Math.max(30,finalWidth/65)}s`);
    invalidateScrollMetrics();
  }
  function updateMarqueeControl(){
    pause.disabled=reduced();pause.setAttribute('aria-pressed',String(paused||reduced()));
    pause.textContent=reduced()?'Défilement arrêté (animations réduites)':paused?'Reprendre le défilement ▶':'Mettre le défilement en pause Ⅱ';
    marquee.classList.toggle('is-paused',paused);
  }
  pause.addEventListener('click',()=>{paused=!paused;updateMarqueeControl();});
  document.addEventListener('renov-motion-change',()=>{updateMarqueeControl();requestAnimationFrame(buildMarquee);});
  updateMarqueeControl();buildMarquee();
  window.addEventListener('resize',()=>{if(!compactNavigation())closeMenu();syncNavigation();buildMarquee();invalidateScrollMetrics();},{passive:true});
  window.addEventListener('load',buildMarquee,{once:true});

  // The local deliverable prepares a reviewed mail draft, never a fake send.
  const form=$('#quote-form'),result=$('#quote-result');let quoteNote='';
  const fields={firstname:$('#quote-firstname'),lastname:$('#quote-lastname'),phone:$('#quote-phone'),email:$('#quote-email')};
  function clearError(){Object.values(fields).forEach(input=>input.removeAttribute('aria-invalid'));$('#quote-error').textContent='';}
  form.addEventListener('submit',event=>{
    event.preventDefault();clearError();const values=Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value.trim()]));
    let invalid=null,message='';
    if(!values.firstname||values.firstname.length>80||/[<>\r\n]/.test(values.firstname)){invalid=fields.firstname;message='Renseignez votre prénom.';}
    else if(!values.lastname||values.lastname.length>80||/[<>\r\n]/.test(values.lastname)){invalid=fields.lastname;message='Renseignez votre nom.';}
    else if(!/^(\+|00)?[\d\s().-]+$/.test(values.phone)||values.phone.replace(/\D/g,'').length<9||values.phone.replace(/\D/g,'').length>15){invalid=fields.phone;message='Renseignez un numéro de téléphone valide.';}
    else if(values.email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(values.email)){invalid=fields.email;message='Renseignez une adresse e-mail valide.';}
    if(invalid){invalid.setAttribute('aria-invalid','true');$('#quote-error').textContent=message;invalid.focus();return;}
    const rows=[['Nom',values.firstname+' '+values.lastname],['Téléphone',values.phone],['E-mail',values.email]];
    const summary=$('#quote-summary');summary.replaceChildren();rows.forEach(([key,value])=>{const row=document.createElement('div'),term=document.createElement('dt'),definition=document.createElement('dd');term.textContent=key;definition.textContent=value;row.append(term,definition);summary.append(row);});
    const subject='Renov Bati — Demande de devis / prise de contact';
    const messageBody=`Bonjour Renov Bati,\n\nJe souhaite être contacté(e) pour échanger sur mes travaux et préparer un devis.\n\nPrénom : ${values.firstname}\nNom : ${values.lastname}\nTéléphone : ${values.phone}\nE-mail : ${values.email}\n\nMerci.\n`;
    $('#quote-email-link').href=`mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
    quoteNote=`RENOV BATI — DEMANDE DE DEVIS PRÉPARÉE\n\nDestinataire : ${data.email}\nTéléphone Renov Bati : ${data.phone}\n\n${messageBody}\nCette demande a été préparée sur le site Renov Bati. Aucun envoi automatique n’a été effectué.\n`;
    form.hidden=true;result.hidden=false;invalidateScrollMetrics();$('#quote-email-link').focus();
  });
  $('#quote-edit').addEventListener('click',()=>{result.hidden=true;form.hidden=false;invalidateScrollMetrics();clearError();fields.firstname.focus();});
  $('#quote-download').addEventListener('click',()=>{
    if(!quoteNote)return;if(typeof URL.createObjectURL!=='function'){toast('Utilisez votre messagerie pour conserver le brouillon.');return;}
    const blob=new Blob(['\uFEFF',quoteNote],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='demande-devis-renov-bati.txt';body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Votre demande préparée est disponible.');
  });
})();
