> Version courante : 23. SEO renforcé sur les trois pages ; titres et descriptions, 14 services structurés, contenu local et FAQ. Préparation locale des canoniques, données et sitemap pages/images vérifiée. Rapport : verification-seo-v23.json. Aucune publication, indexation, position Google ou validation en ligne effectuée. Rapports précédents historiques.

> Version courante : 22. Flèches diagonales remplacées par des SVG décoratifs, avec trait et couleur définis, notamment près du téléphone. Structure SVG et liens vérifiés ; aucun rendu sur téléphone physique contrôlé. Rapports antérieurs historiques.

> Version courante : 21. Garanties centrées sur mobile : visuels, titres, descriptions, liens et introduction. Vérification de la cascade CSS sur les formats étroits et segmentés ; pas de rendu navigateur. Rapports précédents historiques.

> Version courante : 20. Projet commercial renommé « Carrelage en grande surface » sur la vitrine, le portfolio et la fiche projet, avec descriptions et alternatives correspondantes harmonisées. Vérification ciblée du contenu et des ressources ; rapports antérieurs historiques.

> Version courante : 19. Le lien « Explorer l’avant / après » et ses références JavaScript sont retirés de la fiche projet. Les rapports v18 ci-dessous sont historiques. Vérification ciblée du retrait, de la syntaxe et du fonctionnement des fiches projet.

> Version courante : version 18. Contrôles réalisés le 13 octobre 2026 : 38 contrôles DOM et ressources (`verification-transition-responsive-v18.json`), 40 scénarios de cascade CSS (`verification-geometrie-responsive-v18.json`), huit profils de bureau et quatre comparaisons de cadres photo compacts (`verification-images-desktop-v18.json`). Les contrôles ci-dessous des versions précédentes sont historiques. Aucun rendu navigateur réel, FPS ou Core Web Vitals mesuré.

## Correction courante

Les entrées après l’accueil utilisent uniquement des translations courtes, observées par visuel avant son entrée dans la zone de lecture. Aucun état masqué ni découpe des photos n’est introduit. Les éléments déjà dans la zone de lecture ne sont pas réanimés. Resize, pagehide et réduction des mouvements annulent les effets en restituant le style final.

Les filtres annulent leurs anciens effets avant les mesures, déplacent les cartes sans mise à l’échelle et ne modifient plus la hauteur de la grille par animation. Les copies sortantes restent inertes et sont supprimées. Les fiches n’empilent plus des entrées de l’image, du texte et du masque ; les changements de photo n’utilisent plus de lecture forcée de largeur.

Les légendes, liens et textes secondaires ont été agrandis. Les plafonds photographiques sur ordinateur augmentent modérément, tout en restant bornés par la hauteur de fenêtre. Les règles de cadrage compactes sont conservées. Les trois pages, les 78 fichiers médias, les données métier, les scripts du préloader et du carrousel sont identiques à la version 17. La fonction d’entrée de l’accueil est également identique.

La comparaison avec la version 15 dans le rapport de comportements vérifie toujours la régression corrigée du préloader ; elle ne représente pas la livraison précédente.

## Historique

# Vérifications de la livraison

Contrôles réalisés le 12 octobre 2026. Aucun site n’a été publié.

## Fonctionnement contrôlé

72 contrôles ont passé en simulation DOM avec jsdom :

- Comparateur : valeurs extrêmes, commandes avant/après, clavier, déplacement de pointeur, arrêt du glissement, focus et annonces accessibles.
- Galerie : 12 entrées, filtres 4 / 7 / 1 / 12, fiches, descriptions, détails, navigation entre les photos, fermeture et retour du focus. Une page de portfolio fonctionne comme solution de repli sans dialog.
- Navigation : ouverture du menu, fermeture sur lien ou Échap, boucle de focus, redimensionnement et indication du chapitre courant.
- Ruban : références dupliquées à l’identique, grandes largeurs, absence d’accumulation, pause et reprise, réduction manuelle et préférence système.
- Demande de devis : quatre champs, données invalides, accents, récapitulatif, adresse destinataire, encodage du message, téléchargement et modification. Aucun envoi automatique n’est simulé.
- Pages : liens internes, fichiers, ancres, IDs, labels, ARIA, alternatives des images, syntaxe CSS/JS, polices locales, absence de scripts de transmission ou de stockage.

Le détail se trouve dans verification-dom.json. Il s’agit d’une simulation de comportements, pas d’une exécution dans Chrome, Safari ou Firefox.

## Médias contrôlés

Les 35 conversions WebP sont décodables. La sélection et les chemins sont documentés dans ressources/SELECTION-DES-IMAGES.json.

Les 12 logos utilisent un cadre identique de 336 × 104 pixels, un dessin non vide et une transparence réelle. Les trois autocollants sont des WebP transparents de 960 × 640 pixels. Les versions mobiles et les largeurs déclarées dans les srcset correspondent aux fichiers.

Le logo principal conserve exactement les pixels de couleur de l’image fournie après décodage. Le fond #160100 correspond à son fond d’origine. Les cinq couples principaux de couleurs contrôlés présentent des contrastes supérieurs à 4,5:1 ; ce contrôle ne constitue pas un audit d’accessibilité exhaustif.

Les photographies sélectionnées et les logos dorés ont été examinés visuellement comme fichiers d’image. Aucune photographie de chantier générée n’a été ajoutée. Les 35 images fournies occupent environ 4,82 Mo en WebP contre 6,03 Mo pour les JPEG, soit environ 20 % de moins. Le détail se trouve dans verification-assets.json.

## Contrôles non réalisés

Le navigateur pilotable nécessaire au rendu était indisponible dans cet environnement. Les pages n’ont donc pas été contrôlées visuellement dans un navigateur réel aux différentes tailles d’écran. Les adaptations CSS sont prévues à 1150, 900, 700, 460 et 360 pixels.

N’ont pas été vérifiés sur des appareils réels : débordements de mise en page, défilement et performances, gestes tactiles, comportement natif d’Échap dans dialog, lecteurs d’écran, ouverture ou réception d’un e-mail, téléchargement par un navigateur, impression et disponibilité du compte Instagram. Aucun score Lighthouse, mesure Core Web Vitals ou certificat de conformité n’est annoncé.

La version locale ne possède pas de serveur de formulaires, de mesure d’audience ni de traceur. Le téléphone et la messagerie sont les moyens réels de contact.

Les points administratifs encore à confirmer sont répertoriés séparément dans VALIDATIONS-AVANT-DIFFUSION.md et dans la page d’informations.

## Évolution : préloader et médias

24 contrôles supplémentaires en simulation DOM avec horloge contrôlée : sortie normale, bouton passer, Échap, réduction des mouvements, accès direct à une section, retour navigateur, ressources qui échouent ou restent bloquées, absence du script principal, plafond de 3,4 secondes et annulation du premier frame. Détail : verification-intro.json.

Les 1 109 images de la seconde archive ont été inventoriées et examinées sur 31 planches contact. Les candidates retenues ont été contrôlées en grand. Huit photographies complémentaires sont intégrées en WebP avec versions mobiles. Les dimensions et les srcset des 65 images HTML présentes sur les trois pages ont été vérifiés. Les 69 tracés du préloader proviennent du logo fourni ; l’image originale est révélée ensuite.

Le rendu animé et les compositions n’ont toujours pas été contrôlés dans un navigateur réel. Aucun prix ou classement Awwwards n’est attribué au site.

La relecture indépendante a signalé et fait corriger une course du premier frame, le plafond visuel du fondu, l’attente du logo original et la réduction système sans preferences.js. Ces quatre cas sont couverts par les vérifications du préloader.

## Lisibilité et contacts

Les tailles et interlignes des textes ont été augmentés. Les trois feuilles existantes styles.css, refinement.css et intro.css sont restées identiques à la livraison précédente ; la nouvelle feuille legibility.css ne redéfinit pas les couleurs des textes existants. Les blocs mobiles de métiers et de garanties s’adaptent à la taille accrue.

Les icônes Instagram et WhatsApp sont des SVG intégrés, monochromes, avec libellés accessibles. Les destinations sont respectivement renov_bati_ertan et le numéro professionnel fourni, 33678457939. Le compte WhatsApp et l’ouverture des applications n’ont pas été vérifiés. Le rendu navigateur reste non vérifié.

Les mentions de démonstration ont été retirées de la vitrine. Les garanties 1 / 2 / 10 ans sont explicitement présentées comme garanties légales des travaux ; seules la RC Pro et l’assurance décennale ont été déclarées dans le questionnaire. Les attestations et autres informations administratives en attente ne sont pas considérées comme vérifiées.

## Retouches de la section des métiers

Bandeau supérieur retiré. Trois photographies existantes ajoutées aux métiers ; composition resserrée et étapes détaillées. La réalisation professionnelle est remplacée par le carrelage Auchan, attribution fournie par le client. La nouvelle pièce jointe est identique à la photographie source déjà convertie en WebP (1280 × 1600 et 720 × 900). Aucun contenu sportif n’est présenté.

72 contrôles généraux et 24 contrôles du préloader passent. 10 contrôles supplémentaires couvrent les modifications, les nouvelles animations, leur réduction, les API absentes et la sortie de page. Les photos WebP se décodent. Aucun navigateur rendu disponible : compositions réelles desktop/mobile et gestes visuels non vérifiés. Aucun site publié.

## Référencement et transitions — 12 octobre 2026

Dernière version 3 récupérée avant modification, pour conserver les retouches précédentes. Annotations éditoriales de la vitrine retirées et crédits publics simplifiés. Les informations de fonctionnement du formulaire, de confidentialité et de garanties restent présentes.

Deux pages ajoutées : prestations et zones d’intervention. Les 259 noms et codes INSEE du COG 2026 ont été comparés à l’annuaire HTML ; chaque commune y figure une fois. Recherche facultative avec traitement des accents, effacement, compteur, cas sans résultat et navigation par lettre. La liste intégrale reste lisible sans JavaScript. Disponibilité France ajoutée selon la demande de l’entreprise.

Titres et descriptions uniques, balises de partage et JSON-LD GeneralContractor correspondant aux coordonnées et prestations fournies. Quatre pages commerciales en index, follow ; informations légales en noindex, follow. Domaine non communiqué : le script livré prépare canonicals, médias absolus, JSON-LD et sitemap avec le domaine saisi, sans publication. Aucune URL publique réelle inventée.

82 contrôles fonctionnels et de structure sur cinq pages passent ; 18 contrôles spécifiques SEO/recherche/transitions passent ; 7 contrôles de préparation des URL et du sitemap passent. Images WebP et srcset contrôlés. Le préloader est conservé sans modification. La fermeture des fiches dispose d’une animation courte, d’un délai de secours et d’une sortie immédiate en réduction des mouvements.

Le rendu navigateur, les gestes réels sur mobile, les Core Web Vitals, le test Google des résultats enrichis, l’indexation et les positions Google ne sont pas vérifiés. Aucun site n’est publié, aucun résultat SEO n’est promis. Les démarches nécessitant domaine/hébergement/Search Console/fiche Google réelle sont décrites dans SEO-ET-MISE-EN-LIGNE.txt.

## Correction demandée : retrait de l’annuaire

La page de zones d’intervention et son script de recherche sont retirés, ainsi que tous les liens du site qui y menaient. Le bouton géographique de la vitrine mène désormais au formulaire de contact. Les contenus sur les métiers, les balises SEO, les données structurées, la disponibilité France et les transitions sont conservés. Les rapports concernant l’annuaire sont historiques et ne décrivent plus la version courante. Aucun remplacement par des listes cachées ou des pages par commune.

## Responsive et retrait des accès SEO annexes

Les deux pages SEO ajoutées sont retirées et leurs accès supprimés. Leurs anciens rapports restent historiques. La nouvelle couche responsive est chargée en dernier sur les trois pages : colonnes adaptées, menu jusqu’à 1100 px, contrôles tactiles, safe-area et segments de doubles écrans. 72 contrôles fonctionnels et 14 contrôles supplémentaires passent. La cascade et les grands titres ont été contrôlés par calcul sur 22 profils. Les 74 images HTML et leurs dimensions srcset sont cohérentes. Le rendu navigateur et matériel reste non vérifié ; détail dans RESPONSIVE-ET-VERIFICATIONS.txt. Aucun site publié.

## Préloader automatique épuré — 12 octobre 2026

Les textes du haut et du bas ainsi que le bouton Passer ont été retirés du préloader. Son seul contenu visuel est le logo fourni et ses contours. Le fond uni #160100 reprend la couleur dominante mesurée dans le fichier (22, 1, 0) ; le halo radial a été supprimé. Le fichier logo original n’a pas été modifié.

Le dessin des contours suit le règlement des ressources critiques : logo, photo principale et polices. La photo de détail et les médias lazy ne retardent plus la sortie. Le minimum imposé de 1 920 ms est retiré ; la fin suit les ressources, avec fondu court de 200 ms et plafond absolu de 2 500 ms en cas de blocage. Échap reste une sortie de secours au clavier. Les préférences de réduction, ancres directes et retours navigateur sont respectés.

72 contrôles fonctionnels généraux passent. 18 contrôles supplémentaires avec promesses et horloge contrôlées couvrent attente réelle, cache, erreurs, délai maximal, script absent, premier frame différé, navigation, réduction et absence des textes/bouton. Les trois pages, 74 images, srcset, titres, descriptions, JSON-LD et générateur de canonical/sitemap ont été revérifiés.

Le SEO présent et les opérations encore nécessaires sont consignés dans SEO-VERIFIE.txt. Domaine réel, validation Google, Search Console, fiche Google et performances en ligne restent à finaliser. Aucun score SEO premium ni classement n’est mesuré. Aucun site publié. Le rendu dans un navigateur réel reste non vérifié. Les rapports des anciens préloaders décrivent des versions antérieures.


## Composition éditoriale et préloader visible — version courante

Recherche Awwwards et examen des aperçus officiels de Storey Architecture, SENAWA et ecoLINEAR Studio. Trois pistes comparées, puis choix d’une composition éditoriale architecturale. Ouverture sans collage superposé ; trois lignes photographiques pour les métiers ; six projets complémentaires dans l’accueil, douze conservés dans le portfolio. Les photos de la sélection utilisent leurs proportions d’origine. Les filtres retirent les décalages et donnent une largeur adaptée lorsqu’un seul projet reste visible.

Préloader lié à des ressources réelles et à un dessin perceptible du logo. Cache rapide : 1 360 ms de tracé, 420 ms de révélation et lecture, 360 ms de sortie ; 2 140 ms au total. Échéance absolue de 3 500 ms, calculée depuis le bootstrap, y compris lorsque le contrôleur ou le logo arrive tard. Les préférences système ou manuelles peuvent arrêter le dessin ou le fondu immédiatement. Les contours restent disponibles si le logo ne se décode pas. Aucun bouton ou texte décoratif.

69 contrôles généraux, 24 contrôles temporels du préloader et 14 contrôles de navigation passent. 22 profils de cascade et la largeur du titre sont analysés avec la police fournie. Les 68 images HTML, leurs fichiers WebP et les dimensions srcset sont cohérents. Ces contrôles ne remplacent pas une inspection visuelle : aucun rendu navigateur, aucun appareil réel, aucune mesure Core Web Vitals ou validation de position Google. Aucun site publié.


## Composition architecturale et transitions coordonnées — version courante

Ouverture recomposée : deux lignes de titre, texte séparé et deux photographies de proportions différentes. Alternance du deuxième métier et double photographie dans la section des finitions. Les nouvelles structures adaptent leurs colonnes à la taille de l’écran ; les deux lignes du titre et leur décalage sont mesurés sur les 22 profils de cascade avec Manrope fourni.

Entrée coordonnée après le préloader, révélations différenciées des métiers et de la matière. Galerie : état accessible immédiat et transitions des positions/hauteur, copies de sortie inertes, annulation des effets lors d’un changement rapide, d’une réduction du mouvement, d’un redimensionnement ou d’une sortie de page. Comparateur : boutons animés lorsque @property est pris en charge, glissement et clavier directs. Menu et fiches : transitions CSS courtes. Aucune bibliothèque d’animation, ressource distante, route ou dépendance supplémentaire ajoutée.

69 contrôles des parcours, 24 contrôles du préloader, 14 contrôles de navigation, 7 contrôles de contenu et 22 contrôles du mouvement passent : 136 au total. Les 69 images HTML et les dimensions de leurs variantes WebP sont cohérentes. Les contrôles du mouvement utilisent des animations et rectangles simulés : ils vérifient les états et nettoyages, pas la fluidité réelle. Aucun rendu navigateur, appareil réel, clavier virtuel ou mesure Core Web Vitals effectué. Aucun site publié.


## Dernière révision : ouverture plus dense

La capture du client a été examinée. La grille de l’accueil a changé : titre et contact dans la colonne gauche ; photographies dès la première ligne à droite. La signature ne monopolise plus une rangée complète. Sous 761 px, les images suivent directement le titre. Les deux photographies conservent leurs rapports de dimensions. Le préloader, les pages, les garanties, les réalisations et les fonctions restent présents.

Les contrôles de cette révision ont passé : 69 contrôles DOM/parcours, 24 du préloader, 14 de navigation responsive, 7 de contenu et 22 de mouvement. La géométrie des titres a été recalculée pour les colonnes actuelles sur 22 profils, avec Manrope fourni. Les 69 éléments image et leurs variantes restent décodables et leurs dimensions déclarées sont exactes.

Estimation de position de la façade : environ 144 px depuis le haut de la page à 1440×900 et 149 px à 1920×1080, contre une photographie située après la grande rangée de titre dans la capture reçue. Ces positions sont calculées à partir des styles, avec safe-area nulle ; elles ne proviennent pas d’une nouvelle capture navigateur. L’image commence également dans le premier écran sur les 22 géométries étudiées.

Aucun rendu navigateur de la nouvelle version, test sur appareil réel ou mesure de fluidité/performance réalisé. Aucun site publié.


## Révision photographique du 13 octobre 2026

Grande ouverture avec trois vues sélectionnables, références plus tôt dans le parcours, huit réalisations en accueil et treize fiches dans le portfolio. Deux nouvelles photos de finitions ont été sélectionnées dans les planches de l’archive et converties en WebP. Les sources et leurs empreintes sont documentées.

Les contrôles passés couvrent 69 cas de parcours DOM, 16 de sélection photographique, 22 de mouvement, 24 du préloader, 14 de navigation responsive et 7 de contenu. La sélection photographique couvre chargement, décodage tardif ou en échec, clics rapides, délai limite, correspondance de la fiche, annulations, historique et réduction des mouvements. La galerie est vérifiée avec les effectifs 4 / 3 / 1 / 8.

Les deux lignes du titre tiennent dans leur colonne sur les 22 profils calculés. Les 76 éléments image et leurs variantes ont des dimensions exactes et sont décodables. Les contrôles utilisent jsdom, des événements et des animations simulés, ainsi qu’une analyse des fichiers : aucun navigateur rendu et aucun appareil réel ne sont testés. Aucun site publié.


## Version 12 — grand format et boucle de trois secondes

Les trois photos d’ouverture utilisent des fichiers WebP issus des JPEG source. Les dérivés desktop sont sans perte : l’égalité des pixels décodés et orientés a été contrôlée. Les variantes mobiles sont en qualité 94. Les sources et empreintes sont dans `ressources/PHOTOS-ACCUEIL-QUALITE.json`. Les trois essais de retouche Imagegen ont été rejetés après inspection ; ils ne font pas partie du site. Aucun détail réel de chantier n’est reconstruit.

L’ouverture est pleine largeur, sans marge supérieure. Les portraits sont cadrés séparément et leur largeur est plafonnée. Les couleurs de marque restent présentes. La hauteur du cadre mobile reste identique entre les vues pour éviter de déplacer le contenu pendant la rotation.

34 contrôles des vues passent, dont quatre cycles complets de rotation de 3 000 ms. Sont également contrôlés : démarrage après le préloader, pause / reprise, onglet masqué, focus clavier, survol des commandes, ouverture hors écran, fenêtre de projet, préférence système ou manuelle de réduction des mouvements, échec de fichier, décodage tardif, ordre de reprise et absence de minuterie doublée après restauration. Les annonces accessibles restent réservées aux choix manuels.

Avec les 69 parcours DOM, 22 contrôles du mouvement, 24 du préloader, 14 de navigation responsive et 7 de contenu, 170 contrôles fonctionnels / structurels passent. Les 22 profils de géométrie sont recalculés pour la nouvelle largeur ; les deux lignes du titre tiennent dans leur colonne. Les 76 éléments image HTML et 62 références WebP distinctes ont des fichiers et dimensions conformes.

Les résultats reposent sur des simulations DOM, des horloges contrôlées, une analyse CSS et des fichiers. Le rendu navigateur, les écrans réels, le téléchargement sur réseau mobile et la fluidité perçue restent non vérifiés. La résolution native des originaux est conservée ; aucun gain de détails réels au-delà des sources n’est annoncé. Aucun site publié.


## Version 13 — correction du défilement et progression dorée

Les trois captures locales fournies par le client ont été ouvertes. Elles montrent la piscine sur un fond photographique dégradé, le bord latéral net du portrait de salle de bains, et le trait fixe sous sa miniature. Les trois vues occupent maintenant toute la largeur du cadre sur ordinateur, sous le même dégradé. Leurs fichiers d’image n’ont pas été modifiés dans cette correction.

Le blocage est reproduit en simulation avec le contrôleur sauvegardé de la version 12 : un clic sur une miniature laisse son focus dans une zone qui suspend la boucle. La version 13 distingue le pointeur de la navigation au clavier. Le clic à la souris et le survol ne bloquent plus le défilement. Le focus clavier, la pause demandée, l’onglet masqué, l’ouverture hors écran, la fiche ouverte et les mouvements réduits continuent de suspendre la rotation.

Le trait de deux pixels utilise `--metal`, le même dégradé doré que la marque. Il progresse avec l’horloge de 3 000 ms du changement de vue. La pause fige sa fraction et reprend le temps restant ; un choix manuel repart à zéro. Les annonces automatiques restent silencieuses. La fin du préloader est détectée également quand l’événement dédié manque.

48 contrôles des vues passent : quatre cycles complets, régression du focus, survol continu, progression à 25 % / 50 %, pause à 40 % et reprise des 1 800 ms restantes, remise à zéro sur choix, événements répétés, chargements tardifs, réduction des mouvements, historique et repli sans requestAnimationFrame. Les ressources sont préchargées et décodées ; si une image tarde à être prête, la vue actuelle reste affichée jusqu’à son décodage.

Avec 69 parcours DOM, 22 contrôles des mouvements, 24 du préloader, 14 de navigation responsive et 7 de contenu, 184 contrôles fonctionnels / structurels passent. Les mesures du titre sont recalculées sur les 22 profils ; les 76 éléments image et 62 références WebP sont conservés.

Méthodes : simulation DOM, horloge contrôlée, analyse de fichiers et cascade CSS. Le rendu de cette correction dans un navigateur et sur appareils réels n’a pas été vérifié. Le localhost du client n’est pas accessible depuis cet environnement. Aucun site publié.


## Version 14 — agrandissement lissé et 4,5 secondes

Le délai du contrôleur et de la barre dorée est de 4 500 ms. Les 48 contrôles ciblés passent avec une horloge monotone : quatre cycles complets à 4 499 ms puis 1 ms, progression à 25 % et 50 %, pause à 40 % et reprise des 2 700 ms restantes, remise à zéro au choix manuel, survol continu, distinction souris / clavier, chargements tardifs, onglet masqué, historique et réduction des mouvements.

Les trois images sont issues des JPEG fournis, avec leurs dimensions doublées par interpolation Lanczos en RGB linéaire, puis export WebP qualité 96. Les trois tailles intermédiaires de 1 440 px sont ajoutées aux variantes mobiles de 720 px. Les fichiers exportés font respectivement 3 200 × 1 800, 1 978 × 2 882 et 2 560 × 3 200 pixels. Aucun nouveau cliché n’est généré et aucun élément de chantier n’est ajouté, supprimé ou recomposé. Le détail du calcul est dans `ressources/PHOTOS-ACCUEIL-QUALITE.json`. Les sources, les grands exports et les variantes ont été ouverts ou décodés.

Cette interpolation lisse le rééchantillonnage ; elle ne récupère aucune information photographique manquante. Les valeurs PSNR et d’erreur dans `verification-pixels-accueil.json` décrivent la proximité numérique après retour à la taille d’origine. Ce ne sont pas des notes de qualité visuelle ni de détails retrouvés. La recherche de correspondances perceptuelles dans les 1 109 images n’a pas identifié de duplicata exact à plus haute définition ; elle ne prouve pas l’absence de tous les recadrages ou angles voisins.

69 parcours DOM, 24 contrôles du préloader, 14 responsive et 7 de contenu sont repassés. Les 22 contrôles du mouvement et les 22 profils de géométrie restent applicables : leurs scripts et styles n’ont pas changé, les rapports de dimensions des images sont conservés. Total fonctionnel / structurel : 184 contrôles. Les 76 éléments image et 65 références WebP distinctes ont des dimensions conformes. Seuls les trois grands visuels d’accueil, le HTML de l’accueil et son contrôleur changent ; les trois tailles intermédiaires sont ajoutées. Les autres photos, le portfolio et la charte sont conservés.

Aucun rendu de cette version dans un navigateur réel, aucune mesure de netteté perçue sur écran, de fluidité ou de Core Web Vitals. Aucun site publié.


## Version 15 — fluidité du premier défilement

La version 14 animait la hauteur de la navigation et les dimensions du logo au seuil de 40 px. Dans la même mise à jour, elle écrivait la progression et la classe du header, puis relisait les rectangles des quatre chapitres. Ce mélange de changements de géométrie et de lectures est une source possible de saccades ; il n’a pas été mesuré par une trace navigateur.

La hauteur et les dimensions de mise en page sont désormais stables. Le logo utilise seulement une petite transformation, et le fond du header est uni sans flou. Les événements sont regroupés dans une seule frame ; les lectures de géométrie précèdent toutes les écritures et sont mises en cache jusqu’à un changement de disposition, de taille, de contenu ou de police. Le chapitre actif n’est réécrit que lorsqu’il change.

Dans un scénario identique de vingt frames, le script sauvegardé de la version 14 appelle quatre-vingts fois les rectangles des chapitres et vingt fois scrollHeight. La version 15 ne les appelle pas pendant le scroll stable après la mesure initiale. Les invalidations, y compris sans ResizeObserver pour les filtres et le formulaire, sont contrôlées séparément. Ces nombres sont des appels au code dans la simulation et ne sont pas des temps, FPS ou Core Web Vitals.

La grande photographie ne subit plus un zoom d’entrée. Les cinq effets du titre, filet, description et aperçus sont annulés dès qu’on descend, avec leur contenu immédiatement dans son état final. Les fondus photographiques se terminent au scroll sans toucher au délai suivant. Les effets des autres sections restent disponibles.

Le préchargement immédiat des trois grands visuels est remplacé par la préparation de la seule photo suivante après une seconde et, lorsque possible, une période inactive. Les références aux objets Image sont libérées du cache du contrôleur après décodage. La progression dorée utilise une animation native, sans boucle JavaScript par frame lorsqu’elle est disponible ; ses replis restent présents. Le changement de vue utilise toujours une échéance de 4500 ms.

Les 43 contrôles ciblés passent : préloader normal et bloqué, scroll, phases de lecture/écriture, cache actualisé, navigation compacte et double segment, douze changements automatiques, pauses/reprises, choix manuels, chargements tardifs/en erreur, clavier, visibilité, hors écran, mouvement réduit, historique, API manquantes et événement d’intro manqué. Les parcours de galerie, fiche, comparateur, formulaire et ruban sont contrôlés. Les 78 fichiers des assets sont identiques octet par octet à la version 14 ; leurs pixels et leur définition ne changent pas.

Le préloader avec ressources prêtes libère le scroll à 2140 ms ; une photo bloquée ne dépasse pas le plafond de 3500 ms. Son verrouillage pendant la séquence de chargement est volontaire et conservé. Aucun événement wheel ou touchmove n’est empêché par les scripts.

Aucune exécution dans un navigateur réel ni trace de performance n’a été effectuée. Le symptôme rapporté par le client n’est donc pas déclaré reproduit ni disparu sur son appareil. Les modifications suppriment les mécanismes identifiés dans le code et leurs régressions sont vérifiées en simulation. Aucun site publié.


## Version 16 — responsive et transition de l’intro

Le problème d’entrée est reproduit en simulation avec les fichiers sauvegardés de la version 15 : durant le fondu de sortie, la ligne de titre a son opacité finale de 1. Une fois le préloader caché à 2140 ms, craft.js crée ses keyframes à 0,35 et translateY(95%). Ce retour de l’état visible vers l’état initial explique le mécanisme rapporté. Il ne constitue pas une reproduction par capture dans le navigateur du client.

L’état initial est maintenant défini dans intro.css pendant que le logo couvre la page. intro.js émet renov-intro-leaving avant son fondu ; craft.js crée immédiatement les keyframes de l’eyebrow, des deux lignes, du filet, de la présentation, des contrôles et du lien projet. Le marqueur d’entrée armée libère les styles de préparation : si une animation est annulée ou indisponible, le contenu reste dans son état final. Aucun effet d’entrée n’est lancé après renov-intro-complete ou lors de l’arrivée tardive d’un script sur un accueil déjà visible. Les autres sections sont observées seulement une fois l’intro terminée.

Avec les ressources prêtes, les keyframes commencent à 1780 ms et le préloader se ferme à 2140 ms. Les traces d’opacité ne décroissent pas dans le scénario simulé. La simulation interpole linéairement pour vérifier le sens de progression ; elle n’évalue ni pixels réels ni sensation de la courbe cubic-bezier. Le plafond de sortie, les annulations et les replis restent contrôlés.

La géométrie responsive utilise un header commun de 108, 90, 80, 74 ou 70 px selon le contexte. Sa hauteur reste stable pendant le scroll. Les menus et ancres utilisent cette même valeur, avec zones de sécurité. La photo mobile utilise un cadre compris entre 220 et 420 px ; les paysages courts sont limités à 230 px. Le titre peut revenir à la ligne ; les commandes photo restent trois aperçus. Les compositions de métiers, galerie, garanties, formulaire, pied de page et documents utilisent les seuils communs. La section de matières réordonne ses vues sur mobile sans changer les fichiers photographiques. Les indications de chargement des images correspondent au seuil de 640 px ; les vues d’accueil utilisent la largeur du panneau quand l’écran expose deux segments.

31 contrôles fonctionnels passent, avec préloader complet, sortie synchronisée, scripts tardifs, resize pendant le fondu, scroll, APIs absentes, erreurs, clavier, mouvements réduits, menus, douze rotations, galerie, fiches, comparateur, formulaire et ruban. Les 78 fichiers des assets sont identiques à la version 15. Les mentions et données structurées sont conservées. Le dégradé commun et le timer doré restent en place, avec échéance de 4500 ms.

La cascade CSS est analysée sur 40 profils (tailles, segments et zones de sécurité simulés). Une estimation typographique du titre est calculée depuis le Manrope 400 local à une échelle 64×, en ajoutant l’espacement entre lettres. Les deux lignes tiennent dans la largeur calculée pour ces scénarios ; ce calcul ne prouve pas tous les retours à la ligne ou tous les débordements.

Aucune capture, exécution navigateur, mesure de fluidité, FPS, Core Web Vitals, clavier virtuel ou posture physique n’est effectuée. Les rapports précisent les limites. Le localhost du client n’est pas accessible ici. Aucun site publié.


## Version 17 — photos secondaires contenues sur ordinateur

La section de matières avait une grande image de rapport 979/1427 avec max-height:none. Les cartes de galerie utilisaient leur rapport photographique sans plafond de hauteur. Sur les grilles larges, certains portraits pouvaient donc occuper une hauteur importante à eux seuls.

Au-delà de 1100 px, les cadres de galerie sont plafonnés à min(560px,64svh). La photo de matières et les photos du portfolio sont plafonnées à min(580px,64svh). Les détails de matières sont limités à min(260px,30svh). Le comparateur garde son rapport 3/4 et utilise une largeur maximale de min(450px,45svh), donc une hauteur théorique au plus de 600 px. Les photos s’affichent avec object-fit:contain, sans agrandissement de leur fichier source. Les contextes à deux segments retrouvent leurs règles compactes.

Le rapport compare les déclarations et des hauteurs estimées depuis les colonnes et les rapports des huit cartes, sur 1101×768, 1280×720, 1440×900, 1920×1080, 2560×1440, 3440×1440, 3840×2160 et 1920×600. Quatre contextes compacts sont comparés aux styles sauvegardés de la version 16. Les limites, rapports et placements contrôlés sont conservés dans ces contextes. Toutes les feuilles CSS sont analysées syntaxiquement.

Seule refinement.css change parmi les fichiers publics. intro.js, intro.css, intro-boot.js, craft.js, hero-gallery.js, app.js, content.js et les trois pages sont identiques. Les médias sont conservés. Les anciens totaux de tests ne sont pas recomptés. La cascade et les calculs ne constituent pas un rendu navigateur, une mesure de fluidité ou un contrôle visuel du recadrage. Aucun site publié.
