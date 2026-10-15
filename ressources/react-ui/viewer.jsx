import React, {useState,useRef,useLayoutEffect,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
const dialog=document.querySelector('#project-dialog');
const projects=new Map(window.RENOV_DATA.projects.map(p=>[p.id,p]));
const root=createRoot(dialog);let controller=null,opener=null,opening=0;
const media=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>Boolean(window.RENOV_MOTION?.reduced())||media.matches;
const source=p=>'./assets/photos/'+p.file+'.webp';
const srcset=p=>p.mobileWidth?`./assets/photos/${p.file}-mobile.webp ${p.mobileWidth}w, ${source(p)} ${p.width}w`:undefined;
function Arrow({direction='right'}){return <svg className="direction-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={direction==='left'?'M19 12H5m6-6-6 6 6 6':'M5 12h14m-6-6 6 6-6 6'}/></svg>;}
function Viewer({project}){
 const [view,setView]=useState({photo:project.images[0],index:0,previous:null,ready:false,loading:true,message:''});
 const [expanded,setExpanded]=useState(false);
 const current=useRef(view),desired=useRef(0),sequence=useRef(0),pending=useRef(null),effects=useRef(new Set()),closing=useRef(null),closeTimer=useRef(null),picture=useRef(null),outgoing=useRef(null),gesture=useRef(null);
 current.current=view;
 function cancelEffects(){for(const a of effects.current){try{a.cancel();}catch{}}effects.current.clear();}
 function animate(el,frames,options={}){
  if(!el||reduced()||typeof el.animate!=='function')return null;
  const a=el.animate(frames,{duration:620,easing:'cubic-bezier(.22,.75,.22,1)',fill:'backwards',...options});effects.current.add(a);
  a.finished?.then(()=>effects.current.delete(a),()=>effects.current.delete(a));return a;
 }
 function cancelPending(){pending.current?.();pending.current=null;sequence.current++;}
 function request(index){
  cancelPending();const token=sequence.current;
  desired.current=(index+project.images.length)%project.images.length;const next=desired.current,photo=project.images[next];
  if(current.current.ready&&next===current.current.index){setView(v=>({...v,loading:false,message:''}));return;}
  setView(v=>({...v,loading:true,message:''}));
  const image=new Image();let active=true;
  const release=()=>{active=false;clearTimeout(timer);image.onload=image.onerror=null;if(pending.current===abort)pending.current=null;};
  const abort=()=>{release();image.removeAttribute('srcset');image.removeAttribute('src');};
  const fail=()=>{if(!active||token!==sequence.current)return;release();setView(v=>({...v,loading:false,message:'La photographie ne peut pas être chargée. Réessayez.'}));};
  const timer=setTimeout(fail,15000);pending.current=abort;
  image.onload=async()=>{
   try{await image.decode?.();}catch{if(!image.naturalWidth){fail();return;}}
   if(!active||token!==sequence.current)return;release();cancelEffects();
   setView(v=>({photo,index:next,previous:v.ready&&v.photo.file!==photo.file?v.photo:null,ready:true,loading:false,message:''}));
  };
  image.onerror=fail;image.sizes='(max-width: 960px) 92vw, 60vw';if(srcset(photo))image.srcset=srcset(photo);image.src=source(photo);
 }
 function finishClose(){clearTimeout(closeTimer.current);closeTimer.current=null;cancelPending();cancelEffects();closing.current=null;dialog.classList.remove('is-closing','is-photo-mode');if(dialog.open)dialog.close();}
 function close(){
  if(!dialog.open||closing.current)return;
  cancelPending();cancelEffects();if(reduced()||typeof dialog.animate!=='function'){finishClose();return;}
  dialog.classList.add('is-closing');closing.current=animate(dialog,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(10px)'}],{duration:200,easing:'ease-in'});
  closing.current?.finished?.then(finishClose,()=>{});closeTimer.current=setTimeout(finishClose,260);
 }
 useLayoutEffect(()=>{
  if(!view.ready)return;
  const incoming=animate(picture.current,[{opacity:0},{opacity:1}]);
  animate(outgoing.current,[{opacity:1},{opacity:0}]);
  const cleanup=()=>setView(v=>v.photo===view.photo?{...v,previous:null}:v);
  if(incoming)incoming.finished?.then(cleanup,cleanup);else cleanup();
 },[view.photo,view.ready]);
 useLayoutEffect(()=>{dialog.classList.toggle('is-photo-mode',expanded);},[expanded]);
 useLayoutEffect(()=>{controller={request,close,dispose:finishClose,enter:()=>animate(dialog,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:420})};request(0);return()=>{cancelPending();cancelEffects();clearTimeout(closeTimer.current);controller=null;};},[]);
 useEffect(()=>{
  const onCancel=e=>{e.preventDefault();if(expanded)setExpanded(false);else close();};
  const onClose=()=>{cancelPending();cancelEffects();clearTimeout(closeTimer.current);closing.current=null;dialog.classList.remove('is-closing','is-photo-mode');document.body.classList.remove('dialog-open');opener?.isConnected&&opener.focus({preventScroll:true});};
  const onKey=e=>{if(!dialog.open||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();request(desired.current+(e.key==='ArrowRight'?1:-1));}};
  const onMotion=()=>{if(reduced()){cancelEffects();setView(v=>({...v,previous:null}));if(closing.current)finishClose();}};
  const onOutside=e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();};
  const onResize=()=>{cancelEffects();setView(v=>({...v,previous:null}));};
  dialog.addEventListener('cancel',onCancel);dialog.addEventListener('close',onClose);dialog.addEventListener('keydown',onKey);dialog.addEventListener('click',onOutside);
  document.addEventListener('renov-motion-change',onMotion);media.addEventListener('change',onMotion);window.addEventListener('resize',onResize);window.addEventListener('pagehide',finishClose);
  return()=>{dialog.removeEventListener('cancel',onCancel);dialog.removeEventListener('close',onClose);dialog.removeEventListener('keydown',onKey);dialog.removeEventListener('click',onOutside);document.removeEventListener('renov-motion-change',onMotion);media.removeEventListener('change',onMotion);window.removeEventListener('resize',onResize);window.removeEventListener('pagehide',finishClose);};
 },[expanded]);
 function swipeEnd(e){const start=gesture.current;gesture.current=null;if(!start||e.pointerType!=='touch')return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)request(desired.current+(dx<0?1:-1));}
 return <><button type="button" className="dialog-close" data-dialog-close aria-label="Fermer le projet" onClick={close}>×</button>
 <div className="project-dialog-layout"><div className="project-dialog-media">
 <div className="project-react-stage" aria-busy={view.loading} onPointerDown={e=>{if(e.pointerType==='touch'){gesture.current={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}}}} onPointerUp={swipeEnd} onPointerCancel={()=>{gesture.current=null;}} onLostPointerCapture={()=>{gesture.current=null;}}>
 <img ref={picture} id="project-dialog-image" src={source(view.photo)} srcSet={srcset(view.photo)} sizes="(max-width: 960px) 92vw, 60vw" alt={view.ready?view.photo.alt:''} width={view.photo.width} height={view.photo.height} style={{visibility:view.ready?'visible':'hidden'}}/>
 {view.previous&&<img ref={outgoing} className="project-react-previous" src={source(view.previous)} srcSet={srcset(view.previous)} sizes="(max-width: 960px) 92vw, 60vw" alt="" aria-hidden="true"/>}
 {(view.loading||view.message)&&<p className="project-load-status" role="status">{view.message||'Chargement de la photographie…'}{view.message&&<button type="button" onClick={()=>request(desired.current)}>Réessayer</button>}</p>}
 </div>
 <div className="project-dialog-controls"><button id="project-photo-prev" type="button" aria-label="Photographie précédente" disabled={project.images.length<2} onClick={()=>request(desired.current-1)}><Arrow direction="left"/></button><span id="project-photo-count" aria-live="polite">{String(view.index+1).padStart(2,'0')} / {String(project.images.length).padStart(2,'0')}</span><button type="button" className="project-photo-expand" aria-expanded={expanded} aria-label={expanded?'Revenir à la fiche':'Agrandir la photographie'} onClick={()=>setExpanded(v=>!v)}><svg className="direction-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5"/></svg></button><button id="project-photo-next" type="button" aria-label="Photographie suivante" disabled={project.images.length<2} onClick={()=>request(desired.current+1)}><Arrow/></button></div>
 {project.images.length>1&&<div className="project-thumbnails" aria-label="Photographies du projet">{project.images.map((p,i)=><button type="button" key={p.file} aria-label={'Voir la photographie '+(i+1)} aria-pressed={view.index===i} onClick={()=>request(i)}><img src={'./assets/photos/'+p.file+(p.mobileWidth?'-mobile':'')+'.webp'} alt="" loading="lazy" width="56" height="44"/></button>)}</div>}
 </div><div className="project-dialog-copy"><p className="eyebrow" id="project-dialog-category">{project.label}</p><h2 id="project-dialog-title">{project.title}</h2><p id="project-dialog-description">{project.description}</p><ul id="project-dialog-details">{project.details.map(detail=><li key={detail}>{detail}</li>)}</ul><a className="button button-gold" href="#devis" id="project-dialog-quote" onClick={finishClose}>Parlons de votre projet <Arrow/></a></div></div></>;
}
window.RENOV_PROJECTS={open(id,trigger){const project=projects.get(id);if(!project||typeof dialog.showModal!=='function')return false;if(dialog.open)controller?.dispose();opener=trigger;document.dispatchEvent(new Event('renov-close-menu'));flushSync(()=>root.render(<Viewer key={id+'-'+(++opening)} project={project}/>));dialog.classList.add('has-react-viewer');dialog.showModal();document.body.classList.add('dialog-open');controller?.enter();return true;}};
