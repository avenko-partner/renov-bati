(() => {
  'use strict';
  if(window.RENOV_HEADER)return;
  const root=document.documentElement,body=document.body;
  const header=document.querySelector('.site-header'),toggle=header?.querySelector('.menu-toggle');
  const nav=header?.querySelector('.main-nav'),pageProgress=header?.querySelector('.page-progress');
  if(!header||!toggle||!nav)return;
  const navLinks=[...nav.querySelectorAll('a')],quote=header.querySelector('.header-quote');
  const splitScreen=typeof matchMedia==='function'?matchMedia('(horizontal-viewport-segments: 2)'):{matches:false};
  const compactNavigation=()=>innerWidth<=1100||splitScreen.matches;
  const canonical=url=>url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
  const currentURL=new URL(location.href);
  const navEntries=navLinks.map(link=>{
    let section=null,page=false;
    try{
      const target=new URL(link.href,location.href);
      const local=target.origin===currentURL.origin&&canonical(target)===canonical(currentURL)&&target.search===currentURL.search;
      if(local&&target.hash)section=document.getElementById(decodeURIComponent(target.hash.slice(1)));
      page=local&&!target.hash;
    }catch{}
    return {link,section,page,top:Infinity};
  });
  function syncNavigation(){
    const concealed=compactNavigation()&&!header.classList.contains('menu-is-open');
    nav.toggleAttribute('inert',concealed);
    if(concealed)nav.setAttribute('aria-hidden','true');else nav.removeAttribute('aria-hidden');
  }
  function closeMenu(){
    header.classList.remove('menu-is-open');body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Ouvrir le menu');syncNavigation();
  }
  toggle.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')!=='true';
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    header.classList.toggle('menu-is-open',open);body.classList.toggle('menu-open',open);syncNavigation();
  });
  header.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('renov-close-menu',closeMenu);
  document.addEventListener('keydown',event=>{
    if(!body.classList.contains('menu-open'))return;
    if(event.key==='Escape'){closeMenu();toggle.focus();}
    if(event.key==='Tab'){
      const controls=[header.querySelector('.brand'),...navLinks,quote,toggle].filter(Boolean),first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });

  // One shared scroll controller; layout is read only after a real size change.
  let scrollFrame=null,metricsDirty=true,scrollActive=true;
  let scrollMax=1,viewportHeight=innerHeight,currentLink=null,headerScrolled=null,lastProgress=-1;
  function updateScroll(){
    scrollFrame=null;if(!scrollActive)return;
    const y=scrollY;
    if(metricsDirty){
      viewportHeight=innerHeight;scrollMax=Math.max(1,root.scrollHeight-viewportHeight);
      navEntries.forEach(entry=>{entry.top=entry.section?entry.section.getBoundingClientRect().top+y:Infinity;});
      metricsDirty=false;
    }
    let current=navEntries.find(entry=>entry.page)||null;
    navEntries.forEach(entry=>{if(entry.section&&entry.top<=y+viewportHeight*.3)current=entry;});
    const progress=Math.max(0,Math.min(1,y/scrollMax)),scrolled=y>40;
    if(progress!==lastProgress){if(pageProgress)pageProgress.style.transform=`scaleX(${progress})`;lastProgress=progress;}
    if(scrolled!==headerScrolled){header.classList.toggle('is-scrolled',scrolled);headerScrolled=scrolled;}
    if((current?.link||null)!==currentLink){
      navEntries.forEach(entry=>{if(entry===current)entry.link.setAttribute('aria-current',entry.page?'page':'location');else entry.link.removeAttribute('aria-current');});
      currentLink=current?.link||null;
    }
  }
  function requestScrollUpdate(){if(scrollActive&&scrollFrame===null)scrollFrame=requestAnimationFrame(updateScroll);}
  function invalidateScrollMetrics(){metricsDirty=true;requestScrollUpdate();}
  window.addEventListener('scroll',requestScrollUpdate,{passive:true});
  window.addEventListener('resize',()=>{if(!compactNavigation())closeMenu();else syncNavigation();invalidateScrollMetrics();},{passive:true});
  splitScreen.addEventListener?.('change',()=>{if(!compactNavigation())closeMenu();else syncNavigation();invalidateScrollMetrics();});
  if(typeof ResizeObserver==='function'){
    const layoutObserver=new ResizeObserver(invalidateScrollMetrics);
    [body,document.querySelector('main'),header].filter(Boolean).forEach(surface=>layoutObserver.observe(surface));
  }
  document.fonts?.ready?.then(invalidateScrollMetrics,()=>{});
  document.addEventListener('renov-intro-complete',invalidateScrollMetrics);
  document.addEventListener('renov-layout-change',invalidateScrollMetrics);
  document.addEventListener('renov-gallery-change',invalidateScrollMetrics);
  window.addEventListener('load',invalidateScrollMetrics,{once:true});
  window.addEventListener('pagehide',()=>{scrollActive=false;if(scrollFrame!==null)cancelAnimationFrame(scrollFrame);scrollFrame=null;closeMenu();});
  window.addEventListener('pageshow',event=>{if(event.persisted){scrollActive=true;closeMenu();invalidateScrollMetrics();}});
  window.RENOV_HEADER=Object.freeze({refresh:invalidateScrollMetrics,closeMenu});
  syncNavigation();updateScroll();
})();
