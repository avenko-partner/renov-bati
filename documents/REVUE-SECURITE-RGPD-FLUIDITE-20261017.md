# Revue du 17 octobre 2026

La navigation, la pagination et les crédits demandés sont corrigés. Cette revue porte sur les fichiers livrés et leur préparation pour Vercel. Le site n’a pas été publié ; ni le compte Vercel, ni la boîte e-mail de Renov Bati n’ont été audités.

## Corrections livrées

- Le document de départ utilise un voile de 120 ms sans dessiner le logo. Le dessin complet appartient uniquement au document d’arrivée. L’attente des premières images, des polices et du logo reste limitée par le secours à sept secondes. Le retour arrière et les mouvements réduits conservent leur comportement accessible.
- Un repère de 1 px se trouve immédiatement après la grille affichée. Les dix projets suivants arrivent lorsque ce repère entre dans l’écran, ou lorsqu’un saut de défilement l’a effectivement dépassé. Le seuil anticipé de 600 px est supprimé. Le nouveau lot doit à son tour être parcouru jusqu’à sa fin. L’ancrage du navigateur est désactivé sur cette page pour ne pas garder le pied de page sous les yeux et enchaîner artificiellement tous les lots.
- Le bouton manuel et l’automatisme utilisent le même ajout ; filtres, galerie ouverte, onglet masqué et historique ne produisent pas d’ajouts en double. Aucun déplacement du focus lors d’un ajout automatique.
- Le crédit « By Avenko partner » suit le copyright des trois pages. Son lien HTTPS s’ouvre dans un nouvel onglet avec protection `noopener noreferrer`, sans traceur intégré. Le crédit se réorganise sur petit écran.

## Sécurité du code et de l’export

Les coordonnées saisies sont insérées par `textContent`, et le brouillon est encodé avec `encodeURIComponent`. La validation des noms, du téléphone et de l’e-mail rejette les caractères de contrôle et borne leur longueur. Une ancre mal encodée ne provoque plus d’exception bloquant le portfolio.

Le site livré ne contient aucun point d’entrée serveur de réception, aucune base clients, aucun secret, aucun outil de suivi ni appel API dans ses scripts actifs. Le formulaire prépare un brouillon et un éventuel fichier texte local. L’envoi reste une action du visiteur dans sa messagerie ; il n’existe pas de confirmation d’envoi simulée. L’absence de point d’entrée ne protège pas, à elle seule, les comptes d’hébergement et de messagerie.

`preparer-site-public.mjs` génère une sortie fermée : trois pages et uniquement leurs scripts et feuilles chargés, les ressources visuelles/polices locales et les 266 fichiers de collection référencés. Les documents, sources React historiques, archives et notices ne sont pas servis. Cette séparation est prévue dans `vercel.json`, y compris pour un futur déploiement depuis Git. `.vercelignore` reste une aide d’exclusion, sans être la seule protection. `robots.txt` n’est pas considéré comme un contrôle d’accès.

Les en-têtes configurés pour Vercel comprennent une CSP limitée aux ressources locales, l’interdiction d’intégration en iframe et des objets/frames, la protection MIME, les permissions caméra/microphone/géolocalisation et la politique de référent. Le JavaScript inline et l’évaluation dynamique ne sont pas autorisés. Le CSS inline reste autorisé pour les contours du logo et les styles d’animation existants. Les films et images nécessaires sont autorisés, ainsi que les téléchargements locaux par URL Blob.

Le script de préparation du domaine produit également une sortie statique avec ces en-têtes, sans commande de compilation pointant vers un générateur absent. Les générateurs conservent un dossier non vide qu’ils ne reconnaissent pas comme leur propre sortie.

**Limite :** ces en-têtes sont vérifiés dans le fichier de configuration et rapprochés des ressources utilisées. Ils n’ont pas été exécutés dans un navigateur ni vérifiés dans une réponse HTTP Vercel. Leurs effets réels et toute injection de scripts par la plateforme devront être contrôlés après un déploiement autorisé.

## Données personnelles et obligations encore ouvertes

La confidentialité précise désormais l’identité et l’adresse du responsable, les quatre champs du brouillon, le fonctionnement local, la finalité de réponse/devis, les mesures précontractuelles, les destinataires habilités et le prestataire de messagerie. Elle distingue le contenu du formulaire des données techniques nécessaires à la consultation d’un site en ligne. Les droits et la possibilité de saisir la CNIL sont indiqués.

Le code ne stocke pas les valeurs du formulaire et ne charge aucun traceur. Le navigateur, la messagerie et l’hébergeur ont néanmoins leurs traitements propres. Aucun bandeau de consentement artificiel n’a été ajouté à cette version sans traceur. Ajouter ultérieurement Analytics, un lecteur distant, une carte ou un service d’envoi impose une nouvelle analyse.

| Point non résolu par une modification du code | Action nécessaire de l’entreprise ou du responsable de l’hébergement |
| --- | --- |
| Questionnaire indiquant SARL ; ancien résultat officiel indexé indiquant SAS | Fournir un extrait RNE/Kbis récent et confirmer la forme, le capital, l’immatriculation et les mentions. La fiche officielle directe n’a pas pu être ouverte le 17 octobre 2026 ; l’index ancien ne prouve pas l’état actuel. |
| Artugrul Serdar déclaré dirigeant ; Artugrul Ertan déclaré directeur de publication | Confirmer les noms et la personne légalement compétente pour la publication. |
| Clientèle de particuliers et aucun médiateur désigné | Contracter avec le médiateur compétent, puis publier son nom, ses coordonnées et son site. Signaler cette absence ne remplit pas l’obligation. Aucun organisme n’a été choisi fictivement. |
| Durée reçue : « tant qu’il faut » | Arrêter une durée adaptée aux demandes sans suite et l’appliquer réellement à la messagerie, aux copies et aux sauvegardes ; mettre la politique du site à jour. Une durée illimitée ne convient pas. Aucun délai automatique de trois ans n’a été inventé ou présenté comme systématiquement obligatoire. |
| RC Pro « Airbag » et décennale Axeria déclarées, sans attestation fournie | Obtenir les attestations et confirmer l’assuré, l’assureur, les activités, le territoire et les dates applicables. Les badges 1/2/10 ans expliquent les régimes légaux ; ils ne certifient pas une police d’assurance. |
| Hébergement Vercel prévu, configuration de compte non accessible | Confirmer le prestataire effectivement retenu, les accès, le contrat de traitement, les sous-traitants, les transferts éventuels et la durée des journaux. Les coordonnées officielles Vercel sont indiquées comme hébergement prévu. Aucun hébergement exclusivement européen n’est promis. |
| Références et médias fournis par l’entreprise | Conserver les droits d’usage et justificatifs des références. Aucun nouveau client, avis, label ou certificat n’a été ajouté. |

Ces points sont également dans `VALIDATIONS-AVANT-DIFFUSION.md`. Cette revue ne vaut pas attestation de conformité juridique générale ou de sécurité sans faille.

## Fluidité et vérifications

Les photos, films, couvertures, groupements et ordre des vues sont préservés à l’octet près : 344 fichiers d’assets comparés au ZIP précédent, manifeste identique. Le carrousel reste à 4,5 secondes. Le comparateur parcourt 0 à 100 puis 100 à 0, neuf secondes par trajet, sans supprimer la manipulation manuelle. Les galeries attendent le décodage puis enchaînent leur fondu, avec médias entiers et mouvements réduits respectés.

Les contrôles actuels comprennent 33 groupes sur l’accueil, 23 sur la navigation/pagination/galeries/formulaire, six sur l’export et la configuration de sécurité, plus la comparaison des médias. Ils utilisent une simulation DOM, une horloge et des chargements contrôlés, des intersections explicites et une analyse de cascade CSS. Le lien externe, le crédit aux formats étroits, les clics rapides, les filtres, l’historique, les erreurs et le cas sans IntersectionObserver sont couverts.

Les rapports `verification-accueil-revue-20261017.json`, `verification-navigation-securite-20261017.json`, `verification-export-securise-20261017.json` et `verification-preservation-medias-20261017.json` détaillent ces contrôles. Les rapports plus anciens restent historiques.

**Non réalisé :** rendu visuel dans un navigateur, essai sur téléphone physique, mesures FPS/Core Web Vitals, observation réseau d’un déploiement et test d’intrusion. L’état des accès, journaux, sauvegardes et comptes externes n’est pas vérifié. Le ZIP est contrôlé par CRC et extraction avant livraison.

## Sources consultées le 17 octobre 2026

- CNIL, durée limitée et adaptée à la finalité, 2 avril 2026 : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- CNIL, information et gestion de la relation client : https://www.cnil.fr/fr/rgpd-en-pratique-maitrisez-votre-relation-client
- CNIL, contrat et mesures précontractuelles : https://www.cnil.fr/fr/les-bases-legales/contrat
- CNIL, règles sur les cookies : https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies
- DGCCRF, médiation de la consommation et coordonnées à communiquer : https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/la-mediation-de-la-consommation-ce-que-vous-devez-savoir
- Service Public / DILA, mentions obligatoires : https://entreprendre.service-public.gouv.fr/vosdroits/F37351
- Vercel, politique de confidentialité mise à jour le 1er juin 2026 : https://vercel.com/legal/privacy-notice
- Vercel, accord sur le traitement et transferts : https://vercel.com/legal/dpa
- Vercel, adresse et téléphone publiés : https://vercel.com/legal/dmca-policy
- Vercel, commande de construction, sortie et en-têtes : https://vercel.com/docs/project-configuration/vercel-json
- MDN, directives CSP : https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy

Les sources décrivent les obligations ou mécanismes ; elles ne vérifient pas les décisions internes, les contrats ou les justificatifs de Renov Bati.
