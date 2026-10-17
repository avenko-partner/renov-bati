(() => {
  'use strict';
  const root=document.documentElement,overlay=document.querySelector('#brand-intro');
  if(!overlay)return;
  const pages=new Set(['index.html','projets.html','informations.html']);
  const motion=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  let leaving=false,departureTimer=0,recoveryTimer=0,surfaces=[];
  const canonical=url=>url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
  function restore(){
    clearTimeout(departureTimer);clearTimeout(recoveryTimer);leaving=false;
    root.classList.remove('page-departing');
    if(!root.classList.contains('intro-pending')){overlay.hidden=true;overlay.setAttribute('aria-hidden','true');}
    surfaces.forEach(([node,wasInert])=>{if(!wasInert)node.removeAttribute('inert');});surfaces=[];
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');
    if(!link||link.hasAttribute('download')||link.hasAttribute('data-work')||link.hasAttribute('data-project')||(link.target&&link.target!=='_self')||link.relList.contains('external'))return;
    let target,current;
    try{target=new URL(link.href,location.href);current=new URL(location.href);}catch{return;}
    if(!['http:','https:','file:'].includes(target.protocol)||target.protocol!==current.protocol||target.origin!==current.origin)return;
    const targetPath=canonical(target),currentPath=canonical(current);
    if(!pages.has(targetPath.split('/').pop())||targetPath.slice(0,targetPath.lastIndexOf('/'))!==currentPath.slice(0,currentPath.lastIndexOf('/')))return;
    if(targetPath===currentPath&&target.search===current.search)return;
    if(motion())return;
    event.preventDefault();if(leaving)return;
    leaving=true;
    // Native dialogs are in the top layer; close them before covering the page.
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    document.dispatchEvent(new CustomEvent('renov-close-menu'));
    surfaces=[...document.querySelectorAll('header,main,.site-footer,.skip-link')].map(node=>[node,node.hasAttribute('inert')]);
    surfaces.forEach(([node])=>node.setAttribute('inert',''));
    overlay.hidden=false;overlay.setAttribute('aria-hidden','true');root.classList.add('page-departing');
    document.dispatchEvent(new CustomEvent('renov-page-leaving'));
    // Cover this document only. The destination owns the single logo drawing.
    departureTimer=setTimeout(()=>{try{location.assign(target.href);}catch{restore();}},120);
    // Restore a usable page if a browser cancels the navigation.
    recoveryTimer=setTimeout(restore,10000);
  });
  window.addEventListener('pageshow',event=>{if(event.persisted||leaving)restore();});
  window.addEventListener('pagehide',()=>{clearTimeout(departureTimer);clearTimeout(recoveryTimer);});
})();
