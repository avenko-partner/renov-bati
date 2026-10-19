#!/usr/bin/env python3
"""Vérifications locales de préparation Vercel, sans serveur ni déploiement."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
import hashlib, json, os, re, shutil, subprocess, tempfile

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'site-public'
PAGES=('index.html','projets.html','informations.html')
checks=[]
def check(name, condition):
    if not condition:raise AssertionError(name)
    checks.append(name)
def digest(file):return hashlib.sha256(file.read_bytes()).hexdigest()
def build(extra=None, success=True, root=ROOT):
    env={k:v for k,v in os.environ.items() if k not in ('SITE_URL','VERCEL_ENV','VERCEL_TARGET_ENV','VERCEL_PROJECT_PRODUCTION_URL','VERCEL_URL')}
    env.update(extra or {})
    result=subprocess.run(['node',str(root/'preparer-site-public.mjs')],env=env,text=True,capture_output=True)
    check('build attendu '+str(extra or 'local'),(result.returncode==0)==success)
    return result

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.refs=[];self.meta={};self.canonical=[];self.json=[];self.script=None;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
        for key in ('src','href','poster'):
            if a.get(key):self.refs.append(a[key])
        for src in a.get('srcset','').split(','):
            if src.strip():self.refs.append(src.strip().split()[0])
        if tag=='script' and a.get('type')=='application/ld+json':self.script=''
        if a.get('target')=='_blank':check('onglet protégé',{'noopener','noreferrer'}<=set(a.get('rel','').split()))
    def handle_data(self,data):
        if self.script is not None:self.script+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.script is not None:self.json.append(json.loads(self.script));self.script=None

def public_integrity():
    raw=(ROOT/'portfolio-data.js').read_text().removeprefix('window.RENOV_PORTFOLIO = ').strip().removesuffix(';')
    projects=json.loads(raw)
    project_ids={p['id'] for p in projects}
    docs={name:Page((OUT/name).read_text()) for name in PAGES}
    for name,doc in docs.items():
        check('identifiants uniques '+name,len(doc.ids)==len(set(doc.ids)))
        for ref in doc.refs:
            u=urlsplit(ref)
            if u.scheme or u.netloc:continue
            file=(OUT/unquote(u.path or name)).resolve()
            check('ressource et lien local '+name+' '+ref,file.is_relative_to(OUT.resolve()) and file.is_file())
            if file.suffix=='.html' and u.fragment:
                target=docs.get(file.name)
                check('ancre '+ref,target is not None and (unquote(u.fragment) in target.ids or (file.name=='projets.html' and unquote(u.fragment) in project_ids)))
    for css in OUT.glob('*.css'):
        for ref in re.findall(r'url\(\s*[\'"]?([^\s\)\'\"]+)',css.read_text()):
            u=urlsplit(ref)
            if u.scheme or u.netloc or not u.path:continue
            check('ressource CSS '+ref,(css.parent/unquote(u.path)).is_file())
    required={m[k].removeprefix('./') for p in projects for m in p['media'] for k in ('src','thumb','poster','coverDetail') if m.get(k)}
    check('52 collections conservées',len(projects)==52)
    for ref in required:check('média galerie '+ref,(OUT/ref).is_file() and digest(OUT/ref)==digest(ROOT/ref))
    check('18 films publics',len(list((OUT/'assets').rglob('*.mp4')))==18)
    check('aucune notice ni source privée publique',not any(f.name.startswith(('LIRE-MOI','preparer-')) or f.name in ('documents','ressources','README.md','vercel.json','.env','package.json') for f in OUT.rglob('*')))
    check('licence React incluse',(OUT/'projects-react.js.LEGAL.txt').is_file())
    return docs

source_hashes={p.relative_to(ROOT).as_posix():digest(p) for p in ROOT.rglob('*') if p.is_file() and not p.is_relative_to(OUT)}
config=json.loads((ROOT/'vercel.json').read_text())
check('configuration Vercel statique',config['framework'] is None and config['installCommand']=='' and config['outputDirectory']=='site-public' and config['buildCommand']=='node preparer-site-public.mjs' and config['cleanUrls'] is False)
check('aucune réécriture SPA',not config.get('rewrites'))
security={h['key']:h['value'] for r in config['headers'] if r['source']=='/(.*)' for h in r['headers']}
check('en-têtes de sécurité configurés',security.get('X-Content-Type-Options')=='nosniff' and security.get('X-Frame-Options')=='DENY' and 'Content-Security-Policy' in security)
check('cache immutable limité à la collection',all(r['source']=='/assets/collection/:path*' for r in config['headers'] if any('immutable' in h['value'] for h in r['headers'])))

build()
docs=public_integrity()
check('pas de faux domaine local',all(not d.canonical for d in docs.values()) and not (OUT/'sitemap.xml').exists())
local={p.relative_to(OUT).as_posix():digest(p) for p in OUT.rglob('*') if p.is_file()}
for name in PAGES:check('page source intacte en local '+name,digest(ROOT/name)==digest(OUT/name))

origin='https://verification-deploiement.example/'
build({'SITE_URL':origin,'VERCEL_ENV':'production','VERCEL_PROJECT_PRODUCTION_URL':'autre.example'})
docs=public_integrity()
for name,doc in docs.items():
    expected=origin+('' if name=='index.html' else name)
    check('canonique exacte '+name,doc.canonical==[expected] and doc.meta.get('og:url')==expected)
    check('image de partage absolue '+name,doc.meta.get('og:image')==origin+'assets/photos/facade-lumiere.webp')
check('informations non indexées','noindex' in docs['informations.html'].meta['robots'])
graph=docs['index.html'].json
business=next(x for x in graph if isinstance(x,dict) and x.get('@type')=='GeneralContractor')
check('identité structurée absolue',business['@id']==origin+'#renov-bati' and business['url']==origin and all(p['itemOffered']['provider']['@id']==origin+'#renov-bati' for p in business['hasOfferCatalog']['itemListElement']))
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','i':'http://www.google.com/schemas/sitemap-image/1.1'}
tree=ET.parse(OUT/'sitemap.xml')
check('sitemap limité aux pages indexables',[x.text for x in tree.findall('s:url/s:loc',ns)]==[origin,origin+'projets.html'])
check('photos du sitemap présentes',all((OUT/unquote(urlsplit(x.text).path.lstrip('/'))).is_file() for x in tree.findall('.//i:loc',ns)))
check('robots référence le sitemap','Sitemap: '+origin+'sitemap.xml' in (OUT/'robots.txt').read_text())
for p in OUT.rglob('*'):
    if p.is_file() and p.suffix not in ('.html','.xml') and p.name!='robots.txt':
        check('ressource inchangée après SEO '+p.name,digest(p)==local[p.relative_to(OUT).as_posix()])

build({'VERCEL_ENV':'production','VERCEL_PROJECT_PRODUCTION_URL':'production-verifiee.example','VERCEL_URL':'branche-instable.example'})
check('domaine de production choisi plutôt que la branche',Page((OUT/'index.html').read_text()).canonical==['https://production-verifiee.example/'])

for environment in ({'VERCEL_ENV':'preview'},{'VERCEL_ENV':'production','VERCEL_TARGET_ENV':'staging'}):
    build({'SITE_URL':origin,**environment})
    docs={name:Page((OUT/name).read_text()) for name in PAGES}
    check('toutes les prévisualisations noindex',all(d.meta['robots']=='noindex, nofollow' for d in docs.values()))
    check('robots de prévisualisation et absence sitemap',(OUT/'robots.txt').read_text()=='User-agent: *\nDisallow: /\n' and not (OUT/'sitemap.xml').exists())
    check('canonique reste en production',docs['index.html'].canonical==[origin])

before=digest(OUT/'index.html')
for invalid in ('http://domaine.example','https://utilisateur:secret@domaine.example/','https://domaine.example/dossier/','https://domaine.example/?x=1','https://domaine.example/#ancre','invalide'):
    build({'SITE_URL':invalid},success=False)
    check('sortie conservée après URL invalide',digest(OUT/'index.html')==before)

with tempfile.TemporaryDirectory(prefix='renov-vercel-') as folder:
    isolated=Path(folder)/'site'
    shutil.copytree(ROOT,isolated,ignore=shutil.ignore_patterns('site-public','documents','ressources','__pycache__'))
    (isolated/'site-public').mkdir();(isolated/'site-public/personnel.txt').write_text('conserver')
    build(root=isolated,success=False)
    check('protection dossier non généré',(isolated/'site-public/personnel.txt').read_text()=='conserver')
    shutil.rmtree(isolated/'site-public')
    # Simule les entrées conservées par .vercelignore lors d’un envoi CLI.
    for f in list(isolated.glob('LIRE-MOI*.txt'))+[isolated/'README.md',isolated/'preparer-publication.py',isolated/'nettoyer-anciennes-pages.cmd']:
        f.unlink(missing_ok=True)
    build(root=isolated)
    check('build possible sans documents privés ni Python',(isolated/'site-public/index.html').is_file())
    export=Path(folder)/'autonome'
    result=subprocess.run(['python3',str(ROOT/'preparer-publication.py'),'--url',origin,'--sortie',str(export)],text=True,capture_output=True)
    check('export Python autonome conservé',result.returncode==0 and (export/'sitemap.xml').is_file() and (export/'projects-react.js.LEGAL.txt').is_file() and not (export/'documents').exists())

build()
public_integrity()
check('build reproductible localement',{p.relative_to(OUT).as_posix():digest(p) for p in OUT.rglob('*') if p.is_file()}==local)
check('sources inchangées par tous les builds',all((ROOT/p).is_file() and digest(ROOT/p)==hash for p,hash in source_hashes.items()))
report={'date':'2026-10-19','resultat':'réussi','assertions':len(checks),'groupes':['configuration statique et sécurité','liens, ancres, styles et médias','sans domaine','production avec SITE_URL','domaine automatique Vercel','prévisualisation et environnement personnalisé','URL invalides','protection des sorties','envoi CLI réduit','export Python autonome','reproductibilité et préservation des sources'],'fichiers_publics':len(local)-1,'octets_publics':sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file() and p.name!='.renov-public-build'),'films':18,'medias_collection':278,'limites':['Aucun déploiement Vercel effectué.','Pas de nouveau rendu dans un navigateur réel ni sur téléphone.','En-têtes HTTP et domaine à vérifier sur l’hébergement effectif.']}
(ROOT/'documents/verification-vercel-20261019.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
