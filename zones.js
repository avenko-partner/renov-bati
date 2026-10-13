(() => {
  'use strict';
  const field=document.querySelector('#commune-query');
  if(!field)return;
  const items=[...document.querySelectorAll('[data-commune]')];
  const groups=[...document.querySelectorAll('.commune-group')];
  const alphabet=[...document.querySelectorAll('.commune-alphabet a')];
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const names=new Map(items.map(item=>[item,normalize(item.dataset.commune)]));
  function filter(){
    const query=normalize(field.value);let count=0;
    items.forEach(item=>{item.hidden=!query.split(' ').every(word=>names.get(item).includes(word));if(!item.hidden)count++;});
    groups.forEach(group=>{group.hidden=![...group.querySelectorAll('[data-commune]')].some(item=>!item.hidden);});
    alphabet.forEach(link=>{const inactive=document.querySelector(link.getAttribute('href')).hidden;link.setAttribute('aria-disabled',String(inactive));link.tabIndex=inactive?-1:0;});
    document.querySelector('#commune-count').textContent=`${count} ${count===1?'commune':'communes'}`;
    document.querySelector('#commune-empty').hidden=count>0;
  }
  field.addEventListener('input',filter);
  document.querySelector('#commune-reset').addEventListener('click',()=>{field.value='';filter();field.focus();});
  alphabet.forEach(link=>link.addEventListener('click',event=>{if(link.getAttribute('aria-disabled')==='true')event.preventDefault();}));
  document.querySelector('#area-search').hidden=false;
})();
