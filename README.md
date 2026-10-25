# Renov Bati — site statique et navigation mobile

Version du 25 octobre 2026. Domaine communiqué : **https://renovbati78.fr/**.
Cette correction n’a pas été déployée. Aucun e-mail réel n’a été envoyé.

## Menu mobile — correction du 25 octobre 2026

Les deux fichiers modifiés pour le fonctionnement du site sont **styles.css** et **site-header.js**. Ils sont communs à l’accueil, aux réalisations et aux informations légales. Pour appliquer la correction à un dépôt déjà à jour, remplacer ces deux fichiers puis utiliser le déploiement habituel. Le ZIP contient aussi le dossier complet.

Le menu s’ouvre sous la navbar depuis la position de lecture actuelle. Le verrouillage du défilement se fait sur la page racine pour conserver le positionnement sticky de l’en-tête. La position est mémorisée à l’ouverture et restaurée à la fermeture. Le retour du focus au clavier ne déclenche plus de déplacement de la page. Les liens vers les sections ou les autres pages continuent à fonctionner.

Douze scénarios ont été contrôlés dans Chrome, dont les trois pages après défilement, les largeurs 320, 390, 768, 1100 et 1440 pixels, une hauteur de 320 pixels, le pointeur, le clavier, le blocage du fond et le redimensionnement vers la navigation de bureau. Le rapport détaillé est documents/verification-menu-mobile-20261025.json. Aucun test sur appareil physique et aucun déploiement n’ont été effectués pour cette correction.

## Formulaire de contact

Le formulaire fonctionne à nouveau entièrement dans le navigateur : coordonnées, récapitulatif, puis bouton **Ouvrir ma messagerie**. Le bouton ouvre un lien mailto avec le destinataire, le sujet et le texte préparés. Le visiteur doit envoyer le brouillon depuis sa messagerie. Le site ne confirme jamais un envoi qu’il ne peut pas vérifier.

Aucun Worker de contact, service Email Service, Durable Object, clé API ou configuration d’envoi n’est nécessaire. Cloudflare conserve uniquement son rôle d’hébergeur statique. Le serveur de contact et son configurateur ont été retirés du dossier.

Si la messagerie n’est pas configurée sur l’appareil, le visiteur peut télécharger sa demande préparée ou utiliser les coordonnées et les liens téléphone/WhatsApp affichés. Le site ne peut pas détecter de manière fiable l’ouverture d’une application de messagerie. Les champs restent locaux au formulaire ; aucune requête de formulaire n’est envoyée à un serveur. Le texte sur la confidentialité décrit ce fonctionnement.

## Référencement conservé

Les trois pages avaient déjà chacune un vrai H1 unique. Le titre de la page légale est désormais plus explicite. Les titres, descriptions et contenus intègrent le contexte Marcilly-sur-Eure, Eure et Yvelines, sans inventer l’emplacement des réalisations.

Le build utilise https://renovbati78.fr par défaut pour les liens canoniques, les métadonnées de partage, les données structurées et le sitemap. SITE_URL peut remplacer cette origine par une autre origine HTTPS réelle. Le sitemap contient l’accueil et les réalisations ; la page légale reste noindex, follow. SITE_ENV=preview bloque l’indexation des prévisualisations. Aucun rang Google n’est garanti.

## Utilisation locale

Décompresser le ZIP. Ouvrir index.html ou servir le dossier avec un serveur local statique. Les images, films, polices, styles et scripts sont inclus. Le dossier ressources contient les sources React déjà compilées de la galerie ; aucune installation n’est nécessaire pour consulter le site.

Les 360 ressources médias et polices, dont 18 films et les huit variantes de photos aux plaques masquées, sont conservées. Les scripts d’animation et de galerie restent inchangés.

## Mise à jour de l’hébergement Cloudflare

Mettre le contenu du dossier renov-bati-premium à la racine du dépôt Git utilisé par Cloudflare, ou sélectionner ce sous-dossier comme racine du projet.

| Réglage | Valeur |
| --- | --- |
| Nom du projet | renov-bati-premium |
| Build | node preparer-site-public.mjs |
| Déploiement | npx wrangler deploy |
| Dossier statique généré | site-public/ |

Le build ne publie rien. La commande de déploiement publie réellement ; elle n’a pas été exécutée ici. Le domaine doit être actif dans le même compte Cloudflare avant un déploiement utilisant les Custom Domains déclarés dans wrangler.jsonc. Les deux domaines renovbati78.fr et www.renovbati78.fr sont conservés. L’adresse workers.dev reste activée et non indexable ; les URL de prévisualisation sont désactivées.

Le générateur exclut les documents, notices et sources privées du dossier public. Les protections CSP interdisent les requêtes réseau applicatives et les soumissions HTML ; le lien mailto reste un lien ouvert par le visiteur. Les anciens réglages Vercel restent un repli statique.

## Données personnelles

La confidentialité distingue la préparation locale du brouillon et le traitement des e-mails effectivement reçus par Renov Bati. Le code du site ne stocke pas les coordonnées dans un cookie ou un stockage persistant du navigateur. Le téléchargement facultatif crée un fichier sur l’appareil du visiteur.

La durée de conservation des demandes sans suite dans la messagerie et les sauvegardes reste à définir et à mettre en œuvre par Renov Bati. Les mentions SAS, Artugrul Ertan et Cloudflare sont conservées. Aucune assurance, qualification ou clause contractuelle supplémentaire n’a été ajoutée.

## Vérifications

- python3 documents/tests/verify-build.py : build, liens, médias, SEO et reproductibilité.
- python3 documents/tests/verify-cloudflare.py : configuration statique et exclusion du serveur de contact.
- documents/verification-menu-mobile-20261025.json : rapport de la correction du menu et vérifications de cette version.
- documents/verification-seo-contact-20261021.json : rapport historique de la correction mailto et limites.

Les rapports plus anciens sont historiques. Aucun contrôle local ne prouve la réception réelle d’un e-mail. L’envoi réel, les applications Mail des appareils physiques et les en-têtes de l’hébergement de production n’ont pas été testés dans cette correction.
