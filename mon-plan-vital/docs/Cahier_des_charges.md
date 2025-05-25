CAHIER DES CHARGES – Application
mobile de suivi alimentaire
personnalisée
Nom de travail : Mon Plan Vital
Version : V1
Date : 22/05/2025
Créatrice : Gendra
Réalisé avec : ChatGPT – version supervisée et validée

1. Objectif de l’application
Offrir une application mobile personnalisée, conçue comme un accompagnement
nutritionnel intelligent et bienveillant, pour :
● Suivre un plan alimentaire fixe, structuré mensuellement
● Saisir facilement les repas réellement consommés
● Gérer un quota d’extras avec des règles précises
● Réceptionner des alertes intelligentes et adaptées à l’état émotionnel
● Se reconnecter à sa faim réelle et à sa satiété
● Projeter sa perte de poids théorique selon ses efforts
● Rester motivée grâce à un système de badges, score, messages personnalisés
● Progresser vers une autonomie totale, sans dépendance à l’application

2. Plateforme technique

● Webapp mobile-first (PWA)
● Utilisable sans téléchargement via un lien
● Hébergement gratuit sur Firebase ou Vercel
● Exportable en Flutter ou React Native si besoin
● Stockage local ou Firebase pour données utilisateurs

3. Structure fonctionnelle – Navigation et modules
3.1 Accueil
● Affichage du jour en cours
● Repas planifiés + bouton “ce que j’ai mangé”
● Jauge d’extras (semaine/mois/année)
● Score de progression
● Poids potentiel théorique perdu
● Mini-message personnalisé selon humeur
● Si challenge actif → progression affichée

3.2 Suivi journalier
● Pour chaque moment de la journée : petit-déj, déjeuner, dîner, collation
● Affichage du plan prévu
● Champ de saisie libre de ce qui a été réellement mangé
● Question “Pourquoi as-tu mangé ?” avec choix :
○ J’avais faim

○ J’avais pas faim, juste envie
○ Trop faim, j’ai mangé vite
○ Plus faim, mais j’ai continué
● Résumé de fin de journée : repas saisis ? quota respecté ? bonus ?
● Graphique hebdo : % de repas alignés avec la faim réelle

3.3 Extras
● Catégorisation précise : pâtisseries, bonbons, fast food, etc.
● Règles paramétrées (fréquence, quantité, conditions)
● Saisie rapide d’un extra avec son type
● Alerte si quota atteint ou règle non respectée
● Suggestion d’alternative (“aliment booster”)
● Si extra évité : “gain” théorique affiché
● Si extra consommé : message informatif + solution douce

3.4 Check-in émotionnel
● Bouton accessible depuis accueil ou chaque repas
● 3 humeurs :
○ En forme (→ messages dynamiques, défi possible)
○ Bof (→ messages doux, focus sur le maintien)
○ Tentée / fragile (→ messages de recentrage, “tu gères”)
● L’app adapte ses couleurs, messages, rythme en conséquence
● Possibilité de ne rien sélectionner → ton neutre

3.5 Challenges
● L’app propose un challenge adapté (si l’utilisateur est dans une bonne dynamique)
● L’utilisateur peut refuser ou accepter
● Section “Mes défis” pour les choisir volontairement
● Création possible de ses propres challenges
● Suivi d’avancement affiché sur accueil
● Récompense : badge, message, score

3.6 Système de récompenses
● Score quotidien + score de constance
● Badges visuels à débloquer
● Messages boostants (ton : humour, coach, tendresse)
● Confettis visuels lors d’un objectif atteint
● Ton jamais culpabilisant : toujours orienté “tu peux y arriver”

3.7 Métabolisme et calories
● Module à remplir au départ :
○ Taille, poids, âge, activité physique, objectif
● Calcul du métabolisme de base (MB) via Mifflin-St Jeor
● Calcul des besoins journaliers
● Affichage objectif calorique conseillé
● Chaque aliment saisi → calories enregistrées

● Projection pondérale basée sur 7700 kcal ≈ 1 kg
● Poids réel vs poids théorique (si aucun extra) affichés

3.8 Référentiel alimentaire
● Création manuelle d’aliments ou plats perso
● Champ nom / quantité / calories / catégorie
● Sauvegarde automatique
● Réutilisation facilitée à chaque repas
● Pas d’API en V1 (option pour V2)

3.9 Zone “Pause mentale”
● Accessible à tout moment
● Propose :
○ Respiration guidée 1 min
○ Mini-message de recentrage
○ Option : “Relire mon pourquoi”
● Objectif : éviter les réactions impulsives, se reconnecter au corps

3.10 “Mon pourquoi”
● Saisie libre dès l’onboarding
● Visible sur l’écran d’accueil ou cliquable à la demande
● Rappel visuel discret mais présent

● Aide à réactiver la motivation personnelle en cas de doute

4. Design / UX
● Design épuré, mobile-first
● Thèmes émotionnels activables automatiquement ou manuellement :
○ Feu : dynamique, couleur chaude
○ Eau : calme, bleus doux
○ Terre : rassurant, couleurs naturelles
● Interface lisible à une main
● Mode clair / sombre

5. Données et sécurité
● Aucune donnée médicale sensible
● Données stockées localement ou Firebase
● Export des repas, progrès et projection possible en PDF / Excel

6. Contraintes et ambitions
● V1 = stable, légère, personnalisée
● Évite la surcharge cognitive
● Oriente vers l’autonomie alimentaire
● Doit donner envie d’être quittée... parce qu’on se suffit à soi-même