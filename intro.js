(() => {
  'use strict';
  const state=window.RENOV_INTRO,root=document.documentElement,overlay=document.querySelector('#brand-intro');
  if(!state||state.finished||!root.classList.contains('intro-pending')||!overlay)return;
  const surfaces=[...document.querySelectorAll('.site-header,main,.site-footer,.skip-link')];
  const inertState=new Map(surfaces.map(el=>[el,el.hasAttribute('inert')]));
  const main=document.querySelector('main'),busyState=main?.getAttribute('aria-busy');
  const previousFocus=document.activeElement;
  const motion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  let hideTimer,drawTimer,revealTimer,frameId,logoSettled=false,logoLoaded=false,revealStarted=false,announced=false;
  state.drawDone=false;state.sequenceDone=false;state.resourcesReady=false;
  function restore(){
    surfaces.forEach(el=>{if(!inertState.get(el))el.removeAttribute('inert');});
    if(main){if(busyState===null)main.removeAttribute('aria-busy');else if(busyState!==undefined)main.setAttribute('aria-busy',busyState);}
    if(overlay.contains(document.activeElement)&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function stopTimers(){
    clearTimeout(drawTimer);clearTimeout(revealTimer);clearTimeout(hideTimer);
    if(frameId!==undefined)cancelAnimationFrame(frameId);
  }
  function hide(){
    stopTimers();clearTimeout(state.failsafe);
    document.removeEventListener('keydown',onKey);document.removeEventListener('renov-motion-change',onMotion);
    motion?.removeEventListener?.('change',nativeMotion);motion?.removeListener?.(nativeMotion);
    root.classList.remove('intro-pending','intro-running','intro-leaving');root.classList.add('intro-complete');
    overlay.setAttribute('aria-hidden','true');overlay.hidden=true;restore();
    if(!announced){announced=true;document.dispatchEvent(new CustomEvent('renov-intro-complete',{detail:{reason:state.reason}}));}
  }
  function finish(reason='ready'){
    if(state.finished){if(reason!=='ready')hide();return;}
    state.finished=true;state.reason=reason;stopTimers();
    if(reason!=='ready'||motion?.matches||window.RENOV_MOTION?.reduced())hide();
    else{
      document.dispatchEvent(new CustomEvent('renov-intro-leaving',{detail:{reason}}));
      root.classList.add('intro-leaving');hideTimer=setTimeout(hide,360);
    }
  }
  function attemptExit(){if(!state.finished&&state.resourcesReady&&state.sequenceDone)finish('ready');}
  function revealIdentity(){
    if(state.finished||!state.drawDone||!logoSettled||revealStarted)return;
    revealStarted=true;state.revealStartedAt=performance.now();
    if(logoLoaded)root.classList.add('intro-logo-ready');
    // Keep the contours if the logo fails; both cases have a short settling phase.
    revealTimer=setTimeout(()=>{if(state.finished)return;state.sequenceDone=true;attemptExit();},420);
  }
  function onKey(event){if(event.key==='Escape'){event.preventDefault();finish('escape');}}
  function onMotion(){if(window.RENOV_MOTION?.reduced())finish('reduced');}
  function nativeMotion(){if(motion?.matches)finish('reduced');}
  state.finish=finish;state.forceHide=hide;
  if(motion?.addEventListener)motion.addEventListener('change',nativeMotion);else motion?.addListener?.(nativeMotion);
  document.addEventListener('keydown',onKey);document.addEventListener('renov-motion-change',onMotion);
  window.addEventListener('pagehide',()=>finish('pagehide'),{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)finish('history');});
  if(motion?.matches||window.RENOV_MOTION?.reduced()){finish('reduced');return;}
  overlay.hidden=false;overlay.setAttribute('aria-hidden','false');
  surfaces.forEach(el=>el.setAttribute('inert',''));main?.setAttribute('aria-busy','true');
  state.drawStartedAt=performance.now();root.classList.add('intro-running');
  frameId=requestAnimationFrame(()=>{if(!state.finished)root.classList.add('intro-running');});
  drawTimer=setTimeout(()=>{
    if(state.finished)return;state.drawDone=true;root.classList.add('intro-drawn');revealIdentity();
  },1360);
  function decoded(image){
    if(typeof image.decode==='function')return image.decode();
    return new Promise((resolve,reject)=>{
      if(image.complete){image.naturalWidth?resolve():reject(new Error('Image unavailable'));return;}
      image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});
    });
  }
  const resources=[],logoImage=overlay.querySelector('.intro-original');
  const logo=new Image();if(logoImage)logo.src=logoImage.getAttribute('href');
  resources.push((logoImage?decoded(logo):Promise.reject(new Error('Logo unavailable'))).then(
    ()=>{logoLoaded=true;logoSettled=true;revealIdentity();},
    ()=>{logoSettled=true;revealIdentity();}
  ));
  const hero=document.querySelector('.hero-main img');if(hero)resources.push(decoded(hero));
  if(document.fonts?.ready)resources.push(document.fonts.ready);
  let settled=0;state.total=resources.length;state.completed=0;
  const tracked=resources.map(resource=>Promise.resolve(resource).catch(()=>{}).then(()=>{
    settled++;state.completed=settled;
    if(!state.finished)overlay.style.setProperty('--load-progress',String(settled/resources.length));
  }));
  Promise.all(tracked).then(()=>{if(!state.finished){state.resourcesReady=true;attemptExit();}});
})();
