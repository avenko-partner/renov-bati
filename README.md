# Renov Bati — Cloudflare

Dossier préparé le 21 octobre 2026 pour **Cloudflare Workers Static Assets**. Aucun déploiement ni changement de DNS effectué.

## Mise en ligne lorsque vous êtes prêt

Le dossier `renov-bati-premium` contient directement `index.html`, `assets/` et `wrangler.jsonc`. Placer son contenu à la racine du dépôt Git, puis importer ce dépôt dans **Cloudflare → Workers & Pages → Create application → Import a repository**. Si ce dossier est conservé à l’intérieur du dépôt, le sélectionner comme racine du projet.

Réglages :

| Réglage | Valeur |
| --- | --- |
| Nom du Worker | `renov-bati-premium` ; adapter aussi `wrangler.jsonc` si ce nom est déjà utilisé |
| Commande de build | `node preparer-site-public.mjs` |
| Commande de déploiement | `npx wrangler deploy` |
| Fichiers publics | `site-public/` |
| Dépendances du build | Aucune ; Node.js suffit |

La commande de déploiement publie réellement : elle est documentée ici, mais n’a pas été exécutée. L’authentification au compte Cloudflare reste à effectuer par son propriétaire. Wrangler utilise également la commande de build déclarée dans sa configuration.

## Domaine et référencement

Renseigner **SITE_URL** dans les variables de build avec l’origine HTTPS réelle du domaine principal, sans chemin ni paramètres. Ne pas inventer de domaine. Ajouter ensuite ce domaine dans les réglages du Worker et configurer les DNS selon les indications Cloudflare.

Le build génère les liens canoniques, les données structurées, les URL de partage et le sitemap lorsque SITE_URL est fournie. Sans domaine, les liens relatifs restent utilisables. Aucun classement dans Google n’est garanti.

**SITE_ENV=production** convient au build public. Pour un environnement de prévisualisation séparé, utiliser **SITE_ENV=preview** : pages noindex, robots bloqué, sitemap supprimé et en-tête X-Robots-Tag. Les URL workers.dev portent aussi noindex pour éviter leur indexation en parallèle du domaine principal. Ce réglage n’est pas un contrôle d’accès.

## Fichiers servis

Le générateur inclut seulement les trois pages et leurs ressources. Les notices, les anciennes sources et documents de maintenance restent hors de `site-public/`. Le cache long est limité aux médias de collection dont le nom contient une empreinte ; tout remplacement utilise un nouveau nom.

Les règles `_headers` reprennent les en-têtes de sécurité. `_redirects` sert l’accueil à `/` ; les liens `.html` sont conservés par la configuration. Aucun script serveur, formulaire d’envoi distant, fonction payante, R2, Stream ou statistique n’est ajouté. Le formulaire existant prépare toujours un brouillon dans la messagerie du visiteur.

Les 18 films sont conservés localement et sans son. Les requêtes de fichiers statiques sont annoncées gratuites et illimitées par Cloudflare ; les services serveur, le stockage externe et la vidéo spécialisée suivent leurs propres règles. Le CDN seul n’est pas une offre de diffusion vidéo illimitée : vérifier l’offre et les conditions retenues pour l’exploitation des films. Aucune souscription n’a été faite.

## Vérifications

Exécuter `node preparer-site-public.mjs` pour produire le dossier public sans publier. Le rapport `documents/verification-cloudflare-20261021.json` précise les contrôles réalisés et leurs limites.

Après déploiement, contrôler les trois pages, les galeries, le menu mobile, les films et les liens de contact ; vérifier les en-têtes, les DNS, HTTPS, robots.txt et sitemap.xml. Les dossiers privés doivent rester inaccessibles.

L’ancienne configuration Vercel reste présente comme configuration de repli ; elle est ignorée par Cloudflare et n’est pas servie au public. Les contrôles historiques datés restent dans documents/.

## Références officielles vérifiées le 21 octobre 2026

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/static-assets/redirects/
- https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://developers.cloudflare.com/workers/platform/limits/
- https://www.cloudflare.com/privacypolicy/
- https://www.cloudflare.com/cloudflare-customer-dpa/
- https://www.cloudflare.com/service-specific-terms-application-services/
