(() => {
'use strict';
const root=document.documentElement;
if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const navigation=typeof performance.getEntriesByType==='function'?performance.getEntriesByType('navigation')[0]:null;
if(navigation?.type==='back_forward')return;
const state={finished:false,failsafe:null,startedAt:performance.now()};window.RENOV_INTRO=state;root.classList.add('intro-pending');
function release(reason){if(state.finished){if(reason==='timeout')state.forceHide?.();cleanup();return;}if(typeof state.finish==='function')state.finish(reason);else{state.finished=true;clearTimeout(state.failsafe);root.classList.remove('intro-pending','intro-running','intro-leaving');const overlay=document.querySelector('#brand-intro');if(overlay){overlay.setAttribute('aria-hidden','true');overlay.hidden=true;}}cleanup();}
function key(e){if(e.key==='Escape'&&root.classList.contains('intro-pending')){e.preventDefault();release('escape');}}
function cleanup(){document.removeEventListener('keydown',key);}
document.addEventListener('keydown',key);document.addEventListener('renov-intro-complete',cleanup,{once:true});
state.failsafe=setTimeout(()=>release('timeout'),7000);
})();
