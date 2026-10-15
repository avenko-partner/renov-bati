(() => {
 'use strict';
 let loading=null,intent=0;
 function load(){
  if(window.RENOV_PROJECTS)return Promise.resolve(window.RENOV_PROJECTS);
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='./projects-react.js';script.async=true;
   script.onload=()=>window.RENOV_PROJECTS?resolve(window.RENOV_PROJECTS):reject(new Error('Viewer unavailable'));
   script.onerror=()=>{script.remove();loading=null;reject(new Error('Viewer unavailable'));};document.head.append(script);
  });return loading;
 }
 // Warm the component on intent, never during the logo introduction.
 const warm=event=>{if(!document.documentElement.classList.contains('intro-pending')&&event.target.closest('[data-project]'))load().catch(()=>{});};
 document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-project]');if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(typeof document.querySelector('#project-dialog')?.showModal!=='function')return;
  event.preventDefault();const ticket=++intent;
  load().then(viewer=>{if(ticket===intent&&!viewer.open(link.dataset.project,link))location.href=link.href;}).catch(()=>{if(ticket===intent)location.href=link.href;});
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape')intent++;});
 window.addEventListener('pagehide',()=>{intent++;});
})();
