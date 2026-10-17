(() => {
 'use strict';
 const stage=document.querySelector('#compare-stage'),range=stage?.querySelector('input[type=range]'),wrap=stage?.closest('.comparison-wrap'),button=wrap?.querySelector('.compare-auto');if(!stage||!range||!button)return;
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)'),reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||Boolean(media?.matches);
 const half=9000,idle=4000;let phase=0,visible=typeof IntersectionObserver!=='function',paused=false,dragging=false,raf=0,timer=0,lastFrame=null,lastInput=-Infinity,shown=0;
 function write(value){const next=Math.max(0,Math.min(100,value));range.value=next.toFixed(2);range.dispatchEvent(new Event('input',{bubbles:true}));shown=next;}
 function stop(){cancelAnimationFrame(raf);raf=0;clearTimeout(timer);timer=0;lastFrame=null;}
 function allowed(){return visible&&!paused&&!dragging&&!document.hidden&&!reduced()&&!document.querySelector('dialog[open]');}
 function controls(){button.disabled=reduced();button.setAttribute('aria-pressed',String(!paused&&!reduced()));button.textContent=reduced()?'Animations réduites':paused?'Reprendre le défilement':'Mettre en pause le défilement';}
 function schedule(){stop();controls();if(!allowed())return;const delay=lastInput+idle-performance.now();if(delay>0){timer=setTimeout(schedule,delay+1);return;}raf=requestAnimationFrame(tick);}
 function tick(now){raf=0;if(!allowed()){stop();return;}if(lastFrame===null)lastFrame=now;stage.classList.remove('is-settling');const dt=Math.max(0,Math.min(80,now-lastFrame));lastFrame=now;phase=(phase+dt)%(half*2);write(50-50*Math.cos(Math.PI*phase/half));raf=requestAnimationFrame(tick);}
 function syncManual(){const n=Math.max(0,Math.min(100,Number(range.value))),ascending=phase<half,position=Math.acos(1-2*n/100)*half/Math.PI;phase=ascending?position:2*half-position;shown=n;lastInput=performance.now();schedule();}
 // The pointer may rest over the image; only an actual interaction pauses it.
 stage.addEventListener('pointerdown',()=>{dragging=true;lastInput=performance.now();stop();});
 function release(){if(!dragging)return;dragging=false;syncManual();}
 document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 range.addEventListener('input',event=>{if(event.isTrusted)syncManual();});range.addEventListener('change',syncManual);wrap.addEventListener('keydown',()=>{lastInput=performance.now();stop();});wrap.addEventListener('keyup',syncManual);
 wrap.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',syncManual));
 button.addEventListener('click',()=>{paused=!paused;schedule();});
 document.addEventListener('visibilitychange',schedule);document.addEventListener('renov-motion-change',schedule);media?.addEventListener?.('change',schedule);document.addEventListener('renov-gallery-change',schedule);
 if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);schedule();},{threshold:0}).observe(stage);
 if(typeof MutationObserver==='function')new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',schedule);
 if(!reduced())write(0);else shown=Number(range.value);controls();schedule();
})();
