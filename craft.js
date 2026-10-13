(() => {
  'use strict';
  const root=document.documentElement;
  const media=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(media?.matches);
  const running=new Set(),heroEffects=new Set(),seen=new Set();
  let pageActive=true,heroStarted=false,observer=null;
  // Observe each visual at its own position; a tall section is not one reveal.
  const items=[...new Set([...document.querySelectorAll('[data-craft-reveal]')].flatMap(item=>{
    if(item.matches('.expertise-columns article'))return [...item.querySelectorAll('.expertise-photo,.expertise-overview,.expertise-services')];
    if(item.matches('.material-layout'))return [...item.querySelectorAll('.material-heading,.material-copy,.material-photo,.material-detail,.material-context')];
    return [item];
  }).concat([...document.querySelectorAll('.projects-heading,.project-grid [data-project-card],.expertise-heading,.transformation-copy,.comparison-wrap,.warranty-heading,.warranty-grid article,.contact-copy,.quote-panel')]))];
  function play(target,frames,{duration=650,delay=0,hero=false,...extra}={}){
    if(!target||!pageActive||reduced()||typeof target.animate!=='function')return;
    let animation;
    try{animation=target.animate(frames,{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...extra});}catch{return;}
    if(!animation)return;running.add(animation);if(hero)heroEffects.add(animation);
    const settle=()=>{running.delete(animation);heroEffects.delete(animation);animation.onfinish=animation.oncancel=null;};
    animation.onfinish=animation.oncancel=settle;
    animation.finished?.then(settle,settle);
  }
  function enterHero(event){
    if(heroStarted||!pageActive)return;heroStarted=true;
    document.removeEventListener('renov-intro-leaving',enterHero);
    root.classList.add('hero-entrance-armed');
    const navigation=performance.getEntriesByType?.('navigation')[0];
    if(reduced()||scrollY>0||event?.detail?.reason!=='ready'||!root.classList.contains('intro-pending')||navigation?.type==='back_forward'||(location.hash&&!['#haut','#accueil'].includes(location.hash)))return;
    play(document.querySelector('.hero-copy>.eyebrow'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,hero:true});
    [...document.querySelectorAll('.hero-line-inner')].forEach((line,index)=>play(line,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:index*40,hero:true}));
    play(document.querySelector('.hero-rule'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:600,delay:40,hero:true});
    play(document.querySelector('.hero-brief'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:70,hero:true});
    play(document.querySelector('.hero-controls'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:100,hero:true});
    play(document.querySelector('.hero-project'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:70,hero:true});
  }
  function lift(target,distance=18,delay=0,duration=680){
    play(target,[{transform:`translate3d(0,${distance}px,0)`},{transform:'translate3d(0,0,0)'}],{duration,delay,easing:'cubic-bezier(.22,.75,.22,1)'});
  }
  function reveal(entry){
    const {target}=entry;
    if(seen.has(target)||!pageActive||target.hidden)return;
    seen.add(target);observer?.unobserve(target);
    // Restored scroll, anchors and fast jumps keep already-read content steady.
    // No initial opacity or visibility gate: images and text never disappear.
    if(reduced()||(entry.boundingClientRect&&entry.boundingClientRect.top<innerHeight*.35))return;
    if(target.matches('[data-project-card]')){
      lift(target.querySelector('.project-photo'),22,0,720);
      lift(target.querySelector('.project-caption'),10,45,600);
    }else if(target.matches('.expertise-overview')){
      const direction=target.closest('article')===target.closest('.expertise-columns').children[1]?-1:1;
      play(target,[{transform:`translate3d(${direction*12}px,0,0)`},{transform:'translate3d(0,0,0)'}],{duration:680,easing:'cubic-bezier(.22,.75,.22,1)'});
    }else if(target.matches('.material-photo,.material-detail,.material-context,.expertise-photo')){
      lift(target,24,0,760);
    }else if(target.matches('.warranty-grid article')){
      lift(target.querySelector('a:first-child'),16,0,720);
      lift(target.querySelector('h3'),8,40,580);
    }else if(target.matches('.comparison-wrap')){
      lift(target,18,0,720);
    }else{
      lift(target,12,0,620);
    }
  }
  function observe(){
    if(typeof IntersectionObserver!=='function')return;
    if(!observer)observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry);}),{threshold:0,rootMargin:'0px 0px 80px 0px'});
    items.filter(item=>!seen.has(item)).forEach(item=>observer.observe(item));
  }
  function cancelHero(){[...heroEffects].forEach(animation=>{try{animation.cancel();}catch{}});heroEffects.clear();}
  function cancel(){[...running].forEach(animation=>{try{animation.cancel();}catch{}});running.clear();heroEffects.clear();}
  function onMotion(){if(reduced())cancel();}
  document.addEventListener('renov-motion-change',onMotion);media?.addEventListener?.('change',onMotion);
  document.addEventListener('renov-intro-leaving',enterHero);
  // A late script never hides a hero that the visitor has already seen.
  if(root.classList.contains('intro-leaving'))enterHero({detail:{reason:'ready'}});
  document.addEventListener('renov-intro-complete',observe,{once:true});
  if(!root.classList.contains('intro-pending'))observe();
  window.addEventListener('scroll',()=>{if(scrollY>0&&heroEffects.size)cancelHero();},{passive:true});
  window.addEventListener('resize',cancel,{passive:true});
  window.addEventListener('pagehide',()=>{pageActive=false;observer?.disconnect();cancel();});
  window.addEventListener('pageshow',event=>{if(event.persisted){pageActive=true;observe();}});
})();
