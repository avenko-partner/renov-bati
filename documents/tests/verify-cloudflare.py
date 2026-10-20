#!/usr/bin/env python3
"""Contrôles locaux de la cible Cloudflare ; aucun appel réseau ni déploiement."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
CHECKS = []


def check(condition, label):
    if not condition:
        raise AssertionError(label)
    CHECKS.append(label)


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def tree(folder):
    return {p.relative_to(folder).as_posix(): digest(p)
            for p in folder.rglob('*') if p.is_file()}


def build(folder, settings=None, success=True):
    env = {k: v for k, v in os.environ.items()
           if k not in ('SITE_URL', 'SITE_ENV') and not k.startswith('VERCEL_')}
    env.update(settings or {})
    result = subprocess.run(['node', 'preparer-site-public.mjs'], cwd=folder,
                            env=env, capture_output=True, text=True)
    check((result.returncode == 0) == success,
          'Build ' + json.dumps(settings or {}, ensure_ascii=False)
          + (': accepté' if success else ': rejeté avant modification'))
    if success:
        check('Aucune publication effectuée' in result.stdout,
              'Build sans publication')
    return folder / 'site-public'


cfg = json.loads((ROOT / 'wrangler.jsonc').read_text())
check('main' not in cfg, 'Aucun script Worker serveur')
check(cfg['name'] == 'renov-bati-premium', 'Nom du Worker explicite')
check(cfg['build']['command'] == 'node preparer-site-public.mjs', 'Build déclaré')
check(cfg['assets'] == {'directory': './site-public', 'html_handling': 'none',
                        'not_found_handling': 'none'},
      'Sortie limitée, URL HTML conservées, pas de repli SPA')
check(cfg['compatibility_date'] == '2026-10-20', 'Date de compatibilité explicite')

headers = (ROOT / '_headers').read_text()
check(all(len(line) <= 2000 for line in headers.splitlines()), 'Lignes _headers < 2 000 caractères')
rules = [line for line in headers.splitlines() if line and not line[0].isspace()]
check(len(rules) <= 100, 'Moins de 100 règles _headers')
for header in ('X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY',
               'Referrer-Policy: strict-origin-when-cross-origin',
               "connect-src 'none'", "object-src 'none'", "frame-ancestors 'none'"):
    check(header in headers, 'En-tête déclaré : ' + header)
check('/assets/collection/*\n  Cache-Control: public, max-age=31536000, immutable' in headers,
      'Cache immutable limité aux médias de collection nommés par empreinte')
check('https://:version.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex' in headers,
      'Sous-domaines workers.dev non indexables')
check((ROOT / '_redirects').read_text().strip() == '/ /index.html 200',
      'Réécriture de la seule racine vers index.html')

legal = (ROOT / 'informations.html').read_text()
for text in ('Cloudflare, Inc.', '101 Townsend Street', '94107', '+16503198930',
             'https://www.cloudflare.com/cloudflare-customer-dpa/',
             '<dd>SAS</dd>', '<dt>Directeur de la publication</dt><dd>Artugrul Ertan</dd>'):
    check(text in legal, 'Mention conservée ou mise à jour : ' + text)
for text in ('Vercel', 'information communiquée par l’entreprise, à confirmer',
             'Une divergence avec l’Annuaire', 'qualité à confirmer avant diffusion'):
    check(text not in legal, 'Ancienne mention absente : ' + text)

mask_report = json.loads((ROOT / 'documents/verification-plaques-mentions-20261021.json').read_text())
for item in mask_report['rectangles']:
    p = ROOT / item['new']
    check(p.is_file() and digest(p).startswith(p.stem.rsplit('-', 1)[1]),
          'Variante masquée et empreinte valide : ' + p.name)
    check(not (ROOT / item['old']).exists(), 'Ancienne variante non livrée : ' + item['old'])

with tempfile.TemporaryDirectory(prefix='renov-cloudflare-check-') as temporary:
    work = Path(temporary) / 'renov-bati-premium'
    shutil.copytree(ROOT, work, ignore=shutil.ignore_patterns(
        'site-public', 'site-publication', '.git', '.wrangler', 'node_modules', '__pycache__'))
    public = build(work)
    files = [p for p in public.rglob('*') if p.is_file() and p.name != '.renov-public-build']
    check(len(files) < 20_000, 'Nombre de fichiers sous la limite Workers Free')
    check(max(p.stat().st_size for p in files) < 25 * 1024 * 1024,
          'Tous les fichiers sous 25 MiB')
    for name in ('_headers', '_redirects'):
        check((public / name).read_bytes() == (ROOT / name).read_bytes(), 'Règle copiée : ' + name)
    for name in ('documents', 'ressources', 'wrangler.jsonc', 'vercel.json', 'README.md',
                 'LIRE-MOI.txt', 'preparer-site-public.mjs', '.git', 'node_modules'):
        check(not (public / name).exists(), 'Élément privé exclu : ' + name)
    public_bytes = sum(p.stat().st_size for p in files)
    max_bytes = max(p.stat().st_size for p in files)
    public_count = len(files)

    domain = 'https://cloudflare-check.example'
    public = build(work, {'SITE_URL': domain, 'SITE_ENV': 'production', 'VERCEL_ENV': 'preview'})
    for name, suffix in (('index.html', '/'), ('projets.html', '/projets.html'),
                         ('informations.html', '/informations.html')):
        html = (public / name).read_text()
        check(f'<link rel="canonical" href="{domain}{suffix}">' in html,
              'Canonique de production : ' + name)
        if name != 'informations.html':
            check('name="robots" content="noindex' not in html, 'Page publique indexable : ' + name)
    sitemap = (public / 'sitemap.xml').read_text()
    check(sitemap.count('<url>') == 2 and domain + '/projets.html' in sitemap,
          'Sitemap : accueil et projets')
    check('Sitemap: ' + domain + '/sitemap.xml' in (public / 'robots.txt').read_text(),
          'Sitemap déclaré dans robots.txt')
    check((public / '_headers').read_text().startswith('/*\n  X-Content-Type-Options'),
          'Pas de noindex global en production')

    public = build(work, {'SITE_URL': domain, 'SITE_ENV': 'preview', 'VERCEL_ENV': 'production'})
    for name in ('index.html', 'projets.html', 'informations.html'):
        check('name="robots" content="noindex, nofollow"' in (public / name).read_text(),
              'Prévisualisation noindex : ' + name)
    check((public / '_headers').read_text().startswith('/*\n  X-Robots-Tag: noindex, nofollow\n'),
          'Noindex HTTP global des prévisualisations')
    check('Disallow: /\n' in (public / 'robots.txt').read_text(), 'Robots des prévisualisations bloqué')
    check(not (public / 'sitemap.xml').exists(), 'Aucun sitemap de prévisualisation')
    before = tree(public)
    build(work, {'SITE_ENV': 'autre'}, success=False)
    check(tree(public) == before, 'Configuration invalide : sortie antérieure préservée')
    public = build(work)
    check(all(domain.encode() not in p.read_bytes() for p in public.glob('*.html')),
          'Domaine réservé aux tests absent du build final')

report = {
    'date': '2026-10-21', 'cible': 'Cloudflare Workers Static Assets',
    'resultat': 'réussi', 'assertions_cloudflare': len(CHECKS), 'controles': CHECKS,
    'verification_generale': 'verification-build-cloudflare-20261021.json — 2635 assertions réussies',
    'sortie_publique': {'fichiers': public_count, 'octets': public_bytes,
                         'plus_gros_fichier_octets': max_bytes},
    'configuration_reelle_a_fournir': ['Authentification au compte Cloudflare',
                                      'Domaine principal et SITE_URL',
                                      'Configuration du domaine et des DNS'],
    'publication_effectuee': False,
    'limites': [
        'Validation locale des sources, règles et builds ; aucune requête sur un hébergement Cloudflare réel.',
        'Wrangler et ses règles HTTP restent à valider lors du déploiement autorisé.',
        'Aucun changement DNS, achat, abonnement, envoi de formulaire ou migration de compte.',
        'Aucun nouveau rendu navigateur ; aucun changement de mise en page ou d’animation dans cette version.',
        'Aucune garantie de classement Google ni de gratuité générale des services vidéo.'
    ]
}
(ROOT / 'documents/verification-cloudflare-20261021.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k != 'controles'}, ensure_ascii=False, indent=2))
