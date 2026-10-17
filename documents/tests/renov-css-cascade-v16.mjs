import fs from 'node:fs';
import path from 'node:path';
import * as tree from 'css-tree';
export function tokenize(value){let level=0,start=0,out=[];for(let i=0;i<value.length;i++){if(value[i]==='(')level++;if(value[i]===')')level--;if(/\s/.test(value[i])&&!level){if(i>start)out.push(value.slice(start,i));start=i+1;}}if(value.length>start)out.push(value.slice(start));return out;}
export function mediaMatches(query,p){return query.split(/,(?![^()]*\))/).some(part=>{
 const terms=[...part.matchAll(/\(([^:()]+):\s*([^()]+)\)/g)];
 return terms.every(([,key,value])=>{key=key.trim();value=value.trim();const n=Number.parseFloat(value);switch(key){case 'max-width':return p.w<=n;case 'min-width':return p.w>=n;case 'max-height':return p.h<=n;case 'min-height':return p.h>=n;case 'orientation':return value===(p.w>p.h?'landscape':'portrait');case 'horizontal-viewport-segments':return (p.hs||1)===n;case 'vertical-viewport-segments':return (p.vs||1)===n;case 'prefers-reduced-motion':return value===(p.reduced?'reduce':'no-preference');case 'hover':return value===(p.fine?'hover':'none');case 'pointer':return value===(p.fine?'fine':'coarse');default:throw new Error('Unsupported media feature '+key);}});
});}
function specificity(selector){let value=0;tree.walk(selector,node=>{if(node.type==='IdSelector')value+=1e6;else if(node.type==='ClassSelector'||node.type==='AttributeSelector')value+=1e3;else if(node.type==='PseudoClassSelector'&&!['not','is','has','where'].includes(node.name))value+=1e3;else if(node.type==='TypeSelector'&&node.name!=='*')value++;});return value;}
function expand(property,value){const out=[[property,value]];if(['padding','margin'].includes(property)){const v=tokenize(value),side=[v[0],v[1]||v[0],v[2]||v[0],v[3]||v[1]||v[0]];['top','right','bottom','left'].forEach((s,i)=>out.push([property+'-'+s,side[i]]));}if(property==='padding-inline'){const v=tokenize(value);out.push(['padding-left',v[0]],['padding-right',v[1]||v[0]]);}if(property==='padding-block'){const v=tokenize(value);out.push(['padding-top',v[0]],['padding-bottom',v[1]||v[0]]);}if(property==='gap'){const v=tokenize(value);out.push(['row-gap',v[0]],['column-gap',v[1]||v[0]]);}return out;}
const ruleCache=new Map();
export function styleEngine(directory,document,profile){
 const cacheKey=directory+'\0'+[...document.querySelectorAll('link[rel="stylesheet"]')].map(el=>el.getAttribute('href')).join('|');const rules=ruleCache.get(cacheKey)||[];const cached=ruleCache.has(cacheKey);let order=0;
 function visit(list,media=[]){list.forEach(node=>{if(node.type==='Atrule'){if(node.name==='media')visit(node.block.children,[...media,tree.generate(node.prelude)]);else if(node.name==='supports'&&node.block)visit(node.block.children,media);return;}if(node.type!=='Rule'||node.prelude.type!=='SelectorList')return;const declarations=[];node.block.children.forEach(d=>{if(d.type==='Declaration')for(const [property,value]of expand(d.property,tree.generate(d.value)))declarations.push({property,value,important:d.important});});node.prelude.children.forEach(selector=>{rules.push({selector:tree.generate(selector),specificity:specificity(selector),declarations,media,order:++order});});});}
 if(!cached){for(const el of document.querySelectorAll('link[rel="stylesheet"]'))visit(tree.parse(fs.readFileSync(path.join(directory,el.getAttribute('href')),'utf8')).children);ruleCache.set(cacheKey,rules);}
 const inherit=new Set(['font-size','font-family','font-weight','line-height','letter-spacing','color','visibility']);
 const computed=new WeakMap();
 function compute(el){if(computed.has(el))return computed.get(el);const props={},wins={};if(el.parentElement){const parent=compute(el.parentElement);for(const [k,v]of Object.entries(parent))if(inherit.has(k)||k.startsWith('--'))props[k]=v;}
  for(const r of rules){if(r.selector.includes('::')||!r.media.every(q=>mediaMatches(q,profile)))continue;let matches=false;try{matches=el.matches(r.selector);}catch{}if(!matches)continue;for(const d of r.declarations){const key=[Number(d.important),r.specificity,r.order],old=wins[d.property];if(!old||key[0]>old[0]||(key[0]===old[0]&&(key[1]>old[1]||(key[1]===old[1]&&key[2]>=old[2])))){wins[d.property]=key;props[d.property]=d.value;}}}
  for(let i=0;i<el.style.length;i++){const k=el.style[i];for(const [property,value]of expand(k,el.style.getPropertyValue(k)))if(!wins[property]?.[0]||el.style.getPropertyPriority(k)==='important')props[property]=value;}
  computed.set(el,props);return props;
 }
 const selected=selector=>compute(document.querySelector(selector));
 return {compute,selected,profile};
}
function replaceFunctions(s,name,callback){let at=s.indexOf(name+'(');while(at!==-1){let end=at+name.length+1,depth=1;for(;end<s.length&&depth;end++){if(s[end]==='(')depth++;if(s[end]===')')depth--;}if(depth)throw new Error('Unclosed '+s);const args=s.slice(at+name.length+1,end-1);s=s.slice(0,at)+callback(args)+s.slice(end);at=s.indexOf(name+'(');}return s;}
export function numeric(value,props,p,{font=16,parentFont=16,percent=p.w}={}){
 let s=value||'0';s=replaceFunctions(s,'var',args=>{const [key,...fallback]=args.split(',');const v=props[key.trim()]??fallback.join(',');if(!v)throw new Error('Unknown variable '+key);return String(numeric(v,props,p,{font,parentFont,percent}));});
 s=replaceFunctions(s,'env',args=>{const [name,...fallback]=args.split(',');const k=name.trim();if(k.includes('viewport-segment-width'))return String(p.paneW||p.w);if(k.includes('viewport-segment-height'))return String(p.paneH||p.h);if(k.includes('safe-area-inset-top'))return String(p.safeTop||0);if(k.includes('safe-area-inset-bottom'))return String(p.safeBottom||0);if(k.includes('safe-area-inset-left'))return String(p.safeLeft||0);if(k.includes('safe-area-inset-right'))return String(p.safeRight||0);if(k.includes('safe-area-inset-'))return '0';if(k.includes('viewport-segment-left'))return String(p.paneW||p.w);if(k.includes('viewport-segment-top'))return '0';return fallback.join(',')||'0';});
 s=s.replace(/([\d.]+)(svh|dvh|vh|vw|rem|em|px|%)/g,(_,n,u)=>{const scale={svh:p.h/100,dvh:p.h/100,vh:p.h/100,vw:p.w/100,rem:16,em:font,px:1,'%':percent/100};return String(Number(n)*scale[u]);});
 const tokens=s.match(/clamp|min|max|calc|[\d.]+|[-+*/(),]/g)||[];
 if(tokens.join('')!==s.replace(/\s/g,''))throw new Error('Unsupported numeric value '+s);
 let i=0;
 function atom(){const t=tokens[i++];if(t==='('){const v=expression();if(tokens[i++]!==')')throw new Error('Unclosed group');return v;}if(t==='-')return -atom();if(t==='+')return atom();if(['clamp','min','max','calc'].includes(t)){if(tokens[i++]!=='(')throw new Error('Function');const values=[expression()];while(tokens[i]===','){i++;values.push(expression());}if(tokens[i++]!==')')throw new Error('Function end');return t==='min'?Math.min(...values):t==='max'?Math.max(...values):t==='clamp'?Math.max(values[0],Math.min(values[1],values[2])):values[0];}const n=Number(t);if(!Number.isFinite(n))throw new Error('Number '+t);return n;}
 function product(){let v=atom();while(['*','/'].includes(tokens[i])){const op=tokens[i++],next=atom();v=op==='*'?v*next:v/next;}return v;}
 function expression(){let v=product();while(['+','-'].includes(tokens[i])){const op=tokens[i++],next=product();v=op==='+'?v+next:v-next;}return v;}
 const result=expression();if(i!==tokens.length)throw new Error('Trailing tokens');return result;
}
export function tracks(value){const repeat=value.match(/^repeat\((\d+),/);const weights=[...value.matchAll(/([\d.]+)fr/g)].map(x=>Number(x[1]));return repeat?Array(Number(repeat[1])).fill(weights[0]||1):weights;}
