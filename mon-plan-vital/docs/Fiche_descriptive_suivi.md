FICHE DESCRIPTIVE — PAGE /suivi.js

INTENTION & OBJECTIF DE LA PAGE
Créer une page de suivi alimentaire du jour, utilisée par une seule utilisatrice, pour consigner en détail ses repas réels, les comparer au plan prévu, et déclencher des logiques comportementales basées sur un référentiel personnel (catégories, règles, fréquences, unités).
Cette page est le centre vivant de l’application. Elle permet de comprendre les choix alimentaires faits en réalité, de valoriser les bonnes pratiques, d’éviter les automatismes, et d’alimenter les futures recommandations du plan.

BLOC 1 — Structure générale, blocs repas, affichage prévu/réel, calcul kcal

CE QUE VOIT L’UTILISATRICE
Une page divisée en quatre blocs fixes :

  • Petit-déjeuner

  • Déjeuner

  • Collation

  • Dîner


Chaque bloc contient :

  1. Le repas prévu, affiché automatiquement en haut du bloc (lecture du plan_alimentaire)

  2. Une section de saisie du repas réel avec :

   • Champ “aliment mangé” (libre ou auto-complété)

   • Champ “catégorie” (liée à categories_aliments)

   • Champ “quantité” (ex. : “2 CS”)

   • Calcul automatique d’équivalent en grammes (unites_personnelles)


Si l’aliment saisi est un extra :

  → Message : “Cet aliment correspond à un extra. Souhaites-tu l’enregistrer comme tel ?”

  → Si oui :

   • est_extra = true

   • Enregistrement dans extras avec horodatage

   • Affichage d’un bouton : “Voir quota d’extras restants”


À la fin de journée, un message synthétique peut apparaître si au moins un repas a été saisi, du type :

  • “Tu es à +134 kcal par rapport à ton plan. Encore 3 jours comme ça, et tu compenses un extra.”

  • “Tu es alignée avec ton besoin. Ancrage en cours.”


Si aucune saisi rappel que plus les aliment sont rempli plus de chance d atteindre ton objectif x temps ( delai déterminer  dans profil par l utilisateur ) 
La page est orange  si l’utilisatrice ne saisit rien.



CE QUE GÈRE LA PAGE EN ARRIÈRE-PLAN (LOGIQUE COMPORTEMENTALE ET FONCTIONNELLE)
Lecture automatique du repas prévu pour chaque créneau depuis plan_alimentaire


Création d’une entrée repas_reels dès qu’un repas réel est saisi


Calcul automatique en grammes basé sur unites_personnelles


Comparaison catégorie prévue vs réelle :

  • Si identique → pas d’alerte

  • Si différente → message neutre (optionnel)


Détection des extras :

  • Si détecté → affichage du message + validation utilisateur

  • Enregistrement dans la table extras si accepté

  • Mise à jour de extras_logged_week

  • Affichage possible du quota restant


Champ a_reprendre = true/false enregistré pour chaque repas

  → utilisé dans /plan.js pour suggérer les repas récurrents


Calcul automatique de kcal_total_journalier en fonction des aliments saisis

  → Comparaison avec le besoin calculé via la formule Mifflin-St Jeor

  → Génération d’un message synthétique en bas de page si au moins 1 repas rempli

BLOC 1bis — Suggestion, reconnaissance, conversion et pré-remplissage intelligent

MÉTHODOLOGIE ACTIVÉE : OUI
Ce bloc a été rédigé en appliquant intégralement la méthodologie suivante :
Contenu exclusivement issu du tableau comparatif final, enrichi à partir des 4 versions (origine, enrichie, V4, finale)


Le cahier technique est utilisé uniquement comme outil de vérification et de comparaison, pas comme source directe


Structure à deux volets obligatoires :

   • Vue UTILISATRICE

   • Vue COMPORTEMENTALE / LOGIQUE


Règle ZÉRO OMISSION activée


Section finale de vérification explicite



INTENTION DU BLOC (restauration stricte)
Optimiser la saisie des repas réels à travers :
la reconnaissance des repas fréquemment saisis


la proposition intelligente d’auto-remplissage


la vérification instantanée dans le référentiel personnel


la conversion automatique en équivalents nutritionnels (grammes, calories)



VUE UTILISATRICE
Lorsqu’elle saisit un repas, l’utilisatrice peut bénéficier de fonctionnalités d’assistance intelligentes, sans devoir les activer elle-même.
1. Pré-remplissage automatique si redondance
Si un même repas est saisi trois fois en deux semaines à l’identique :( uniquement si y’a saisie manuelle et que c’est pas le repas du plan )

  → La page propose :

   “Souhaites-tu que ce repas soit ajouté à ta routine alimentaire ? « 


Si elle accepte :
  Le repas s ajoute automatiquement Elle peut cliquer sur “Valider” ou “Modifier” rapidement
Le repas s’affiche dans la page planning alimentaire ( elle pourra chaque mois prendre ce repas pour constituer sa routine alimentaire )


2. Vérification instantanée dans le référentiel
Lorsqu’un aliment est saisi, la page Vérifie dans le référentiel personnel : 
 Sa fréquence autorisée
Les règles comportementales associées
 (ex. : “à éviter le soir”)


Si une règle est associée à l’aliment :

 Affichage d’un message discret sous le champ, par exemple :

 “Règle : cet aliment est à limiter à 1x/15 jours”

   “À éviter le soir, selon ton plan perte de poids”


3. Conversion calorique automatique
Une fois la quantité renseignée (ex : “2 càs”), la page :

  • Calcule automatiquement l’équivalent en grammes

  - Et déduit les kcal correspondantes

   synthèse en fin de journée peut mentionner :

   → “Tu es à à économiser +134 kcal par rapport à ton objectif alimentaire du jour, 
Condition si extra consommée dans la semaine ça rattrape xxx de ton extra de la semaine ! 
Condition si 3 a 5 jours jours consécutif calorie à respecter par jour inférieur ou égale alors peux afficheur grâce à tes efforts tu viens aujourd’hui de te te rapprocher  de xx%  de ton objectif de perte de poids ! Continue dans cette lancer



VUE COMPORTEMENTALE / LOGIQUE TECHNIQUE
Pré-remplissage intelligent activé si :

  • Même aliment + même catégorie + même créneau horaire

  • ≥ 3 occurrences sur 15 jours glissants

  → Déclenche message avec bouton de validation


Champ a_reprendre = true stocké dans repas_reels

  → Utilisé dans /plan.js pour alimenter les suggestions de repas futurs


Vérification dans le référentiel personnel au moment de la saisie :

  → Fréquence + règles comportementales consultées en base

  → Affichage d’un message si une contrainte est identifiée

  → Enregistrement de règle_respectée = true/false selon situation


Conversion automatique déclenchée dès qu’une quantité est saisie :

  → Utilise table unites_personnelles pour conversion

  → Ajoute les kcal estimées à la variable kcal_total_journalier




BLOC 2 — Satiété, émotions, déclencheurs comportementaux, rétroactions
Identifier si l’on a respecté la satiété ou pas,
encourager une écoute de soi approfondie,
et pouvoir dire “ce repas a été aligné avec mon besoin ou non”.
Ce bloc doit alimenter les statistiques de progression,
et contribuer au déclenchement éventuel de feedbacks ou de micro-challenges

CE QUE VOIT L’UTILISATRICE
Après avoir saisi son repas réel, l’utilisatrice interagir avec deux champs complémentaires comportementaux :
1. Champ “Satiété respectée ?”
3 niveaux sont proposés :
Oui, j’ai respecté ma satiété


Non, j’ai dépassé ma satiété


Je n’ai pas mangé par faim (envie, automatisme…)


Il permet à l’utilisatrice d’évaluer elle-même si son repas est en accord avec son ressenti


2. 
Champ “Pourquoi j’ai mangé ?”
Ce champ n’apparaît que si l’utilisatrice indique avoir dépassé sa satiété


Il n’est jamais automatique : c’est une bulle douce qui propose :

 “Tu veux en parler ? Que s’est-il passé ?”


Si elle choisit d’y répondre, plusieurs options sont disponibles :


Faim


Stress


Fatigue


Habitude


Envie


Autre


L’objectif n’est pas de corriger, mais d’amorcer une prise de conscience douce, volontaire
3. 
Champ “Ressenti après le repas” apparaît que si le champs Pourquoi j’ai mangé à été complete ou si l utilisation veut renseigner son ressenti ( bouton discret +)
Proposé en texte libre ou par sélection :

  • Léger

  • Satisfait

  • Lourd

  • Frustré

  • Autre ( indique et si la même sensation apparaît plus de > 10 à integrer / ou proposion intelligente 
Aide l’utilisatrice à faire un retour rapide sur son état
4. Feedback comportemental doux (si rempli)
Message possible selon les réponses :

  • “Tu t’es écoutée, ton corps s’en souvient”

  • “Ce n’était pas une vraie faim. Observe ce que tu ressens maintenant”

  • “Tu as dépassé ton besoin, sans jugement”









CE QUE FAIT LA PAGE EN ARRIÈRE-PLAN (LOGIQUE COMPORTEMENTALE)
Le champ “Satiété respectée ?” est enregistré en base

  → utilisé pour calculer la variable stabilite_jour = true si 3 repas saisis dans la journée et 80 % des repas avec satiété respectée


Si l’utilisatrice coche “satiété dépassée”, la page déclenche :


Une bulle douce d’invitation à répondre au champ “Pourquoi j’ai mangé ?”


Les réponses choisies sont enregistrées pour analyses comportementales futures


Si des dépassements de satiété se répètent sur plusieurs jours :ex entre 30 a 50% sur la totalité de la journée sur 3 jours 

 → déclenchement possible d’un micro-challenge comportemental, comme :


“Revenir à ton rythme sur 3 repas”


“Pause : et si on arrêter de se mettre la pression, fais juste un pas en avant focus sur une micro action ça sera toujours mieux que rien  
Ces propositions sont invisibles tant que la régularité n’est pas compromise
• Calculer le % hebdomadaire de repas “écoutés”

  • Détecter les dérives ou régularités


Le champ “Pourquoi j’ai mangé ?” est déclenché :

  • Soit automatiquement après validation de l’aliment

  • Soit contextuellement si plusieurs repas précédents présentent des écarts


Les réponses sont enregistrées mais non visibles dans l’interface

  → utilisées pour affiner les messages comportementaux


Le champ “Ressenti après le repas” est stocké pour analyse qualitative à venir



Déclenchement comportemental (feedbacks + challenges)
En cas de 
bonne dynamique (écoute régulière, régularité > 10 jours)
 :
Un message peut apparaître :

  “Tu sembles prête à relever un petit défi. Envie de t’y engager ?”


Si accepté :

  • challenge_active = true

  • Suivi activé sur /defis.js


En cas de 
dérive répétée (satiété non respectée < 30 % sur > 3 jours)
 Accompagnement axée sur le mindset et la spiritualité les moments bien être se re centrer favorise les micro action 
Ex

Déclencheur comportemental : dérive répétée
Condition technique simple (dans Supabase + front) :
→ Si le taux de « satiété respectée » est < 30 % pendant 3 jours consécutifs

1. Déclenchement d’un module “Rappel à soi” discret
Nom du module : “Moment de recentrage”
Apparition :
Slide-up doux dans /suivi.js OU


Zone dédiée dans /statistiques.js si la barre est suspendue


Texte proposé :
“Ces derniers jours ont été plus flous.
Et si tu prenais 3 minutes pour revenir à toi, calmement ?”
→ Bouton : [Je prends ce temps]

2. Mini capsule audio/textuelle inspirée du mindset / spiritualité
Si l’utilisatrice clique sur “Je prends ce temps”, elle accède à une capsule audio ou textuelle de 1 à 3 minutes.
3 formats proposés (rotatifs ou au choix) :
Mindset calme : “Tu n’as rien raté. Tu peux reprendre quand tu veux. Même maintenant.”


Spiritualité laïque : “Respire. Tu es un point d’équilibre entre ce que tu ressens et ce que tu vis. Tout est mouvement.”


Micro-ancrage : “Choisis un micro-geste pour revenir à toi : un thé ? marcher ? t’étirer ? l’écrire ? Un seul suffit.”


→ Possibilité de cocher un micro-geste accompli :
[ ] Boire un verre d’eau
[ ] Marcher 3 minutes
[ ] Écrire une phrase d’encouragement
[ ] Fermer les yeux 30 secondes
[ ] Autre : _______

3. Mécanisme invisible de valorisation
Si l’utilisatrice interagit avec la capsule (même brièvement) :
→ Une pastille douce s’affiche dans /statistiques.js sous forme de note invisible,
→ Peut déclencher un message comme :
“Tu as pris un instant pour toi. C’est ça aussi, rester alignée.”
La page peut déclencher une proposition douce 
  • Recentrage : “Et si on reprenait demain tranquillement ?”

  • Défi réparateur : “3 repas à ton rythme pour retrouver ton axe”


Aucun message n’est automatique : tout est lié à des conditions comportementales réelles


BLOC 3 — Score journalier, score hebdomadaire, feedback synthétique
INTENTION DU BLOC 
Fournir à l’utilisatrice un retour synthétique quotidien et hebdomadaire sur l’alignement entre ses repas, son plan, son ressenti, et les règles comportementales

Offrir un feedback motivant, structurant, non culpabilisant
Alimenter la progression comportementale par la visualisation régulière d’un score ancré dans ses propres choix


VUE UTILISATRICE
1. Score journalier (fin de journée)
À la fin de chaque journée (si au moins un repas a été saisi), l’utilisatrice voit apparaître un message synthétique.


Exemples :

  • “Tu as respecté 3 repas sur 4, en cohérence avec ton plan”

  • “Tu as suivi ta faim et évité les extras. Cette journée t’ancre”


Ce message n’est pas un chiffre :

  → C’est une phrase interprétée, construite à partir des données du jour

  → Aucune note ou score visible


Ton : factuel, responsabilisant, encourageant

2. Score hebdomadaire (affiché chaque fin de semaine)
Une fois par semaine (le dimanche soir, ou en mode glissant), l’utilisatrice reçoit un feedback récapitulatif.


Ce score est exprimé en pourcentage :

  → Formule : (repas alignés / repas saisis) × 100


Un message est associé automatiquement à ce score, selon le palier atteint :



Score hebdomadaire
Message affiché
≥ 90 %
“Ta régularité est remarquable. Tu es dans bien ancré dans ton goal.”
75–89 %
“Tu avances avec rigueur. Et ton corps le sent.”
50–74 %
“Tu poses les bases. Chaque pas compte.”
30–49 %
“Tu t’es un peu éloignée, mais tu peux te réaligner sans pression.”
Seuil atteint
Message affiché
10 jours
“Ta zone de stabilité commence à se dessiner.”
25 % du parcours
“Tu as tenu ton cap sur le premier quart de ton parcours.”
50 % du parcours
“Ce n’est plus un effort ponctuel, c’est une manière d’être.”
75 % du parcours
“Tu es dans ta zone. Il ne s’agit plus de persévérer, mais d’habiter ton rythme.”
80 % du parcours
“Ta régularité s’est inscrite dans le temps.”


En cas de baisse comportementale :
La barre peut :

  • Soit être grisée (si < 10 jours valides sur 30 jours glissants)

  • Soit régressée de 10 % (si < 20 jours valides sur 60 jours)


Message associé (exclusif, sans tonalité de recul) :

  > “Ta zone s’est réduite. Revenir dans ton rythme, c’est toujours possible.”


VUE COMPORTEMENTALE / LOGIQUE TECHNIQUE
La barre est personnalisée selon l’objectif de durée défini dans le profil :

  • Ex. : 5 mois = 150 segments maximum


Critère pour valider un segment (stabilite_jour = true) :

  • 3 repas saisis et 80 % avec “satiété respectée”


Les segments sont stockés dans un tableau type zone_stabilite[]


L’apparition de la barre est conditionnée à :

  → len(zone_stabilite) ≥ 10


Affichage des paliers :

  • Calculés automatiquement selon la durée cible

  • Chaque message de seuil ne s’affiche qu’une seule fois


En cas de dérive :

  • <10 jours valides / 30 jours → barre grisée

  • <20 jours valides / 60 jours → retrait de 10 % de segments


Aucun retour à zéro n’est jamais déclenché


La logique est non gamifiée, aucune icône de récompense, aucun badge déclenché ici



BLOC 5 — Marque de constance & logique invisible de stabilité comportementale
INTENTION DU BLOC (extrait direct)
Mettre en mémoire une régularité comportementale installée, sans la transformer en récompense
Reconnaitre un ancrage profond chez l’utilisatrice sans l’exposer
Activer en interne une variable d’état stable influençant la suite du parcours
Aucune gamification, aucune visibilité graphique imposée
VUE UTILISATRICE
Ce mécanisme n’est jamais affiché directement.


Aucun badge, icône, barre ou effet visuel ne signale la “marque de constance”


Elle ne voit qu’un seul message ponctuel, qui peut apparaître une seule fois, si la condition est remplie :


“Tu as installé une régularité profonde. Elle fait partie de toi maintenant.”
Ce message peut apparaître :


en bas de /suivi.js


ou dans une synthèse hebdomadaire


ou à l’activation d’un nouveau palier


Il n’y a aucune relance liée à cette marque, aucun suivi visible



VUE COMPORTEMENTALE / LOGIQUE TECHNIQUE
La marque de constance est une logique comportementale invisible


Elle est activée si :


Le système observe une régularité > 75 % de journées alignées


Sur une durée glissante de 4 semaines consécutives


Si cette condition est remplie :


La variable constance_active = true est stockée dans la base


Un flag peut être utilisé pour éviter la répétition du message


Effets internes de constance_active = true :


Modifie le ton des messages comportementaux suivants (plus autonomisant)


Rend possible l’apparition de challenges plus avancés, si la dynamique est maintenue


Supprime les relances type “Tu veux reprendre ?” → car le système considère que l’utilisatrice est auto-portée


Cette logique peut influencer :


Le score journalier (en rendant son affichage plus synthétique)


Le comportement du rappel de goal (moins fréquent, moins direct)


L’activation de modules comportementaux avancés dans d’autres blocs (à venir)


BLOC 6 — Défis comportementaux : déclenchement, engagement, suivi
Proposer à l’utilisatrice de s’engager dans des micro-défis personnels, liés à son rythme, déclenchés en fonction de sa régularité ou de ses besoins comportementaux
Permettre un recentrage doux ou une consolidation d’habitude sans logique de performance ni de compétition
Créer une interface d’engagement volontaire, jamais imposé
VUE UTILISATRICE
1. Déclenchement implicite ou explicite
Un challenge peut être proposé dans deux cas :


Contexte
Message affiché
Bonne dynamique régulière
“Tu sembles prête à relever un petit défi. Envie de t’y engager ?”
Déstabilisation comportementale
“Et si on reprenait en douceur ? 3 repas à ton rythme pour te recentrer ?”

L’utilisateur est toujours libre de refuser


Affichage d’un défi accepté
Si le challenge est accepté :


Une carte s’affiche : “Défi en cours : Jour 3/7 – Tu tiens ton engagement”


Un bouton “Voir défi” redirige vers /defis.js


Le défi se suit de manière dynamique  
3. Ton du défi proposé
Toujours sobre, encourageant, jamais challengeant au sens compétitif


VUE COMPORTEMENTALE / LOGIQUE TECHNIQUE
Déclencheurs possibles d’un challenge :


Régularité maintenue ≥ 10 jours


constance_active = true


Dérive comportementale (écarts répétés, satiété non respectée, extras hors cadre)


Si conditions remplies :


déclencheur_de_challenge = true activé


Une carte peut s’afficher avec bouton “Accepter” ou “Refuser”


Si accepté :


challenge_active = true


Démarrage du suivi dans /defis.js


Enregistrement du progrès dans challenge_progress


Suivi du défi :


À chaque repas saisi :


Si plan respecté, règle respectée, satiété respectée → progression +1


Sinon : pas de recul, pas de sanction


challenge_progress mis à jour automatiquement


Fin du défi :


Si durée atteinte : message final :

 “Tu as mené ton défi jusqu’au bout. Ce que tu poses là, tu peux le faire tenir.”


scoring, trophée, animation


représentation visuelle lorsque défi réalisé sur une longue période >5 jours obligatoire


effet de badge ou de gratification quand pourcentage très favorivake a l objectif et un défi actif en cours 

BLOC 7 — “Ton pourquoi” (goal personnel) & rappel contextuel adapté à l’humeur
Rappeler ponctuellement à l’utilisatrice la raison profonde de son engagement, appelée “ton goal”
Ce rappel se fait uniquement dans des contextes spécifiques, avec un ton personnalisé en fonction de l’humeur détectée
L’objectif est de reconnecter doucement au sens, sans pression ni jugement
VUE UTILISATRICE
1. “Ton goal” = pourquoi personnel défini dans le profil
Ce “goal” est formulé par l’utilisatrice dans sa page de profil


Il n’est pas affiché en permanence


Il peut être reformulé à tout moment dans les préférences


2. Slide-up doux proposé dans certains contextes
Exemple :

 “Oublie pas ton goal.”

 [Oui, relire] — [Non, plus tard]


Si l’utilisatrice clique sur “Oui, relire” :


Son “goal” s’affiche


Elle peut relire, ou le reformuler


Si “Non, plus tard” :


Plus de rappel pendant 24 h


3. Rappel du goal = déclencheur contextuel intelligent
Affiché seulement :


après un écart notable (extra hors quota, repas non aligné)


ou après 2 jours sans saisie


Ne peut apparaître qu’une fois par jour, jamais deux jours de suite


Désactivable dans les préférences


VUE COMPORTEMENTALE / LOGIQUE
Goal” stocké dans la table utilisateur, modifiable à tout moment


Slide-up déclenché si :


repas_non_aligné = true


ou days_without_entry ≥ 2


Conditions strictes :


Maximum 1 fois / jour


Jamais deux jours consécutifs


Rappel désactivable


Si humeur détectée (via mood_today) :


Message affiché correspond au ton associé


Interaction enregistrée :


Si l’utilisatrice clique “Oui, relire” → lecture validée


Si “Non, plus tard” → suppression du rappel pour 24 h


Variable goal_recalled = true/false peut être stockée


Cette relance ne modifie aucune autre donnée mais peut influencer :


Le ton d’un message post-repas


Le déclenchement ou non d’un challenge


Le ciblage du message d’ancrage hebdomadaire


BLOC 8 — Messages dynamiques & relances intelligentes

INTENTION DU BLOC 
Offrir à l’utilisatrice des rappels, ajustements ou propositions qui tiennent compte de son comportement réel
Aider à éviter les dérives invisibles, sans jamais imposer une relance
Utiliser des messages contextuels, finement calibrés selon les données collectées, avec un ton neutre et responsabilisant


VUE UTILISATRICE
L’utilisatrice peut voir apparaître ponctuellement des messages comportementaux ou de recentrage :
1. Message si extras hors quota (>3/semaine)
Exemple :

 “Tu sais que plus on s’éloigne sans le voir, plus c’est difficile de revenir.

 Mais toi, tu as une base. Relis-la.”


Ce message n’est pas systématique, n’apparaît qu’en cas de dépassement régulier


2. Message si score hebdomadaire < 50 %
Exemple :

 “Ne baisse pas les bras. Tu es toujours dans la course.

 Si tu continues à ce rythme, tu pourrais perdre XX kg d’ici [date calculée].

 Relire ton moteur ?”


Ce message ne propose jamais de sanction, mais une reconnexion douce


3. Slide-up motivant (lié à la dynamique hebdomadaire)
Proposé uniquement si la dynamique glisse ou ralentit


Ton : direct mais respectueux :

 “Tu avances à ton rythme. Mais n’oublie pas pourquoi tu es là.”


4. Jamais de message répété ou imposé
Chaque message ne s’affiche qu’une seule fois dans une fenêtre donnée


Aucun spam comportemental


Aucun rappel si la précédente suggestion n’a pas été acceptée

VUE COMPORTEMENTALE / LOGIQUE TECHNIQUE
1. Conditions de déclenchement (exemples confirmés)


Déclencheur identifié
Message / relance possible
extras_logged_week > 3
Message “Tu t’es éloignée. Mais tu as une base”
score_hebdo < 50
Message de réassurance et projection
goal_recalled = false + score faible
Slide-up “Tu veux relire ton moteur ?”
mood = fragile + écart constaté
Message responsabilisant adapté à l’humeur

Fréquence et logique d’apparition
Un seul message dynamique actif à la fois


Chaque message est lié à une condition stricte (jamais aléatoire)


Aucun message ne se répète automatiquement


Tous les messages peuvent être désactivés dans les préférences


3. Impacts potentiels (comportemental uniquement)
Influence la relance du goal


Influence la proposition ou non d’un challenge


Influence l’affichage ou non de la barre de stabilité


Ces messages n’impactent jamais les scores ou la base de données centrale

 → Ils servent uniquement à guider l’autodétermination


STRUCTURE DE CLASSEMENT DES FEEDBACKS
Chaque message est classé selon :
Type (immédiat / synthétique / palier / relance / ancrage)


Moment d’apparition


Page ou bloc déclencheur


Condition de déclenchement


Effet attendu (visible ou logique)



1. FEEDBACK IMMÉDIAT (post-repas)
Exemple :
“Tu t’es écoutée, ton corps s’en souvient.”
“Ce n’était pas une vraie faim. Observe ce que tu ressens maintenant.”
Vue utilisatrice :
S’affiche immédiatement après la saisie d’un repas


Dépend du champ “Satiété respectée ?” ou “Pourquoi j’ai mangé ?”


Ton doux, factuel, neutre


Logique comportementale :
Déclenché si réponse = “satiété respectée” ou “pas de faim”


Aucun stockage visible, mais peut déclencher feedback_jour = true


Bloc source : Bloc 2 / Page : /suivi.js

2. FEEDBACK SYNTHÉTIQUE QUOTIDIEN
Exemple :
“Tu as respecté 3 repas sur 4, en cohérence avec ton plan.”
“Tu as suivi ta faim et évité les extras. Cette journée t’ancre.”
Vue utilisatrice :
Message unique de fin de journée


Affiché si ≥ 1 repas rempli


Logique comportementale :
Calculé à partir de 3 indicateurs :

  • plan respecté

  • satiété

  • règles comportementales


Bloc source : Bloc 3 / Page : /suivi.js

3. FEEDBACK HEBDOMADAIRE (score %)
Exemple :
“Tu avances avec rigueur.”
“Tu peux te réaligner sans pression.”
“Tu sais comment faire.”
Vue utilisatrice :
Affiché en fin de semaine


Lié à un % (score hebdo alignement)


Logique comportementale :
Calcule (repas alignés / repas saisis) × 100


Message associé à un palier


Bloc source : Bloc 3 / Page : /suivi.js

4. MESSAGES DE PALIER (Barre de stabilité)
Exemple :
“Ta zone de stabilité commence à se dessiner.”
“Ta régularité s’est inscrite dans le temps.”
“Ta zone s’est réduite…”
Vue utilisatrice :
S’affiche à des paliers uniques de progression


Visible uniquement si la barre est activée


Logique comportementale :
Message conditionné à zone_stabilite[]


Seuils : 10j, 25 %, 50 %, 75 %, 80 %


Régression possible : <10 jours = grisé, <20 jours = -10 %


Bloc source : Bloc 4 / Page : /suivi.js

5. MESSAGE D’ANCRAGE PROFOND (Marque de constance)
Exemple :
“Tu as installé une régularité profonde. Elle fait partie de toi maintenant.”
Vue utilisatrice :
S’affiche une seule fois


N’est pas relancé


Logique comportementale :
Condition : régularité > 75 % sur 4 semaines


Déclenche constance_active = true


Bloc source : Bloc 5 / Page : /suivi.js
