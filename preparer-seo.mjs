// Métadonnées produites au build seulement. Aucun accès réseau ni publication.
import fs from 'node:fs';
import path from 'node:path';

export function seoSettings(env){
  const explicit=(env.SITE_URL||'').trim();
  const automatic=(env.VERCEL_PROJECT_PRODUCTION_URL||'').trim();
  const candidate=explicit||(automatic?`https://${automatic}`:'');
  let origin='';
  if(candidate){
    let url;
    try{url=new URL(candidate);}catch{throw new Error('SITE_URL doit être une URL HTTPS valide.');}
    if(url.protocol!=='https:'||!url.hostname||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('SITE_URL doit être l’origine HTTPS du site, sans chemin, paramètres ni identifiants.');
    origin=url.origin+'/';
  }
  const environment=env.VERCEL_TARGET_ENV||env.VERCEL_ENV||'';
  return {origin,preview:Boolean(environment&&environment!=='production')};
}

const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const titleText=value=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');

export function prepareSeo(output,pages,{origin,preview}){
  const entries=[];
  const absolute=ref=>new URL(ref,origin).href;
  const absoluteRefs=(value,key)=>{
    if(Array.isArray(value))return value.map(v=>absoluteRefs(v,key));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,absoluteRefs(v,k)]));
    if(typeof value==='string'&&['@id','url','image','logo','contentUrl'].includes(key)&&/^(?:#|\.\/)/.test(value))return absolute(value);
    return value;
  };
  for(const name of pages){
    const file=path.join(output,name);
    let html=fs.readFileSync(file,'utf8');
    if(origin){
      const url=absolute(name==='index.html'?'./':name);
      html=html.replace(/<link\b[^>]*\brel="canonical"[^>]*>/gi,'')
        .replace(/<meta\b[^>]*\bproperty="og:(?:url|image|image:alt)"[^>]*>/gi,'')
        .replace(/<meta\b[^>]*\bname="twitter:image"[^>]*>/gi,'')
        .replace(/<script\b[^>]*\bid="page-seo-data"[^>]*>[\s\S]*?<\/script>/gi,'');
      const image=absolute('assets/photos/facade-lumiere.webp');
      const meta=`<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(image)}"><meta property="og:image:alt" content="Façade et terrasse d’une réalisation Renov Bati"><meta name="twitter:image" content="${escape(image)}">`;
      html=html.replace('</head>',meta+'</head>');
      if(name==='index.html'){
        const pattern=/(<script\b[^>]*\bid="business-data"[^>]*>)([\s\S]*?)(<\/script>)/i;
        if(!pattern.test(html))throw new Error('Données Renov Bati manquantes.');
        html=html.replace(pattern,(_,open,body,close)=>{
          const data=JSON.parse(body);
          Object.assign(data,{'@id':origin+'#renov-bati',url:origin,logo:absolute('assets/logo-renov-bati.webp'),image});
          return open+json(absoluteRefs(data))+close;
        });
      }
      if(name!=='informations.html'){
        const page={'@context':'https://schema.org','@type':'WebPage','@id':url+'#page',url,name:titleText(html.match(/<title>([\s\S]*?)<\/title>/i)[1]),inLanguage:'fr-FR',about:{'@id':origin+'#renov-bati'},isPartOf:{'@id':origin+'#website'}};
        const graph=name==='index.html'?[{'@context':'https://schema.org','@type':'WebSite','@id':origin+'#website',url:origin,name:'Renov Bati',inLanguage:'fr-FR'},page]:[page];
        html=html.replace('</head>',`<script type="application/ld+json" id="page-seo-data">${json(graph)}</script></head>`);
      }
      if(!/<meta\b[^>]*\bname="robots"[^>]*\bnoindex/i.test(html)){
        const photos=[...new Set([...html.matchAll(/<img\b[^>]*\bsrc="(\.\/assets\/photos\/[^"<>]+)"/gi)].map(m=>absolute(m[1])))];
        entries.push({url,photos});
      }
    }
    if(preview)html=html.replace(/<meta\b[^>]*\bname="robots"[^>]*>/gi,'<meta name="robots" content="noindex, nofollow">');
    fs.writeFileSync(file,html);
  }
  const sitemap=path.join(output,'sitemap.xml');
  if(preview){
    fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\nDisallow: /\n');
    fs.rmSync(sitemap,{force:true});
  }else if(origin){
    const items=entries.map(({url,photos})=>'<url><loc>'+escape(url)+'</loc>'+photos.map(photo=>'<image:image><image:loc>'+escape(photo)+'</image:loc></image:image>').join('')+'</url>').join('');
    fs.writeFileSync(sitemap,'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+items+'</urlset>\n');
    fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /documents/\nDisallow: /ressources/\nSitemap: '+absolute('sitemap.xml')+'\n');
  }
}
