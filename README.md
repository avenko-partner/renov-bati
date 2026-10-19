# Renov Bati — déploiement Vercel

Le dossier est prêt à être importé dans Vercel. Aucun déploiement n’a été effectué.
Les photos, les 18 films muets, les polices et le code du site sont inclus.

## Importer le projet

1. Extraire entièrement le ZIP. Le dossier `renov-bati-premium` contient directement `index.html`, `vercel.json` et `assets/`.
2. Copier **le contenu de ce dossier** à la racine du dépôt Git destiné au site, puis enregistrer et pousser les changements. Le ZIP ne contient aucun dépôt `.git` imbriqué.
3. Dans Vercel, choisir **Add New → Project** et importer ce dépôt.
4. Utiliser les réglages ci-dessous, déjà inscrits dans `vercel.json`, puis lancer le déploiement depuis Vercel lorsque vous êtes prêt.

| Réglage | Valeur |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | `.` si les fichiers sont à la racine du dépôt |
| Build Command | `node preparer-site-public.mjs` |
| Output Directory | `site-public` |
| Install Command | Vide : aucune dépendance à installer |

Si le dépôt contient le dossier `renov-bati-premium/` au lieu de son contenu, sélectionner ce dossier comme **Root Directory**. Ne pas sélectionner `site-public` comme racine du projet : il est créé au build.

## Domaine et SEO

Dans **Settings → Environment Variables**, ajouter `SITE_URL` avec l’origine HTTPS réelle du site, sans chemin. Utiliser le domaine principal retenu, pour l’environnement Production (et Preview si souhaité), puis redéployer. Aucune variable secrète n’est nécessaire.

Si `SITE_URL` est absente, le build utilise `VERCEL_PROJECT_PRODUCTION_URL` quand Vercel l’expose. Activer **Enable access to System Environment Variables** dans Vercel. La variable `SITE_URL` reste prioritaire pour choisir précisément le domaine principal, notamment avec ou sans `www`.

Le build génère les liens canoniques, les URL de partage, les données structurées et le sitemap avec cette origine. Les pages de prévisualisation portent `noindex, nofollow` et leur `robots.txt` bloque l’exploration. C’est une consigne aux moteurs, pas une protection d’accès.

Sans origine disponible, le site fonctionne avec ses liens relatifs ; aucun domaine n’est inventé. Ajouter le domaine définitif et redéployer pour finaliser le SEO. Après connexion du domaine, choisir la redirection vers ce domaine principal dans Vercel. La présence d’un sitemap ne garantit aucun classement dans Google.

## Contrôler avant et après déploiement

Avec Node.js, depuis ce dossier :

```text
node preparer-site-public.mjs
```

Le générateur ne publie rien. Il ne sert que les trois pages et leurs ressources. Les dossiers `documents/`, `ressources/`, les outils de préparation et les notices restent hors de `site-public/`. Cette séparation s’applique aussi aux déploiements Git ; `.vercelignore` réduit en plus les fichiers envoyés par la CLI.

Le cache long est limité à la collection dont les fichiers ont des noms à empreinte. Pour remplacer un de ces médias, utiliser un nouveau nom et mettre à jour `portfolio-data.js`. Les autres ressources gardent les règles de cache par défaut de Vercel.

Après déploiement, vérifier l’accueil, les projets, les galeries, les films muets, le comparateur, le menu mobile et les liens de contact. Vérifier aussi `/robots.txt`, `/sitemap.xml` et l’absence d’accès public à `/documents/` et `/ressources/`. Les en-têtes de sécurité seront appliqués par Vercel et doivent être contrôlés sur cette URL.

Le formulaire prépare un brouillon dans la messagerie du visiteur ; il n’envoie pas de demande depuis un serveur. Les mentions Vercel et les crédits Avenko Partner sont intégrés. Les éléments de l’entreprise restant à confirmer figurent dans `documents/VALIDATIONS-AVANT-DIFFUSION.md`.

## Sources techniques

Configuration vérifiée dans la documentation officielle Vercel le 19 octobre 2026 :

- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/git
- https://vercel.com/docs/environment-variables/system-environment-variables
- https://vercel.com/docs/deployments/vercel-ignore

Contrôles locaux de cette préparation : `documents/verification-vercel-20261019.json`. Aucun déploiement ni nouveau contrôle dans un navigateur réel n’a été effectué.
