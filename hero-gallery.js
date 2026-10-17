(function carouselController(){
  'use strict';
  const root=document.documentElement,frame=document.querySelector('.hero-stage'),stage=document.querySelector('.hero-main');
  const image=document.querySelector('#hero-image'),group=document.querySelector('#hero-switcher');
  const link=document.querySelector('#hero-selected-project'),status=document.querySelector('#hero-view-status'),pause=document.querySelector('#hero-autoplay');
  const entries=new Map((window.RENOV_DATA?.projects||[]).map(project=>[project.id,project]));
  if(!frame||!stage||!image||!group||!link||!pause||typeof Image!=='function')return;
  const buttons=[...group.querySelectorAll('[data-hero-view]')];
  if(!buttons.length||buttons.some(button=>!entries.has(button.dataset.heroView)))return;
  const ids=buttons.map(button=>button.dataset.heroView);
  const fills=new Map(buttons.map(button=>[button.dataset.heroView,button.querySelector('.hero-view-progress')]));
  const photos=new Map(buttons.map(button=>{
    const source=entries.get(button.dataset.heroView).images[0];
    return [button.dataset.heroView,{
      ...source,file:button.dataset.heroFile||source.file,width:Number(button.dataset.heroWidth)||source.width,
      height:Number(button.dataset.heroHeight)||source.height,mobileWidth:Number(button.dataset.heroMobileWidth)||source.mobileWidth,
      screenWidth:Number(button.dataset.heroScreenWidth)||0
    }];
  }));
  const media=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const splitScreen=typeof matchMedia==='function'?matchMedia('(horizontal-viewport-segments: 2)'):null;
  const imageSizes=()=>splitScreen?.matches&&frame.clientWidth>0?`${Math.round(frame.clientWidth)}px`:'100vw';
  const reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(media?.matches);
  const positions={'piscine':'58% 52%','bain-pierre':'50% 52%','cuisine':'50% 54%'};
  const delay=4500,cache=new Map(),effects=new Set(),ghosts=new Set();
  const srcset=photo=>`./assets/photos/${photo.file}-mobile.webp ${photo.mobileWidth}w, ${photo.screenWidth?`./assets/photos/${photo.file}-ecran.webp ${photo.screenWidth}w, `:''}./assets/photos/${photo.file}.webp ${photo.width}w`;
  let selected=link.dataset.project,nextIndex=(ids.indexOf(selected)+1)%ids.length;
  let ticket=0,pending=null,pageActive=true,timer=null,userPaused=false;
  let introComplete=!root.classList.contains('intro-pending'),inView=true,keyboardMode=false;
  let elapsed=0,startedAt=null,progressFrame=null,progressIsTimeout=false,progressEffect=null,clockGeneration=0;
  let warmTimer=null,warmIdle=null,warmGeneration=0;
  const now=()=>window.performance?.now?.()??Date.now();
  const focusHeld=()=>keyboardMode&&(group.contains(document.activeElement)||link.contains(document.activeElement));
  const blocked=()=>userPaused||reduced()||!pageActive||!introComplete||document.hidden||!inView||focusHeld()||document.body.classList.contains('dialog-open');
  const fraction=()=>Math.min(1,Math.max(0,(elapsed+(startedAt===null?0:now()-startedAt))/delay));
  function writeProgress(resetOthers=false){
    if(resetOthers)for(const fill of fills.values())if(fill)fill.style.transform='scaleX(0)';
    const fill=fills.get(selected);if(fill)fill.style.transform=`scaleX(${fraction()})`;
  }
  function cancelEffects(){
    for(const effect of [...effects]){try{effect.cancel();}catch{}}
    effects.clear();for(const ghost of ghosts)ghost.remove();ghosts.clear();
  }
  function cancelProgressFrame(){
    if(progressEffect){try{progressEffect.cancel();}catch{}progressEffect=null;}
    if(progressFrame===null)return;
    if(progressIsTimeout)clearTimeout(progressFrame);else window.cancelAnimationFrame?.(progressFrame);
    progressFrame=null;
  }
  function holdClock(){
    cancelWarm();
    clearTimeout(timer);timer=null;
    if(startedAt!==null)elapsed=Math.min(delay,Math.max(0,elapsed+now()-startedAt));
    startedAt=null;++clockGeneration;cancelProgressFrame();writeProgress();
    group.dataset.heroClock=pending?'loading':'paused';
  }
  function resetClock(){holdClock();elapsed=0;writeProgress(true);}
  function stopPending(){pending=null;group.removeAttribute('aria-busy');}
  function prepare(id,priority='auto'){
    if(cache.has(id)){const request=cache.get(id);if(request.preview&&priority!=='low')request.preview.fetchPriority=priority;return request;}
    const photo=photos.get(id),preview=new Image();let settled=false,decoding=false,deadline,resolve;
    const promise=new Promise(done=>{resolve=done;});
    function finish(result){
      if(settled)return;settled=true;clearTimeout(deadline);preview.onload=preview.onerror=null;
      if(result===true)cache.set(id,{promise:Promise.resolve(true),preview:null,cancel:()=>{}});
      else cache.delete(id);resolve(result);
    }
    function loaded(){
      if(settled||decoding)return;decoding=true;
      if(typeof preview.decode!=='function'){finish(true);return;}
      try{Promise.resolve(preview.decode()).then(()=>finish(true),()=>finish(false));}catch{finish(false);}
    }
    const request={promise,preview,cancel:()=>{finish(null);preview.removeAttribute?.('srcset');preview.removeAttribute?.('src');}};cache.set(id,request);
    preview.onload=loaded;preview.onerror=()=>finish(false);
    deadline=setTimeout(()=>finish(false),7000);preview.sizes=imageSizes();preview.decoding='async';preview.fetchPriority=priority;
    preview.srcset=srcset(photo);
    preview.src=`./assets/photos/${photo.file}.webp`;
    if(preview.complete&&preview.naturalWidth>0)loaded();
    return request;
  }
  function cancelWarm(){
    ++warmGeneration;clearTimeout(warmTimer);warmTimer=null;
    if(warmIdle!==null)window.cancelIdleCallback?.(warmIdle);warmIdle=null;
  }
  function warm(){
    cancelWarm();if(blocked()||pending)return;
    const id=ids[nextIndex];if(id===selected||cache.has(id))return;
    const run=warmGeneration;
    // Let the opening settle, then decode only the next photograph at low priority.
    warmTimer=setTimeout(()=>{
      warmTimer=null;if(run!==warmGeneration||blocked())return;
      const load=()=>{if(run!==warmGeneration)return;warmIdle=null;if(!blocked())prepare(id,'low');};
      if(typeof window.requestIdleCallback==='function')warmIdle=window.requestIdleCallback(load,{timeout:1000});
      else load();
    },1000);
  }
  function animate(target,frames,options,cleanup=()=>{}){
    let effect;
    try{effect=target.animate(frames,{easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...options});}catch{cleanup();return;}
    if(!effect){cleanup();return;}effects.add(effect);
    const finish=()=>{effects.delete(effect);cleanup();effect.onfinish=effect.oncancel=null;};
    effect.onfinish=effect.oncancel=finish;effect.finished?.then(finish,finish);
  }
  function display(id,mode){
    const project=entries.get(id),photo=photos.get(id);let ghost=null;
    if(!reduced()&&typeof image.animate==='function'){
      ghost=image.cloneNode(false);ghost.removeAttribute('id');ghost.alt='';ghost.setAttribute('aria-hidden','true');
      ghost.classList.add('hero-image-ghost');stage.append(ghost);ghosts.add(ghost);
    }
    image.dataset.heroId=id;image.sizes=imageSizes();
    image.srcset=srcset(photo);
    image.src=`./assets/photos/${photo.file}.webp`;image.alt=photo.alt;
    image.width=photo.width;image.height=photo.height;image.style.objectPosition=positions[id]||'50% 50%';
    frame.dataset.heroCurrent=id;link.href=`./projets.html#${id}`;link.dataset.project=id;
    document.querySelector('#hero-project-label').textContent=project.label;
    document.querySelector('#hero-project-title').textContent=project.title;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.heroView===id)));selected=id;
    if(status)status.textContent=mode==='manual'?`Réalisation affichée : ${project.title}.`:'';
    if(ghost){
      animate(ghost,[{opacity:1},{opacity:0}],{duration:550},()=>{ghost.remove();ghosts.delete(ghost);});
      animate(image,[{opacity:.65},{opacity:1}],{duration:550});
    }
  }
  function updateButton(){
    const paused=userPaused||reduced();pause.disabled=reduced();pause.setAttribute('aria-pressed',String(paused));
    pause.setAttribute('aria-label',reduced()?'Défilement suspendu : réduction des mouvements':userPaused?'Reprendre le défilement des photos':'Mettre le défilement des photos en pause');
    pause.querySelector('span').textContent=reduced()?'Pause':userPaused?'Lecture':'Pause';
    pause.querySelector('[data-hero-pause-icon]').toggleAttribute('hidden',paused);
    pause.querySelector('[data-hero-play-icon]').toggleAttribute('hidden',!paused);
  }
  function progress(run){
    if(run!==clockGeneration||startedAt===null)return;
    progressFrame=null;
    if(blocked()){refresh();return;}
    writeProgress();
    if(fraction()>=1)return;
    if(typeof window.requestAnimationFrame==='function'){
      progressIsTimeout=false;progressFrame=window.requestAnimationFrame(()=>progress(run));
    }else{
      progressIsTimeout=true;progressFrame=setTimeout(()=>progress(run),16);
    }
  }
  function schedule(){
    updateButton();
    if(blocked()||pending){holdClock();return;}
    if(timer!==null&&startedAt!==null)return;
    startedAt=now();const run=++clockGeneration;group.dataset.heroClock='running';
    timer=setTimeout(()=>{
      if(run!==clockGeneration||startedAt===null)return;
      holdClock();elapsed=delay;writeProgress();select(ids[nextIndex],'auto');
    },Math.max(0,delay-elapsed));
    const fill=fills.get(selected);writeProgress();
    if(fill&&typeof fill.animate==='function'){
      try{
        progressEffect=fill.animate([{transform:`scaleX(${fraction()})`},{transform:'scaleX(1)'}],{duration:Math.max(0,delay-elapsed),easing:'linear',fill:'forwards'});
        progressEffect?.finished?.catch?.(()=>{});
      }catch{}
    }
    if(!progressEffect)progress(run);
    warm();
  }
  function refresh(){
    if(blocked()){
      holdClock();
      if(pending?.mode==='auto'){++ticket;stopPending();nextIndex=(ids.indexOf(selected)+1)%ids.length;resetClock();}
    }
    schedule();
  }
  async function select(id,mode='manual'){
    if(mode==='auto'&&blocked()){refresh();return;}
    holdClock();const current=++ticket;stopPending();cancelEffects();if(!pageActive)return;
    nextIndex=(ids.indexOf(id)+1)%ids.length;
    if(id===selected){resetClock();schedule();return;}
    group.setAttribute('aria-busy','true');if(status)status.textContent='';
    const request=prepare(id,mode==='manual'?'high':'auto');pending={request,mode};group.dataset.heroClock='loading';
    const ready=await request.promise;
    if(current!==ticket||!pageActive)return;
    stopPending();
    if(ready&&!(mode==='auto'&&blocked()))display(id,mode);
    else if(ready===false&&mode==='manual'&&status)status.textContent='Cette photographie ne peut pas être chargée. La vue actuelle reste affichée.';
    resetClock();schedule();
  }
  buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.heroView)));
  pause.addEventListener('click',()=>{userPaused=!userPaused;refresh();});
  document.addEventListener('pointerdown',()=>{if(keyboardMode){keyboardMode=false;refresh();}},{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if(event.key==='Tab'||((group.contains(event.target)||link.contains(event.target))&&(event.key==='Enter'||event.key===' '))){
      keyboardMode=true;refresh();
    }
  },true);
  group.addEventListener('focusin',refresh);group.addEventListener('focusout',()=>queueMicrotask(refresh));
  link.addEventListener('focusin',refresh);link.addEventListener('focusout',()=>queueMicrotask(refresh));
  link.addEventListener('click',()=>queueMicrotask(refresh));
  image.dataset.heroId=selected;image.sizes=imageSizes();group.classList.add('is-ready');pause.hidden=false;writeProgress(true);
  function onMotion(){if(reduced())cancelEffects();refresh();}
  media?.addEventListener?.('change',onMotion);document.addEventListener('renov-motion-change',onMotion);
  let introObserver=null;
  function completeIntro(){introObserver?.disconnect();introObserver=null;if(introComplete)return;introComplete=true;schedule();}
  document.addEventListener('renov-intro-complete',completeIntro,{once:true});
  if(!introComplete&&typeof MutationObserver==='function'){
    introObserver=new MutationObserver(()=>{if(!root.classList.contains('intro-pending'))completeIntro();});
    introObserver.observe(root,{attributes:true,attributeFilter:['class']});
  }
  document.addEventListener('visibilitychange',refresh);
  document.addEventListener('renov-gallery-change',refresh);
  document.querySelector('#project-dialog')?.addEventListener('close',()=>queueMicrotask(refresh));
  if(typeof IntersectionObserver==='function'){
    try{const observer=new IntersectionObserver(records=>{const record=records.find(item=>item.target===frame);if(record){inView=record.isIntersecting;refresh();}},{threshold:0});observer.observe(frame);}catch{}
  }
  function syncImageSize(){cancelEffects();image.sizes=imageSizes();}
  window.addEventListener('resize',syncImageSize,{passive:true});
  splitScreen?.addEventListener?.('change',syncImageSize);
  window.addEventListener('scroll',()=>{if(effects.size)cancelEffects();},{passive:true});
  window.addEventListener('pagehide',()=>{
    const loadingAuto=pending?.mode==='auto';
    pageActive=false;holdClock();++ticket;stopPending();cancelEffects();nextIndex=(ids.indexOf(selected)+1)%ids.length;
    if(loadingAuto)resetClock();
    for(const request of [...cache.values()])request.cancel();cache.clear();
  });
  window.addEventListener('pageshow',event=>{if(event.persisted){pageActive=true;introComplete=!root.classList.contains('intro-pending');schedule();}});
  schedule();
})();
