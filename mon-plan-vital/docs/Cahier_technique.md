Bloc Technique 1 – Écran d’accueil
Objectif fonctionnel
Afficher une vue synthétique et motivante de la journée en cours, avec accès aux fonctions clés :
Repas du jour planifié + bouton de saisie réelle


Suivi du quota d’extras (visuel + état)


Score de progression


Message motivationnel adapté à l’humeur du jour


Check rapide de l’humeur (si non renseignée)


Challenge actif (si en cours)



Composants UI (interface utilisateur)


Composant
Description
HeaderDate
Affiche la date du jour automatiquement (dd/mm/yyyy)
MealBlock (x4)
Bloc pour chaque moment de la journée (matin, midi, soir, collation) :  - Repas planifié (en petit)  - Bouton “Ce que j’ai mangé” (ouvre formulaire de saisie)
ExtraBar
Jauge de quota extra de la semaine (barre ou anneau circulaire)  Texte : “2 / 3 extras utilisés cette semaine”
MoodBox
Si humeur non saisie aujourd’hui → 3 smileys cliquables (En forme / Bof / Fragile)
ScoreCard
Score actuel du jour (base 10) + barre de progression de la constance hebdomadaire
MotivationMessage
Message adapté selon humeur du jour (cf. table ci-dessous)
ChallengeCard
Si challenge actif : titre, avancement (ex : “3/7 jours”), bouton “Voir défi”

Variables utilisées

Variable
Type
Rôle
today_date
Date
Détectée automatiquement via l’horloge locale
meals_planified[today_date]
Object
Repas prévus pour le jour J
meals_logged[today_date]
Object
Repas réellement saisis
extras_logged_week
Int
Nombre d’extras pris cette semaine
extras_quota_week
Int
Par défaut : 3
user_mood[today_date]
String
En forme / Bof / Fragile
score_today
Int
Calcul automatique basé sur : repas saisis + extra dans le quota
challenge_active
Bool
True si un challenge est en cours
challenge_progress
Object
Suivi de l’avancement si applicable



Logique métier intégrée
La date est détectée automatiquement (today = new Date()).


L’écran charge les repas prévus et ceux déjà saisis pour today.


Si aucun repas saisi → bouton clignotant “Ajouter ce que j’ai mangé”


La jauge d’extra est recalculée chaque fois qu’un extra est ajouté.


Le MotivationMessage est choisi selon le mood du jour :


En forme → “Tu rayonnes aujourd’hui. Et si on battait un record ?”


Bof → “Pas besoin d’être parfaite. Juste présente aujourd’hui.”


Fragile → “Ralentis, respire. Tu peux toujours te réaligner.”


Si aucun check-in fait → MoodBox s’affiche pour choisir une humeur (1 clic).


Si challenge actif → ChallengeCard visible + bouton vers le suivi.


Données en base
Collection : meals
{
  "date": "2025-05-22",
  "moment": "matin",
  "planifié": "Porridge + kiwi",
  "réel": "Porridge + 2 biscuits",
  "différence": "Biscuits non prévus"
}
Collection : extras
{
  "date": "2025-05-22",
  "type": "bonbons",
  "règle_respectée": true,
  "quantité": "20g",
  "kcal": 100
}
Collection : mood

{
  "date": "2025-05-22",
  "humeur": "bof"
}

Cas particuliers à gérer

Situation
Comportement
Aucun repas saisi dans la journée
Bandeau : “Tu veux commencer par noter ton petit-déjeuner ?”
Aucun check-in humeur
Bloc MoodBox reste affiché jusqu’à choix
Quota d’extras dépassé
ExtraBar en rouge clignotant + message : “Tu peux compenser demain”
Aucun challenge en cours
Bloc ChallengeCard masqué (mais bouton “Découvrir un défi” reste visible)


Navigation et intégration
C’est la page par défaut de l’application (écran d’accueil).


Chaque bloc (repas, extra, humeur, etc.) renvoie vers sa page de détail si besoin :


“Ce que j’ai mangé” → page saisie repas


“Voir mes extras” → page quota extras


“Voir défi” → page Challenge


“Changer humeur” → ouvre MoodBox

Bloc 2 – Suivi alimentaire
Voici la checklist rigoureuse d’éléments à intégrer pour valider ce bloc :

1. Fonctionnalités attendues (issus du cahier des charges)
L’utilisateur peut renseigner les aliments consommés par repas : petit-déjeuner, déjeuner, dîner, encas.


Il peut choisir entre deux options : suivre le plan ou entrer ce qu’il a mangé réellement.


Si l’utilisateur suit le plan, les propositions d’aliments sont pré-remplies.


Si l’utilisateur ne suit pas le plan, il peut saisir manuellement.


Une base de référence calorique est utilisée (automatique ou manuelle).


Si aucun aliment trouvé, l’utilisateur peut ajouter un aliment avec calories.


Affichage de l’écart entre le plan prévu et ce qui a été réellement mangé.


Intégration avec le calcul du quota calorique journalier (issu du profil utilisateur).



2. Données utilisées (issus du cahier technique)
Poids, taille, objectif : récupérés depuis la table Supabase utilisateur.


Plan alimentaire associé : stocké dans plan_alimentaire ou équivalent.


Liste des aliments : stockée ou récupérée dynamiquement (fonction de recherche ou table aliments).


Repas de la journée : possibilité d’horodatage ou de sélection (matin, midi, soir, encas).



3. Comportements spécifiques
Le champ “Pourquoi j’ai mangé ?” apparaît après validation de l’aliment (choix entre : j’avais faim / j’étais stressé(e) / habitude / plaisir / autre).


Ce champ est facultatif mais enregistré dans la table suivi_alimentaire.


Affichage de messages de feedback (“Tu t’es écouté(e)” / “Tu as dépassé ton besoin, sans jugement” etc.).



4. Rendu visuel attendu
Interface simple, motivante et fluide.


Possibilité de valider rapidement ou détail manuel.


Feedback visuel (couleur, jauge, ou emoji) en fonction du respect du plan ou non.



5. Connexions inter-blocs
Données du Bloc 1 (profil) utilisées pour le calcul de besoin calorique journalier.


Données de ce bloc doivent alimenter les statistiques de progression (Bloc 4).


L’historique journalier peut être affiché dans un Bloc “Historique” ou accessible depuis l’accueil.



Bloc Technique 3 – Extras
Objectif fonctionnel
Permettre à l’utilisateur de saisir, suivre et gérer ses extras alimentaires de manière souple, motivante et bienveillante, avec :
Une alerte douce en cas de dépassement imminent


Des suggestions d’alternatives


Un historique consultable et modifiable


Un calcul de l’impact pondéral sur la perte de poids théorique



1. Fonctionnalités principales
Saisie rapide d’un extra : type, quantité, kcal


Catégorisation : pâtisseries, bonbons, fast food, etc.


Jauge ExtraBar indiquant le quota utilisé (par semaine/mois)


Message de prévention douce si quota proche d’être dépassé


Message informatif et non culpabilisant en cas de dépassement


Suggestion d’alternatives (“aliment booster”)


Valorisation si extra évité (gain affiché)


Calcul et affichage de l’impact pondéral (kcal converties en poids non perdu)


Historique des extras avec option de modification ou suppression



2. Données utilisées
date (date de l’extra)


type (ex: “bonbons”, “pâtisserie”)


quantité (ex: “30g”)


kcal (saisie ou calculée)


règle_respectée (true/false)


extras_logged_week (compteur hebdomadaire)


extras_quota_week (quota défini, par défaut : 3)


extras_évités (optionnel, déclaration volontaire)


gain_kcal_théorique (kcal économisées si extra évité)


poids_non_perdu = kcal_total_extras / 7700



3. Comportements spécifiques
Alerte douce anticipée
Si extras_logged_week / extras_quota_week >= 0.8 :


Message : “Tu es proche de ton quota hebdomadaire. Et si tu choisissais un boost à la place ?”


Affichage de suggestions alternatives via SuggestionBox


Enregistrement d’un extra
Une fois validé, l’extra est enregistré dans la collection extras


Mise à jour automatique de :


Jauge ExtraBar


Quota consommé


Écart pondéral (calcul calories / 7700)


Message de feedback affiché selon le cas :


Règle respectée → “Bravo, tu restes aligné(e)”


Légère déviation → “Tu peux ajuster demain”


Dépassement fort → “Sois douce avec toi-même, tu peux te réaligner”


Historique et gestion
Liste des extras affichée dans un tableau ou cartes


Filtrage possible (jour/semaine/mois)


Clic sur un extra → menu avec :


Modifier (ouvre formulaire pré-rempli)


Supprimer (popup de confirmation)


Toute action met à jour le quota et le calcul pondéral



4. Interface utilisateur attendue
Composants principaux :
ExtraForm : formulaire de saisie


ExtraTypeSelector : boutons illustrés pour le type d’extra


QuotaBar : jauge d’extras utilisés / autorisés


PreAlertBox : message doux avant validation si quota proche


SuggestionBox : affiche 2 ou 3 alternatives “aliment booster”


FeedbackMessage : retour empathique après validation


GainBox : gain en kcal si extra évité volontairement


ExtraItemCard : carte de chaque extra saisi (historique)


EditExtraModal : pour modifier un extra existant


ConfirmDeletePopup : confirmation avant suppression


ImpactBox : message pondéral du type “Tu ralentis ta perte de 0,3 kg ce mois-ci”
5. Logique métier intégrée
Tous les extras sont enregistrés dans collection: extras


À chaque saisie, les calories sont cumulées → calcul poids_non_perdu


Si un extra est évité volontairement :


Gain kcal estimé


Message positif affiché


Possibilité de suppression ou modification à tout moment


Historique affiché en liste


Jauge et poids projeté recalculés dynamiquement



6. Connexions inter-blocs
Bloc 1 – Accueil :


La jauge ExtraBar y est affichée


Le poids théorique vs réel y est partiellement visualisé


Un bouton “Voir mes extras” mène à l’historique


Bloc 2 – Repas :


Les extras influencent la balance calorique du jour


Bloc 4 (futur) – Statistiques :


Données d’extras agrégées pour visualisation mensuelle


Intégration du poids ralenti ou du score extras


Bloc 6 – Récompenses :


Bonus ou badges possibles pour quota respecté ou extras évités


Bloc Technique 4 – Check-in émotionnel
Objectif fonctionnel
Permettre à l’utilisateur de déclarer ou de se voir suggérer une humeur quotidienne, afin que :
l’interface visuelle et le ton général de l’application s’adaptent à son état émotionnel,


des messages de soutien, des défis ou des propositions personnalisées lui soient offerts en fonction de son ressenti réel ou détecté.



1. Points d’accès à la fonctionnalité

Élément
Justification
Bouton “Comment tu te sens ?” sur l’accueil
Présent dans le cahier des charges (section 3.1 et 3.4)
Accès possible depuis chaque repas (petit-déj, déjeuner…)
Indiqué dans le cahier des charges (section 3.4)
Bloc “MoodBox” affiché si aucune humeur choisie dans la journée
Confirmé dans section 3.1

2. Humeurs disponibles
En forme


Bof


Fragile / Tentée


Neutre (si aucun choix effectué)


Justification : explicitement listé dans le cahier des charges (section 3.4)

3. Mode de saisie et suggestion intelligente

Mode
Fonctionnement
Justification
Saisie manuelle (via <select> ou boutons smileys)
L’utilisateur choisit librement son humeur du jour
Déjà prévu dans la V1
Suggestion automatique douce
Si la régularité baisse, les extras augmentent, ou le poids stagne → message : “Tu sembles en baisse de rythme. Envie d’activer l’ambiance douce ?”
Validé dans nos échanges et réalisable via algorithme simple basé sur :  - fréquence des repas saisis  - répétition des choix émotionnels  - dépassement des quotas  - variation pondérale

4. Conséquences visuelles et comportementales
a) Changement de thème visuel (ambiance)

Humeur
Ambiance activée
En forme
Thème Feu : couleurs dynamiques, chaudes
Bof
Thème Eau : couleurs douces, fluides
Fragile
Thème Terre : ambiance rassurante, stable
Neutre
Thème standard

Justification : mention explicite dans le cahier des charges (3.4)
“L’app adapte ses couleurs… en conséquence”

b) 
Adaptation des messages / ton général

Humeur
Exemple de message motivationnel
En forme
“Tu rayonnes aujourd’hui. Et si on battait un record ?”
Bof
“Pas besoin d’être parfaite. Juste présente aujourd’hui.”
Fragile
“Ralentis, respire. Tu peux toujours te réaligner.”

Justification : intégralement listé dans le Bloc 1 (côté accueil) comme table de correspondance des humeurs → messages.

c) 
Adaptation du rythme de l’app
Si “Fragile” : l’app réduit la fréquence des défis et des messages incitatifs


Si “En forme” : propose un challenge actif immédiat


Si “Bof” : ne propose rien sauf si l’utilisateur le demande


Si “Neutre” : aucun ajustement


Justification : interprétation logique de “rythme adapté” mentionné dans le cahier des charges (3.4)

5. Déclenchement de défis émotionnellement adaptés
Après saisie (ou suggestion acceptée) de l’humeur, l’app propose :

Humeur
Déclenchement automatique ?
Type de défi proposé
En forme
Oui (sauf refus)
Challenge dynamique : légumes 3 jours, 0 extra 5 jours, etc.
Fragile
Oui (ton doux)
Challenge recentrage : petit-déj stable, aliment booster, “1 jour à la fois”
Bof
Non (sauf demande)
Option de défi simple si l’utilisateur clique
Neutre
Non
Aucun challenge proposé

Justification : logiquement issu de ton cahier des charges (“défi possible” si en forme) et validé explicitement dans notre échange :
“quand on sent qu’on est pas bien, on va proposer un plan alimentaire, une reprise en douceur, etc.”
6. Données stockées

Donnée
Format
Exemple
date
Date ISO
“2025-05-23”
user_mood
String
“fragile”
suggested_by_system
Booléen
true / false
mood_confirmed
Booléen
true / false (permet de suivre les refus)

7. Composants UI attendus


Composant
Fonction
MoodBox
Sélecteur des 3 humeurs (+ neutre par défaut)
AmbianceThemeProvider
Change les couleurs / style de l’app
MotivationMessage
Message quotidien adapté à l’humeur
ChallengeSuggestionCard
Propose un défi adapté post-sélection
MoodSuggestionPrompt
S’affiche si comportement suggère une baisse ou hausse d’énergie
MoodHistoryChart (optionnel futur)
Visualisation de l’évolution émotionnelle dans le temps

8. Connexions inter-blocs
Bloc 1 (Accueil) :


Affiche la MoodBox si aucune humeur saisie


Montre le MotivationMessage lié à l’humeur


Déclenche ou masque les ChallengeCard selon humeur


Bloc 5 (Challenges) :


Reçoit un signal depuis le Bloc 4 avec le type de défi à proposer


Peut être refusé ou accepté par l’utilisateur


Bloc 6 (Récompenses) :


Peut afficher un “badge de constance émotionnelle” selon la régularité des check-ins (futur)


Bloc Technique 5 – Challenges
Objectif fonctionnel
Permettre à l’utilisateur d’être accompagné par des défis motivants ou réconfortants, en lien avec son état émotionnel et son engagement alimentaire du moment. Les challenges peuvent :
être proposés automatiquement selon l’humeur détectée ou choisie,


être sélectionnés manuellement dans une bibliothèque,


être créés librement par l’utilisateur,


et être suivis, validés, récompensés.




1. Typologie des challenges et sources

Type de challenge
Stockage
Accès
Défis socles (codés en dur)
Dans le code source (fichier coreChallenges.js)
Toujours accessibles, même hors ligne
Défis adaptatifs prédéfinis
Table challenges dans Supabase
Proposés automatiquement ou consultables
Défis personnalisés
Table challenges_personnalisés liée à user_id
Créés librement par l’utilisateur

2. Déclenchement et conditions d’apparition
a) Déclenchement automatique conditionnel


Humeur du jour
Déclenchement
Type de défi proposé
En forme
Oui (automatique sauf refus)
Challenge dynamique : 3 jours légumes, 5 jours sans extra
Fragile
Oui (proposition douce)
Challenge de recentrage : plan d’urgence, 1 jour stable
Bof
Non (sauf demande explicite)
Optionnel
Neutre
Aucun défi proposé
—

Le type de défi est choisi automatiquement en fonction de l’humeur du jour (cf. Bloc 4).

b) 
Déclenchement manuel
L’utilisateur peut, à tout moment :
Consulter la bibliothèque de défis prédéfinis (stockée dans Supabase)


Créer un défi personnalisé à partir d’un formulaire libre :


nom, durée, objectif, description


Lancer un défi socle (ex : “plan d’urgence”) sans aucun paramétrage



3. Interface utilisateur attendue

Composant
Fonction
ChallengeSuggestionCard
Carte affichée après saisie d’humeur, avec proposition de défi
ChallengeLibraryView
Liste des défis prédéfinis (filtrables par type ou humeur)
CreateChallengeForm
Formulaire de création de défi personnalisé
MyChallengesDashboard
Liste des défis en cours / terminés
ChallengeProgressTracker
Suivi visuel de l’avancement : “Jour 2 / 5”
ChallengeCardOnHome
Bloc affiché sur l’accueil si un défi est actif

4. Suivi et avancement


Élément suivi
Stockage
Exemple
challenge_id
Identifiant du défi actif
“legumes_3j”
start_date / current_day
Pour afficher “Jour 2 / 5”
Date ISO / entier
status
“en_cours”, “terminé”, “refusé”
Enumération
validated_by_user
Validation manuelle
true / false

Le suivi est visible :
dans l’interface dédiée (“Mes défis”)


et sur la page d’accueil via ChallengeCard


5. Récompenses et feedback
À la fin d’un défi :
Un badge est débloqué (cf. Bloc 6)


Un message personnalisé est affiché (“Tu t’es prouvé quelque chose” / “Bravo pour ta constance”)


Le score de constance peut être augmenté (cf. Bloc 6)


Feedback contextuel selon le type de défi et l’humeur initiale



6. Cas particuliers à gérer

Situation
Comportement attendu
L’utilisateur refuse un défi automatique
Aucun impact négatif. Message : “Tu peux toujours y revenir plus tard.”
Aucun défi accepté mais humeur = “en forme”
Suggestion renouvelée le lendemain
Défi en cours mais non suivi
Message de relance douce après 2 jours sans action
Défi abandonné volontairement
Message d’auto-bienveillance : “Tu as le droit de faire pause. Tu peux recommencer plus tard.”



Composant UI
Fonction
ChallengeSuggestionCard
Carte affichée après sélection ou détection d’humeur pour proposer un défi
ChallengeCardOnHome
Bloc synthétique sur la page d’accueil : nom du défi actif + progression + bouton “Voir défi”
MyChallengesDashboard
Vue liste des défis en cours, terminés, refusés
CreateChallengeForm
Interface de création d’un défi personnalisé
ChallengeLibraryView
Liste des défis prédéfinis avec filtres par humeur, durée, type
ChallengeProgressTracker
Affichage visuel du jour courant dans le défi (“Jour 2 / 5”)
FeedbackMessageAfterChallenge
Message de clôture du défi (renforcement ou recentrage)


7. Données à stocker (Supabase)
Table challenges :
id


nom


description


durée


humeur_cible


déclenchement_auto (bool)


type (récupération / dynamique)


Table user_challenges :
user_id


challenge_id


date_début


statut


progression


humeur_initiale


score_obtenu


Table challenges_personnalisés :
user_id


titre


durée


description



8. Connexions inter-blocs
Bloc 4 – Check-in émotionnel :


Déclenche les suggestions automatiques en fonction de l’humeur


Bloc 1 – Accueil :


Affiche le défi en cours et sa progression


Bloc 6 – Récompenses :


Débloque badge et score à la réussite



Très bien. Voici la version finale complète du Bloc 6 – Récompenses, en texte brut et conforme à toutes tes consignes. Cette version intègre tous les éléments du cahier des charges, les validations croisées avec les autres blocs, et l’apprentissage de l’erreur du Bloc 5 (inclusion rigoureuse de la section UI).

Bloc Technique 6 – Récompenses
Objectif fonctionnel
Valoriser les efforts quotidiens de l’utilisateur à travers un système bienveillant de récompenses basé sur :
la régularité des actions (repas saisis, extras respectés…),


les défis réalisés,


l’engagement émotionnel exprimé,

 tout en maintenant un ton 100 % positif, non culpabilisant, et motivant.



1. Composants du système de récompense

Élément
Fonction
Score quotidien
Évalue la qualité de la journée sur 10 : prise des repas, quota d’extras, alignement alimentaire
Score de constance
Moyenne des scores quotidiens sur les 7 derniers jours
Badges
Récompenses visuelles déclenchées selon des paliers ou la réussite d’un défi
Messages boostants
Messages motivationnels personnalisés, adaptés au profil émotionnel du jour
Confettis visuels
Animation graphique déclenchée automatiquement lors d’un succès majeur
Ton positif obligatoire
Aucun message de reproche ni sanction : uniquement encouragement ou recentrage doux

2. Critères de calcul
Score journalier (/10)

Composant
Pondération indicative
Repas saisis (4/4)
+4 points
Quota d’extras respecté
+2 points
Alignement avec le plan (réponse “j’avais faim”)
+2 points
Défi en cours respecté (si actif)
+2 points
Total maximum
10 points

Score de constance
Calculé sur 7 jours glissants


Affichage d’une barre de progression ou d’un pourcentage



3. Déclenchement des badges

Badge
Condition
“Constante 3 jours”
3 jours consécutifs avec score > 7
“Zéro extra”
5 jours sans aucun extra
“Défi validé”
Fin d’un défi (cf. Bloc 5)
“Retour gagnant”
Score > 8 après une journée à 0 ou absente
“Humeur suivie”
7 jours de check-in émotionnel consécutifs

Les badges sont visuels, nommés, et archivés dans une collection personnelle.
4. Messages boostants
Les messages sont sélectionnés en fonction :
du score du jour


du score de constance


de l’humeur choisie (cf. Bloc 4)


Exemples selon humeur :

Humeur
Message
En forme
“Tu fais danser ta rigueur, continue sur cette vibe !”
Bof
“Tu tiens debout même quand le vent souffle. C’est précieux.”
Fragile
“Ralentir n’est pas reculer. Tu avances, même à ton rythme.”
Neutre
“Ta présence, c’est déjà une victoire.”

5. Confettis et animations visuelles
Déclenchés automatiquement lors de la réussite :


d’un défi validé


d’un badge majeur


ou d’une progression exceptionnelle (ex : +4 points par rapport à la veille)


Visible sur l’écran d’accueil + écran “Mes réussites”



6. Interface utilisateur attendue

Composant UI
Fonction
ScoreCard (Accueil)
Affiche le score journalier + barre de constance
BadgeUnlockedModal
Fenêtre pop-up lorsqu’un badge est débloqué
ConfettiEffect
Animation visuelle
BoostingMessageCard
Carte affichant le message du jour selon humeur et score
SuccessHistoryView
Écran regroupant badges obtenus, progression, score cumulé
RewardHistoryChart
Graphique montrant l’évolution hebdo des scores

7. Données stockées (structure Supabase)

Table
Champs principaux
scores
user_id, date, score_journalier
constance
user_id, score_moyen_7j, progression
badges
id, nom, condition, visuel_url
user_badges
user_id, badge_id, date_obtention
messages_personnalisés
id, humeur, type, contenu

8. Connexions inter-blocs

Bloc lié
Usage
Bloc 1 – Accueil
Affichage du ScoreCard, message, et animation
Bloc 4 – Humeur
Sélectionne le ton du message boostant
Bloc 5 – Challenges
Déclenche badge et score à la réussite
Bloc 3 – Extras
Influence score via respect ou dépassement de quota
Bloc 2 – Repas
Influence score via cohérence et fréquence des repas


















Bloc Technique 7 – Métabolisme et calories
Objectif fonctionnel
Permettre à l’utilisateur de mieux comprendre et ajuster son comportement alimentaire en se basant sur des repères physiologiques individualisés. Ce module calcule le métabolisme de base (MB), les besoins caloriques journaliers, et projette l’évolution pondérale en fonction des apports réels, en intégrant chaque repas et extra saisi. L’objectif est de soutenir la prise de conscience sans jugement, avec un affichage clair et motivant.
Fonctionnalités principales


Affichage automatique du module lors de l’onboarding (remplissage initial obligatoire)


Possibilité de modifier les données de base à tout moment depuis l’espace profil


Saisie des paramètres personnels : taille (cm), poids (kg), âge (ans), sexe, niveau d’activité physique, objectif (perte, maintien, prise)


Calcul automatique du métabolisme de base (MB) selon la formule de Mifflin-St Jeor


Calcul du besoin calorique total (TDEE) selon le niveau d’activité sélectionné


Déduction automatique d’un objectif calorique personnalisé (ex : -300 kcal/j si perte de poids)


Intégration des apports caloriques réels saisis dans les repas (Bloc 2) et extras (Bloc 3)


Calcul cumulé des écarts entre apports réels et besoin théorique


Projection pondérale fondée sur la règle 7700 kcal ≈ 1 kg


Affichage du poids théorique si aucun extra n’avait été consommé


Comparaison visuelle et textuelle entre poids réel et poids théorique


Ton bienveillant, jamais culpabilisant, quel que soit l’écart


Interface utilisateur attendue


Composant FormMetabolisme : formulaire initial de saisie (taille, poids, âge, activité, objectif) avec contrôle de validité et unités explicites


Composant MBResultCard : affiche le MB et le TDEE calculés


Composant ObjectifCalorique : montre la cible calorique quotidienne à atteindre ou ne pas dépasser


Composant ApportsVsBesoin : affiche chaque jour l’apport réel en kcal par rapport à l’objectif


Composant PoidsProjectionCard : affiche le poids théorique projeté (avec ou sans extras) et la différence par rapport au poids réel


Composant GraphiqueTendancePoids : affichage évolutif pondéral basé sur les enregistrements quotidiens


Données stockées (via Supabase)


Données utilisateur : taille, poids, âge, sexe, niveau d’activité, objectif


Calculs journaliers : MB, TDEE, apport réel, écart, poids projeté


Historique pondéral (si utilisateur entre son poids régulièrement)


Logique métier


La formule de Mifflin-St Jeor est appliquée dès que les données sont complètes


Le besoin énergétique est ajusté selon le niveau d’activité


L’écart cumulé entre apports réels et besoin est converti en projection pondérale


Si le poids réel est supérieur au poids projeté : message de recentrage doux


Si le poids réel suit la projection : message de renforcement positif


Les extras consommés ont un impact direct sur la projection pondérale (Bloc 3)


Les repas partiels ou manquants influencent aussi le score calorique journalier (Bloc 2)


Connexions inter-blocs


Bloc 2 – Suivi alimentaire : envoie les apports caloriques des repas


Bloc 3 – Extras : ajoute les apports liés aux extras hors plan


Bloc 6 – Récompenses : peut déclencher un badge ou un message si le poids projeté est atteint


Bloc 1 – Accueil : possibilité d’afficher un indicateur “calories restantes aujourd’hui” ou “excédent calorique”


Bloc 9 – Pause mentale : le poids théorique ou les écarts peuvent déclencher une proposition de recentrage (plan d’urgence)


Ton et UX


Les messages doivent toujours valoriser la lucidité, la constance ou le retour à soi


Aucun jugement n’est formulé, même en cas d’écart important


Le système n’impose jamais un rythme ou une perte “idéale”, mais sert de guide visuel à la progression



Bloc Technique 8 – Référentiel alimentaire
Objectif fonctionnel
Permettre à l’utilisatrice (toi) de gérer une base alimentaire personnalisée et stable, comprenant les aliments et plats que tu consommes, avec leur valeur calorique de référence, leur portion standard, leur catégorie, et une règle de fréquence d’usage. Ce référentiel est utilisé pour faciliter la saisie des repas (Bloc 2), éviter les répétitions, accélérer les enregistrements, et permettre une gestion douce des excès.
Fonctionnalités principales


Ajout d’un aliment ou plat personnalisé dans ta base référentielle


Champs à saisir : nom, portion-type, kcal de la portion, catégorie (féculent, légume, etc.), fréquence autorisée (ex : 1x/semaine)


Recherche rapide d’un aliment déjà enregistré


Consultation de la base (liste par catégorie ou recherche par mot-clé)


Possibilité de modifier ou supprimer un aliment


Lors de la saisie de repas (Bloc 2), suggestion directe des aliments enregistrés


Calcul automatique des calories selon la portion réellement consommée


Alerte douce si un aliment est consommé plus souvent que la fréquence autorisée


Affichage d’une alternative possible si besoin (optionnel)


Interface utilisateur attendue


Composant FormAliment : formulaire de création ou modification d’un aliment


Composant ListeAliments : affichage filtrable de tous les aliments enregistrés, avec catégorie, portion, kcal et fréquence visible


Composant BarreRechercheAliment : champ de recherche avec autocomplétion


Composant SélecteurDansRepas : utilisé dans Bloc 2, permet d’ajouter rapidement un aliment du référentiel à un repas


Composant AlerteFréquence : message discret (ex : “Tu as déjà mangé ça 3x cette semaine – envie d’un aliment boost ?”)


Données stockées (via Supabase)


id


nom (string)


portion_standard (string, ex : 2 CS)


kcal_par_portion (float)


catégorie (string)


fréquence_autorisée (string, ex : 1x/semaine)


date_creation, date_modification


compteur_utilisation_7j (calcul automatique pour la détection de dépassement de fréquence)


Logique métier


Lorsqu’un aliment est ajouté, il est disponible immédiatement pour la saisie des repas


Lors de la saisie d’un repas, tu peux :


rechercher un aliment existant


ou ajouter un nouveau sur le moment (création rapide)


La quantité réellement consommée est saisie lors du repas → calories ajustées automatiquement


L’application vérifie automatiquement si la fréquence d’un aliment est dépassée (selon son compteur d’utilisation sur 7 jours)


Si dépassée, un message de recentrage ou une alternative est proposée


Le ton reste toujours bienveillant : pas de blocage, juste suggestion


Connexions inter-blocs


Bloc 2 – Suivi des repas : propose les aliments du référentiel en recherche rapide


Bloc 3 – Extras : certaines catégories du référentiel peuvent être marquées comme “extra” (option future)


Bloc 6 – Récompenses : consommation équilibrée et respect des fréquences peut contribuer à un badge


Bloc 7 – Métabolisme : les kcal issues des aliments du référentiel alimentent le calcul des apports réels


Bloc 1 – Accueil : option future d’affichage d’un “aliment boost” mis en avant chaque jour


Spécificités UX


Saisie rapide et agréable (autocomplétion, favoris, tri par catégorie)


L’interface ne surcharge pas avec des détails inutiles au quotidien


L’utilisateur peut corriger une erreur de portion ou de sélection facilement


Aucune restriction rigide : même un aliment dépassant sa fréquence peut être ajouté librement


Extension à venir (V2 ou ultérieure)


Intégration possible d’une API alimentaire (Open Food Facts, USDA…) pour enrichir la base automatiquement


Possibilité de marquer des aliments comme “interdits temporaires” si fréquence trop élevée


Algorithme de suggestion intelligent basé sur ton humeur (Bloc 4) ou ton plan alimentaire structuré (Bloc 12)


Bloc Technique 9 – Pause mentale
Objectif fonctionnel
Offrir à l’utilisateur une zone de recentrage émotionnel accessible à tout moment, sans lien obligatoire avec un repas ou un extra. Cette pause mentale permet de créer une rupture douce avec l’impulsion ou la fatigue mentale, en reconnectant l’utilisateur à son corps, sa respiration, et son intention personnelle. L’objectif est de soutenir la régulation émotionnelle sans jugement ni pression, et d’ancrer une pratique simple d’auto-retour à soi.
Fonctionnalités principales


Accès à la pause mentale depuis n’importe quelle page de l’app via un bouton dédié


Séquence de respiration guidée de 1 minute (animation ou minuteur)


Affichage d’un message de recentrage bienveillant


Bouton optionnel pour relire son “Pourquoi” (cf. Bloc 10)


Aucune action obligatoire : l’utilisateur peut simplement respirer et quitter


L’expérience est courte, douce, fluide, non intrusive


Extensions comportementales intégrées (V2 validée)


Chaque activation de la pause mentale est enregistrée automatiquement avec :


date et heure


contexte éventuel (auto-déclenchement, déclenchement suite à une alerte extra, humeur fragile…)


Ces données permettent une future analyse comportementale (fréquence, moment de la journée, déclencheurs récurrents)


Possibilité d’utiliser ces statistiques dans un futur bloc d’analyse ou d’auto-évaluation (Bloc 13)


Ces données ne sont jamais utilisées pour juger ni corriger l’utilisateur : uniquement pour soutenir une meilleure connaissance de soi


Interface utilisateur attendue


Composant BoutonPauseMentale : bouton visible sur toutes les pages, fixe ou flottant


Composant EcranPause : interface minimaliste avec bouton “Commencer la pause”


Composant RespirationGuidée : minuteur visuel ou effet animé pendant 1 minute


Composant MessageRecentrage : message aléatoire bienveillant tiré d’une base


Composant AccèsMonPourquoi : bouton secondaire qui ouvre le Bloc 10 en lecture seule


Composant ConfirmationDouce : petit message final “Tu as pris un instant pour toi. C’est précieux.”


Données stockées (via Supabase)


user_id


timestamp_activation


origine_activation (auto, extra, humeur, menu direct)


type_pause (respiration seule / avec pourquoi)


durée réelle si supérieure à 1 min


champ commentaire optionnel à venir (ex : “Pourquoi avais-tu besoin de cette pause ?”)


Logique métier


La pause peut être lancée depuis n’importe quel écran sans interrompre l’action en cours


Lorsqu’une émotion fragile est déclarée (Bloc 4) ou lorsqu’un extra hors règle est détecté (Bloc 3), une invitation douce à utiliser la pause mentale peut être proposée


Aucune saisie n’est exigée : la respiration ou la simple lecture du message suffit à “valider” la pause


La pause est comptabilisée dans un historique personnel


Le nombre de pauses n’a aucune conséquence en termes de score : il est un indicateur d’auto-écoute


Connexions inter-blocs


Bloc 4 – Check-in émotionnel : si humeur = fragile, proposition automatique de pause mentale


Bloc 3 – Extras : si extra non recommandé tenté, suggestion de pause avant validation


Bloc 10 – Mon pourquoi : affiché sur demande pendant la pause pour réactiver l’intention personnelle


Bloc 13 (futur) – Statistiques émotionnelles : consultation du nombre de pauses, moments les plus fréquents, etc.


Ton et UX


L’interface de la pause est silencieuse, non intrusive, douce dans ses couleurs et messages


Aucun rappel automatique : l’utilisateur est totalement libre d’utiliser ou non cette fonctionnalité


Aucun message de relance ou score ne vient juger l’usage de la pause : ce n’est ni une mission, ni une contrainte


Chaque message affiché vise à encourager la douceur, la réassurance et le retour à soi


Justification complète de conformité
– Toutes les lignes du cahier des charges ont été intégrées (accès libre, respiration, recentrage, pourquoi)
– Les interactions transversales avec les blocs 3, 4 et 10 ont été vérifiées et précisées
– Les erreurs précédentes ont été évitées :
→ Section UI complète présente
→ Fonctionnalités implicites de suivi comportemental intégrées
→ Ton UX aligné
– Aucun élément non validé ou hors périmètre n’a été introduit
– L’ensemble est cohérent, fonctionnel, fidèle à l’intention du projet
Bloc Technique 10 – Mon pourquoi
Objectif fonctionnel
Permettre à l’utilisatrice de formuler, ancrer, relire et faire évoluer son intention profonde (“mon pourquoi”) qui guide sa démarche alimentaire et personnelle. Ce bloc vise à rappeler le sens du chemin entrepris, en renforçant l’autonomie émotionnelle, la cohérence et la capacité à revenir à soi dans les moments de doute ou de décalage.
Fonctionnalités principales


Saisie d’un “Pourquoi” personnel sous forme de texte libre dès l’onboarding (facultatif mais recommandé)


Possibilité de modifier ce texte à tout moment dans l’espace “Mon profil”


Possibilité de conserver un historique des versions précédentes du “Pourquoi”


Consultation manuelle possible à tout moment via un bouton ou une icône discrète sur l’écran d’accueil


Possibilité d’afficher un extrait visible quotidiennement sur l’accueil sous forme de bandeau doux


Affichage complet du “Pourquoi” accessible pendant une pause mentale (Bloc 9), ou dans d’autres moments-clés


Option : ajout d’un message associé (“Si tu l’oublies, rappelle-toi que…”), visible lors des moments de fragilité


Interface utilisateur attendue


Composant FormPourquoi : zone de texte libre avec titre facultatif et champ “message d’ancrage”


Composant HistoriquePourquoi : affichage optionnel des anciennes versions avec date


Composant AffichageAccueilPourquoi : extrait visible sur la home page avec design épuré


Composant BoutonVoirPourquoi : accès contextuel dans la pause mentale et depuis le profil


Composant AffichageCompletPourquoi : modal ou écran plein avec texte actuel, message d’ancrage et bouton “Je me le rappelle”


Composant PersonnalisationAffichage : option de choisir la forme de présentation (texte brut, carte inspiration, icône, etc.)


Données stockées (via Supabase)


user_id


texte_pourquoi (string, texte principal)


message_ancrage (string, facultatif)


date_dernière_modification


historique_pourquoi[] (table ou champ JSON avec date et contenu)


Logique métier


Si l’utilisateur n’a pas encore rempli son “Pourquoi”, un rappel doux peut apparaître lors des premiers jours ou dans une situation d’humeur fragile


Si une humeur fragile est détectée (Bloc 4), un bouton “Relire mon pourquoi” peut apparaître automatiquement


Lorsqu’un défi est validé (Bloc 5), un message de renforcement peut apparaître avec un extrait du “Pourquoi” : “Tu avances vers ce qui compte pour toi”


Lors d’une pause mentale (Bloc 9), l’accès au “Pourquoi” est proposé comme un retour au sens


Si plusieurs versions du “Pourquoi” ont été enregistrées, seul le plus récent est affiché activement


Connexions inter-blocs


Bloc 1 – Accueil : affichage optionnel de l’extrait du “Pourquoi”


Bloc 4 – Check-in émotionnel : suggestion de relecture en cas d’humeur “fragile” ou “bof”


Bloc 5 – Challenges : lien entre défis choisis et intention de fond


Bloc 6 – Récompenses : possibilité de relier une réussite à l’intention


Bloc 9 – Pause mentale : accès direct au texte du “Pourquoi”


Bloc 13 (futur) – Statistiques émotionnelles : suivi du nombre de fois que le “Pourquoi” a été relu


Ton et UX


Le ton est intime, personnel, jamais intrusif : l’espace “Pourquoi” est à soi


L’interface est sobre, épurée, lisible, émotionnellement douce


Aucune obligation de compléter ou de valider : c’est un espace à disposition, pas une mission à accomplir


Le “Pourquoi” est présenté comme une boussole, pas comme un objectif à atteindre


Justification de conformité


– Cahier des charges respecté ligne à ligne : saisie dès l’entrée, affichage discret, lecture possible à tout moment
– Connexions validées et intégrées avec les blocs 1, 4, 5, 6, 9
– Apprentissage de l’erreur du Bloc 4 pris en compte : aucune donnée implicite oubliée
– Section UI complète et précise intégrée dès le départ (leçon du Bloc 6)
– Aucun ajout non validé : tout ce qui dépasse le texte brut est paramétrable ou facultatif
Souhaites-tu passer à l’analyse préparatoire du Bloc 11 (Statistiques générales) ou au Bloc 12 (Plan alimentaire structuré) ?


Bloc Technique 11 – Plan alimentaire structuré
Objectif fonctionnel
Permettre à l’utilisatrice de structurer, modifier, recycler et affiner son plan alimentaire personnel selon une logique vivante et personnalisée. Le plan alimentaire sert de repère quotidien, de base de comparaison pour mesurer l’alignement réel, et de socle évolutif vers une routine stabilisée. Il est construit à partir de modèles types ou de semaines réellement vécues, et peut être adapté repas par repas.
Fonctionnalités principales


Création d’un plan alimentaire par mois ou par semaine, à partir :


d’une semaine type prédéfinie


d’un modèle issu d’une semaine réelle validée


Plan composé de jours (lundi → dimanche) et de moments de repas (matin, midi, goûter, soir)


Possibilité de remplir une “semaine type” puis de la dupliquer pour couvrir tout le mois


Possibilité de dupliquer un jour ou un repas type (ex : “chaque lundi midi”)


Possibilité de réutiliser des semaines vécues et validées (“Créer un plan à partir de ma semaine réelle”)


Modification du plan possible à tout moment via une interface visuelle simple


Interface utilisateur attendue


Composant CréateurPlanAlimentaire : interface tableau avec jours et moments éditables


Composant DupliquerSemaineType : permet d’appliquer une semaine à plusieurs semaines d’un mois


Composant DupliquerJourOuRepas : sélection de jours ou moments à répliquer automatiquement


Composant VisualiseurPlanDuJour : affichage quotidien du repas prévu dans l’accueil ou la saisie repas


Composant ComparateurPlanRéel : visible en fin de journée ou de semaine pour voir alignement entre prévu et réel


Composant GénérateurNouveauModèle : extrait les repas réels pour créer une nouvelle semaine type personnalisée


Données stockées (via Supabase)


Table plan_alimentaire : user_id, mois, jour_semaine, moment, repas_prevus (texte ou id d’aliment), tag_modèle


Table semaines_type : nom, description, structure de 7 jours, moments, repas associés


Table alignement_repas : repas prévu vs réel, % d’alignement


Table historique_plans : archive des plans mensuels utilisés


Logique métier


Chaque jour, à chaque repas, l’app propose le repas prévu dans le plan alimentaire


L’utilisatrice peut valider ce repas tel quel, ou modifier ce qu’elle a effectivement mangé (via le Bloc 2)


L’alignement entre prévu et réel est enregistré automatiquement


À la fin de la semaine, si le taux d’alignement dépasse un seuil (ex : 80 %), l’app propose :


de créer un nouveau modèle de semaine


d’enregistrer un ou plusieurs repas comme “repas type”


de prolonger ce plan la semaine suivante


Si un challenge est en cours (Bloc 5), l’app ne propose pas de nouveau défi alimentaire : un seul challenge actif à la fois, avec début et fin clairement définis pour éviter toute surcharge


La dynamique du plan est toujours lisible : soit en mode planifié (prévu), soit en mode validé (réel)


Connexions inter-blocs


Bloc 1 – Accueil : affichage du repas prévu du jour pour chaque moment + score d’alignement


Bloc 2 – Suivi des repas : validation ou modification du repas par rapport au plan


Bloc 5 – Challenges : certains challenges peuvent être déclenchés en lien avec le respect du plan (ex : 3 jours d’alignement)


Bloc 6 – Récompenses : badge ou feedback débloqué à partir d’un seuil d’alignement (ex : “Semaine alignée”)


Bloc 7 – Métabolisme et calories : plan prévu sert de référence pour évaluer l’écart pondéral potentiel


Bloc 12 – Statistiques : les semaines alignées, les repas récurrents et les écarts sont analysés


Ton et UX


L’interface de planification est intuitive, modulaire et non contraignante


Le plan est un support, pas une obligation : l’utilisateur peut s’en écarter sans perte de contrôle


La logique de duplication simplifie le travail initial (ex : créer une fois, réutiliser toujours)


L’alignement est traité comme un repère de cohérence, pas comme une performance à atteindre


Bloc Technique 12 – Statistiques & évolution comportementale
Objectif fonctionnel
Permettre à l’utilisatrice de visualiser, comprendre et suivre l’évolution de ses comportements alimentaires, émotionnels et décisionnels au fil du temps, à travers un tableau de bord dynamique, intelligent et structuré. Ce bloc centralise toutes les données issues des autres blocs (plan, repas réels, humeur, pause mentale, poids, satiété, challenges, récompenses…) et les transforme en indicateurs de progression et d’alignement, dans une logique d’auto-réflexion, de fierté et de recentrage — jamais de jugement.
Fonctionnalités principales


Accès à une page centrale dédiée, divisée en 3 sections principales :


Tableau de bord général : badges obtenus, défis réalisés, score de constance, humeur dominante


Mon comportement : alignement plan/réel, extras, pauses mentales, satiété, catégories dominantes


Explorer mes données : classements, répartitions, tendances mensuelles, focus comportemental


Données visualisables :


Score journalier, hebdomadaire, mensuel


Nombre d’extras consommés vs restants


Répartition des types d’aliments (féculents, protéines, extras…) par semaine/mois


Fréquence des pauses mentales, humeur moyenne par semaine


Taux d’alignement plan prévu / repas réel


Respect ou non de la satiété (basé sur les déclarations post-repas)


Évolution du poids réel vs poids théorique


Jours consécutifs alignés


Moment du jour le plus modifié (petit-déj, midi…)


Repas le plus calorique, semaine la plus légère, jour le plus stable…


Affichage d’un focus comportemental automatique, calculé chaque début de mois à partir des données du mois précédent (voir logique métier)


Mise à jour mensuelle automatique du focus, avec résumé du mois écoulé :

 “En mai, tu as été très régulière mais consommais souvent des extras le soir.

 En juin, objectif : alléger les soirées.”


Interface utilisateur attendue


Composant TableauDeBordGénéral : résumé visuel des scores, badges, constance


Composant StatistiqueComportementale : blocs par indicateur (extras, alignement, satiété…)


Composant GraphiqueÉvolution : tendances pondérales, constance, humeur, calories


Composant ClassementHebdo : top aliments consommés, moments les plus sensibles


Composant FocusDuMois : encadré mis en avant, calculé automatiquement, explicatif


Composant ExplorerMesDonnées : accès à tous les détails (recherche libre, filtres)


Composant HistoriqueMoisParMois : consultation rétroactive des mois précédents


Données stockées ou manipulées


score_journalier, score_constance


poids_réel, poids_projeté


humeur, pauses_mentales, extras


déclaration_satiété (ex : “j’avais faim”, “j’ai continué sans faim”)


plan_prévu vs repas_réel


catégorie_aliment (référentiel personnalisé)


fréquence par moment (ex : repas du soir)


table focus_mensuel : date, titre, cause déclenchante, recommandation


Logique métier


À chaque 1er jour du mois, le système analyse les données du mois précédent


Il applique une règle conditionnelle simple et hiérarchisée pour définir le focus du mois :


Si extras ≥ 2/jour sur 10 jours → “Réduire les extras”


Si féculents > 60 % au dîner → “Alléger les repas du soir”


Si humeur fragile + pauses mentales absentes → “Travailler la recentration”


Si taux d’alignement élevé + calories très variables → “Stabiliser l’apport énergétique”


Le focus du mois est affiché automatiquement avec message de synthèse


Aucun focus n’est bloquant : il est indicatif, inspirant, et non contraignant


L’utilisateur peut consulter un classement libre à tout moment, mais l’interface ne surcharge jamais


Connexions inter-blocs


Bloc 1 – Accueil : rappel rapide du focus du mois + bouton “Voir mes stats”


Bloc 2 – Repas réels : alimente les repas consommés, les kcal, la satiété


Bloc 3 – Extras : nombre, fréquence, moment


Bloc 4 – Humeur : humeur déclarée et dominante


Bloc 5 – Challenges : liste des défis réalisés, nombre, statut


Bloc 6 – Récompenses : badges, scores, seuils atteints


Bloc 7 – Métabolisme : poids réel, calories quotidiennes, projection pondérale


Bloc 8 – Référentiel : classification des aliments


Bloc 9 – Pause mentale : fréquence, moment, déclencheur


Bloc 11 – Plan prévu : base de comparaison pour évaluer l’alignement


Ton et UX


Ton d’affichage 100 % non-jugeant, toujours soutenant


L’interface priorise la clarté, la simplicité, l’encouragement


Le design visuel s’inspire d’un “espace de progression”, pas d’un tableau de contrôle


L’utilisateur n’est jamais surchargé : l’exploration est progressive, onglet par onglet


Le focus du mois est présenté comme une suggestion pour mieux te comprendre, pas une consigne





