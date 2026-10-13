#!/usr/bin/env python3
"""Prépare les URL SEO pour un domaine choisi, sans publier le site."""
from pathlib import Path
from urllib.parse import urlsplit, urljoin
import argparse, html, json, re, shutil
from xml.etree import ElementTree as ET
from html.parser import HTMLParser

def prepare(base, output, source):
    parsed=urlsplit(base)
    if parsed.scheme!='https' or not parsed.hostname or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise ValueError('Indiquez l’URL HTTPS du domaine retenu, sans paramètres ni fragment.')
    base=base.rstrip('/')+'/'
    if output.resolve()==source.resolve() or (source/'assets').resolve()==output.resolve() or (source/'assets').resolve() in output.resolve().parents:
        raise ValueError('Le dossier de sortie doit être distinct du dossier source.')
    output.mkdir(parents=True,exist_ok=True)
    # Nettoie uniquement les anciens fichiers retirés de ce site.
    for obsolete in ('zones-intervention.html','zones.js','prestations.html'):
        if not (source/obsolete).exists():
            (output/obsolete).unlink(missing_ok=True)
    # Copie uniquement les fichiers publics et les ressources utilisées par le site.
    for f in source.iterdir():
        if f.name=='assets' and f.is_dir():shutil.copytree(f,output/f.name,dirs_exist_ok=True)
        elif f.is_file() and f.suffix in {'.html','.css','.js','.txt','.xml'} and f.name!='LIRE-MOI.txt':shutil.copy2(f,output/f.name)
    urls=[]
    photos_by_url={}
    class Photos(HTMLParser):
        def __init__(self):super().__init__();self.paths=[]
        def handle_starttag(self,tag,attrs):
            src=dict(attrs).get('src','')
            if tag=='img' and src.startswith('./assets/photos/') and src not in self.paths:self.paths.append(src)
    def absolute_refs(value,key=None):
        if isinstance(value,dict):return {k:absolute_refs(v,k) for k,v in value.items()}
        if isinstance(value,list):return [absolute_refs(v,key) for v in value]
        if isinstance(value,str) and key in {'@id','url','image','logo','contentUrl'} and value.startswith(('#','./')):return urljoin(base,value)
        return value
    for f in sorted(output.glob('*.html')):
        url=base if f.name=='index.html' else urljoin(base,f.name)
        text=f.read_text(encoding='utf-8')
        text=re.sub(r'<link rel="canonical"[^>]*>','',text)
        text=re.sub(r'<meta property="og:(?:url|image|image:alt)"[^>]*>','',text)
        text=re.sub(r'<script type="application/ld\+json" id="page-seo-data">.*?</script>','',text)
        text=re.sub(r'<meta name="twitter:image"[^>]*>','',text)
        text=text.replace('</head>',f'<link rel="canonical" href="{html.escape(url,quote=True)}"><meta property="og:url" content="{html.escape(url,quote=True)}"><meta property="og:image" content="{html.escape(urljoin(base,"assets/photos/facade-lumiere.webp"),quote=True)}"><meta property="og:image:alt" content="Façade et terrasse d’une réalisation Renov Bati"><meta name="twitter:image" content="{html.escape(urljoin(base,"assets/photos/facade-lumiere.webp"),quote=True)}"></head>')
        if f.name=='index.html':
            match=re.search(r'<script type="application/ld\+json" id="business-data">(.*?)</script>',text)
            data=json.loads(match.group(1));data.update({'@id':base+'#renov-bati','url':base,'logo':urljoin(base,'assets/logo-renov-bati.webp'),'image':urljoin(base,'assets/photos/facade-lumiere.webp')})
            text=text[:match.start(1)]+json.dumps(absolute_refs(data),ensure_ascii=False,separators=(',',':'))+text[match.end(1):]
        if f.name!='informations.html':
            page={'@context':'https://schema.org','@type':'WebPage','@id':url+'#page','url':url,'name':html.unescape(re.search(r'<title>(.*?)</title>',text).group(1)),'inLanguage':'fr-FR','about':{'@id':base+'#renov-bati'},'isPartOf':{'@id':base+'#website'}}
            if f.name=='index.html':
                graph=[{'@context':'https://schema.org','@type':'WebSite','@id':base+'#website','url':base,'name':'Renov Bati','inLanguage':'fr-FR'},page]
            else:graph=[page]
            text=text.replace('</head>','<script type="application/ld+json" id="page-seo-data">'+json.dumps(graph,ensure_ascii=False,separators=(',',':'))+'</script></head>')
        f.write_text(text,encoding='utf-8')
        photos=Photos();photos.feed(text);photos_by_url[url]=[urljoin(base,src) for src in photos.paths]
        if not re.search(r'<meta name="robots"[^>]*noindex',text):urls.append(url)
    ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9')
    ET.register_namespace('image','http://www.google.com/schemas/sitemap-image/1.1')
    tree=ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
    for url in urls:
        node=ET.SubElement(tree,'{http://www.sitemaps.org/schemas/sitemap/0.9}url')
        ET.SubElement(node,'{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text=url
        for photo_url in photos_by_url.get(url,[]):
            photo=ET.SubElement(node,'{http://www.google.com/schemas/sitemap-image/1.1}image')
            ET.SubElement(photo,'{http://www.google.com/schemas/sitemap-image/1.1}loc').text=photo_url
    ET.ElementTree(tree).write(output/'sitemap.xml',encoding='utf-8',xml_declaration=True)
    (output/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /documents/\nDisallow: /ressources/\nSitemap: '+urljoin(base,'sitemap.xml')+'\n',encoding='utf-8')
    return urls

if __name__=='__main__':
    here=Path(__file__).resolve().parent
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',required=True,help='URL HTTPS réelle retenue pour le site')
    parser.add_argument('--sortie',type=Path,default=here/'site-publication')
    args=parser.parse_args()
    source=here/'dist' if (here/'dist/index.html').exists() else here
    try:urls=prepare(args.url,args.sortie,source)
    except ValueError as error:parser.error(str(error))
    print(f'{len(urls)} pages préparées dans {args.sortie.resolve()}. Aucune publication effectuée.')
