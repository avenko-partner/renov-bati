(() => {
  'use strict';
  const root=document.documentElement,button=document.querySelector('#motion-toggle');
  const media=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  let manual=false;
  const reduced=()=>Boolean(media.matches||manual);
  function apply(){
    root.classList.toggle('reduce-motion',reduced());
    if(button){button.setAttribute('aria-pressed',String(reduced()));button.disabled=Boolean(media.matches);button.textContent=media.matches?'Animations réduites (système)':manual?'Réactiver les animations':'Réduire les animations';}
    document.dispatchEvent(new CustomEvent('renov-motion-change',{detail:{reduced:reduced()}}));
  }
  window.RENOV_MOTION={reduced};
  button?.addEventListener('click',()=>{manual=!manual;apply();});
  media.addEventListener?.('change',apply);
  root.classList.add('js');apply();
})();
