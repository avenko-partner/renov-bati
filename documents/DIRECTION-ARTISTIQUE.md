# Direction artistique — Renov Bati

Version 18 — rythme des sections, transitions et lisibilité. Cette note décrit le dossier courant.

## Trois directions étudiées

| Direction | Composition | Décision |
| --- | --- | --- |
| Portfolio minimal | Projet et légende, peu de texte, grille régulière. | Utile à la consultation mais trop discret pour expliquer l’offre tous corps d’état dès l’arrivée. |
| Magazine architectural | Titres et photos indépendants dans une composition asymétrique. | La version précédente utilisait ce principe. Elle ne répondait pas au niveau de présence photographique demandé par le client. |
| Ouverture photographique immersive | Une réalisation remplit le cadre d’entrée ; titre, présentation et devis se regroupent sur le fond de marque. | Retenue : le travail devient immédiatement visible, avec des accès directs au contact et à la fiche de la réalisation. |

Le choix est un jugement de direction artistique lié au retour du client. Il ne constitue pas une note ou une certification externe.

## Sources de recherche

Sources consultées le 13 octobre 2026. Les pages et fiches ont été lues par recherche Web. L’aperçu officiel de Marvell a également été téléchargé et examiné. Les sites n’ont pas été parcourus dans un navigateur piloté ; leur animation réelle n’a pas été testée. Aucun de leurs médias, textes ou composants n’est intégré à Renov Bati.

- **Awwwards / Humaan, 7 mai 2026 — [Marvell Tile & Stone](https://www.awwwards.com/sites/marvell-tile-stone).** L’aperçu officiel place de nombreux fragments photographiques autour du titre. Le [site officiel](https://www.marvellco.com.au/) présente des détails de matières reliés à leurs projets. Observation retenue : les images peuvent porter la narration et donner accès à un travail précis. La mosaïque et l’identité de Marvell ne sont pas reprises.
- **Awwwards / Eyekiller, 18 janvier 2026 — [Somerville](https://www.awwwards.com/sites/somerville).** La fiche met en avant navigation, projets, détails de projet et formulaire. Observation retenue : une photographie doit rester liée à une information et à une action utile.
- **Haven Constructions, page officielle consultée le 13 octobre 2026 — [Accueil](https://www.havenconstructions.com.au/home).** Le contenu relie présentation, projets sélectionnés, partenaires et contact. Observation retenue : l’organisation de la page peut faire progresser de la réalisation au choix de l’entreprise. La date de publication de cette page n’est pas indiquée.
- **ACOR / Haroun Sadek, page officielle consultée le 13 octobre 2026 — [ACOR](https://acor-moe.fr/).** Le contenu propose des filtres de typologies et un ensemble de réalisations. Observation retenue : organiser un portfolio autour d’espaces concrets plutôt que répéter une promesse générale. La date de publication de cette page n’est pas indiquée.

Ces observations et la solution conçue pour Renov Bati sont des analyses, pas des classements des meilleurs sites du secteur.

## Composition réalisée

L’ancien premier écran répartissait un titre et deux photos dans des colonnes indépendantes. L’accueil actuel utilise une photographie pleine largeur, sans marge supérieure. La vue initiale montre la plage de piscine ; les trois vues tournent automatiquement toutes les 4,5 secondes après la fin du préloader. Trois boutons permettent également de choisir piscine, salle de bains ou cuisine. Le titre, la description et le devis gratuit restent groupés. Le dégradé utilise le fond #160100 et laisse davantage de photographie visible. La colonne de lecture garde un fond assez sombre sans changer la couleur des textes ; le projet conserve son accès dédié. Les trois images utilisent désormais toute la largeur et le même dégradé, conformément au retour du client. Le bord abrupt des deux portraits est supprimé ; leur cadrage vertical est adapté dans la même surface photographique. Les sources natives sont conservées ; les dérivés de l’ouverture sont rééchantillonnés pour le grand format.

Sur tablette et téléphone, la photo est placée au-dessus du texte. Les commandes deviennent une colonne sur les tablettes intermédiaires, puis une ligne de trois aperçus sur téléphone. La navigation compacte et ses accès au devis restent présents.

Le ruban des douze références apparaît immédiatement après l’ouverture. Il reste transparent, doré, continu et muni d’une commande de pause. Les huit entrées de l’accueil conservent des proportions photographiques variées, des filtres et leurs fiches. Le portfolio complet propose treize fiches ; Auchan reste présent.

Les métiers utilisent trois colonnes photographiques sur ordinateur. Sur tablette, chaque métier retrouve une photo latérale ; sur téléphone, photo et texte se suivent. Les prestations fournies restent complètes. La section claire rapproche une grande vue de douche et deux détails : salle de bains claire et encadrement de pierre. Le comparateur reste une preuve distincte après les finitions.

## Sélection des images

Les 31 planches contact de l’archive de 1 109 images ont été revues. Les candidates ont été ouvertes en grand. Deux photos ont été retenues : l’image 38 pour la salle de bains claire et l’image 456 pour le détail de douche. Elles ont été converties en WebP avec variantes mobiles. Les octets des sources correspondent aux empreintes du relevé d’archive existant.

Certaines candidates d’extérieur montraient encore du matériel, des accessoires ou des détails peu adaptés à une ouverture de site : elles n’ont pas été utilisées. La sélection et les raisons sont dans `ressources/SELECTION-REVISION-LUXE.json`. Aucune nouvelle photo de chantier générée n’est ajoutée. Aucun lieu, budget, date de travaux ou avis client n’est inventé.

Les trois grandes photos de l’ouverture sont rééchantillonnées depuis les JPEG originaux, par filtre Lanczos en espace RGB linéaire. Les dimensions sont doublées : piscine 3 200 × 1 800, salle de bains 1 978 × 2 882, cuisine 2 560 × 3 200 pixels. Les WebP sont encodés en qualité 96. Une variante de 1 440 px par photo complète les variantes mobiles de 720 px. La sélection responsive choisit parmi ces trois tailles. Le portfolio, les autres photographies et les couleurs de marque restent inchangés.

Il s’agit d’une interpolation non générative destinée à lisser l’agrandissement. Les pixels supplémentaires sont calculés à partir de leurs voisins ; ils ne représentent pas de nouveaux détails photographiques. Aucune architecture, matière, installation ou objet n’est remplacé. Les trois JPEG et les trois grands WebP ont été ouverts et comparés comme images. Les contrôles numériques de proximité figurent dans `documents/verification-pixels-accueil.json` ; ils ne mesurent pas une amélioration de netteté perçue dans le navigateur.

Les trois anciens essais de retouche Imagegen restent rejetés et ne figurent pas dans le site. Les empreintes, dimensions et méthode actuelle sont consignées dans `ressources/PHOTOS-ACCUEIL-QUALITE.json`.


## Identité

Fond #160100, couleur dominante mesurée dans le logo fourni. Doré #FAE7AF, crème #FEF1D9, nuances #E5CEA6 et #9D7C5C : palette et dégradé de marque conservés. Les pixels du fond du fichier original ne sont pas tous uniformes. Logo original intact. Titres Manrope et textes DM Sans, polices locales.

Les douze logos de références restent ceux du dossier fourni. Les trois autocollants illustrent les garanties légales ; ils ne constituent pas trois attestations d’assurance.

## Mouvement et fonctionnalités

Le préloader dessine les 69 contours, révèle le logo original puis laisse entrer le site. Durée simulée avec ressources disponibles : 2,14 secondes ; plafond absolu de 3,5 secondes. Aucun bouton Passer ni commentaires autour du logo.

Le choix d’une photographie attend son chargement et son décodage. Une vue actuelle reste affichée pendant l’attente ; une erreur conserve son texte et sa fiche. La dernière sélection gagne en cas de clics rapides. Un fondu de 550 ms et une arrivée légère de 700 ms relient les vues ; les copies décoratives sont retirées en fin ou en annulation. Le délai automatique est de 4 500 ms après la sortie du préloader ou chaque vue affichée. Une barre de deux pixels sous le choix actif reprend exactement le dégradé métallique de marque. Son avancement vient de la même horloge monotone que le changement d’image. Le choix direct remet sa durée à zéro ; Pause / Lecture conserve la fraction écoulée et reprend sur le temps restant. Les vues sont préchargées et décodées ; en cas de chargement lent, l’image actuelle est conservée, sans empiler les rotations. Un échec automatique est silencieux et la boucle avance vers le prochain projet. Les changements automatiques ne déclenchent pas d’annonce répétitive au lecteur d’écran.

Pause et reprise, focus clavier sur les commandes ou la fiche, onglet masqué, ouverture hors écran, fiche ouverte et retour navigateur sont pris en compte. Le survol et le focus conservé après un clic à la souris laissent la boucle avancer. La suspension par focus est réservée à la navigation au clavier. Les notifications répétées de visibilité ne réinitialisent pas l’échéance. La sortie du préloader est également détectée si son événement dédié manque, en observant le retrait de sa classe. La pause demandée reste active après un retour navigateur. La réduction des mouvements suspend la boucle ; les trois choix directs restent disponibles, sans fondu. La hauteur photographique ne change pas entre les trois vues sur téléphone ou tablette.

Les arrivées de sections, filtres animés, fiches, menu et comparateur sont conservés. Le pointeur et le clavier du comparateur suivent immédiatement le geste. Les éléments restent visibles sans réussite d’une animation ; aucun défilement de la page n’est détourné.

## Vérifications et limites

Parcours, liens, filtres, formulaires, préloader, média sélectionné et nettoyage des effets sont contrôlés en simulation DOM. Les largeurs du titre sont calculées sur 22 profils avec la police fournie. Les fichiers WebP, dimensions HTML et srcset sont vérifiés. Ces contrôles ne constituent pas une vérification du rendu en Chrome, Safari ou sur appareil réel.

Aucun rendu navigateur de cette révision, aucune mesure de fluidité perçue ou de Core Web Vitals réalisée. Aucun site publié. Aucun prix Awwwards ni classement Google n’est attribué ou garanti.


## Fluidité de la version 15

La navigation conserve sa hauteur et le logo se réduit légèrement par transformation visuelle. Le fond uni conserve la couleur de marque et remplace le flou derrière la barre. Le premier défilement ne change donc pas la géométrie de la page. Les positions des chapitres sont mises en cache et actualisées lors des changements de disposition.

L’entrée anime les deux lignes de titre, le filet, la présentation et les aperçus. La grande photographie est déjà en place ; elle ne subit plus un zoom et un fondu sur l’ensemble du cadre. Descendre annule ces cinq effets d’entrée sans cacher le contenu. Les changements de photo utilisent un simple fondu ; le scroll libère les copies photographiques encore animées. Les animations des métiers, filtres, fiches et comparateur restent disponibles.

Une seule photographie suivante est préparée après une seconde, via une période inactive lorsque l’API existe. Le contrôleur ne conserve pas les objets Image de préchargement après leur décodage. La barre dorée est animée par le navigateur lorsque Web Animations est disponible, avec une horloge commune de 4 500 ms et des replis. Les 78 fichiers des assets sont identiques à la livraison précédente.

La vérification est une simulation de comportements et une inspection du code. Aucun ressenti de fluidité ni temps de rendu dans un navigateur réel n’est affirmé.


## Entrée et responsive de la version 16

Le contenu du premier écran possède un état initial préparé tant que le logo couvre la page. L’événement de sortie est envoyé avant le fondu du préloader ; le texte et les commandes s’animent pendant ce fondu. La fin du préloader démarre seulement le timer photographique. Le chargement tardif de craft.js ne réanime pas les composants déjà visibles. Les annulations laissent le contenu dans son état final. La photographie reste en place, sans zoom de la grande surface.

La hauteur du header devient une variable commune pour sa géométrie, les ancres et le menu. Sur téléphone, la photo utilise un cadre proportionné à la largeur disponible ; sur un paysage court, elle est limitée à 230 px. Le titre peut revenir à la ligne sans être rogné. Les aperçus forment une ligne de trois images ; le devis principal occupe sa propre ligne sur les petits formats.

Les contenus passent à une colonne jusqu’à 640 px. Le pied de page garde ses coordonnées, ses liens et sa remontée en positions explicites. Les garanties, le comparateur, le formulaire et les pages annexes conservent des textes lisibles. Les commandes principales et les liens de contact ont des styles prévoyant au moins 44 px de hauteur. Les images de finitions sont ordonnées pour la lecture mobile : texte, photographie principale, puis deux détails. Le chargement des vues d’accueil s’adapte à la largeur du premier segment lorsque cette information est disponible.

Les choix sont vérifiés par simulation et analyse CSS, pas par un rendu sur appareils réels. La charte, les 78 fichiers des assets et les contenus administratifs sont conservés.


## Photographies de bureau en version 17

Les photographies secondaires reçoivent une limite de hauteur liée à la fenêtre. La galerie, les vues de matières, le comparateur et le portfolio restent dans un cadre de lecture plus mesuré. Les portraits de galerie sont contenus dans leurs cadres ; les photos de matières et du portfolio gardent leur image entière. Le fichier photographique n’est pas retouché. Les limites et leur portée sont décrites dans verification-images-desktop-v17.json ; aucun aperçu rendu dans un navigateur n’est présenté comme vérifié.

## Finition après l’accueil — version 18

L’ouverture acceptée est préservée. Le mouvement des images est un déplacement vertical court ; les textes de métier entrent latéralement pour accompagner leur composition alternée. Les photographies de matières sont observées séparément afin de respecter leur position sur mobile. Les garanties restent stables et lisibles, avec un mouvement limité du visuel et du titre. Aucun masque d’entrée ni disparition préalable n’est utilisé.

Les durées des entrées se situent entre 580 et 760 ms, avec une courbe commune et sans boucle ni manipulation du scroll. Les survols restent réservés aux pointeurs précis. La réduction des mouvements système et le réglage du site neutralisent ces effets. Les petits textes sont agrandis ; les images secondaires gagnent légèrement en présence sans revenir aux hauteurs excessives de la version 16. Ces choix sont documentés et contrôlés par simulation ; leur aspect et leur fluidité réels restent à examiner dans un navigateur.
