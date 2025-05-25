# Synthèse de l’histoire du projet

## 1. Origine, intention et expérience utilisateur

Le projet est né d’une volonté de proposer un accompagnement alimentaire et émotionnel fondé sur la **bienveillance, la personnalisation et l’autonomisation** de l’utilisatrice. Il vise à offrir un outil qui dépasse la simple gestion calorique : il s’agit d’un **compagnon du quotidien**, qui valorise la progression individuelle sans jamais imposer ni juger.

**L’intention centrale** :  
- Soutenir un changement durable en rendant visible les progrès (et non les écarts)
- Faciliter l’auto-observation (alimentation, humeur, pauses, motivations…)
- Proposer un environnement **sûr, doux, sans pression**, où chaque interaction renforce la confiance et l’autonomie
- Mettre l’accent sur l’adaptation aux rythmes et besoins réels, et non sur la performance ou la conformité

**Expérience utilisateur recherchée** :  
- Navigation fluide, modules indépendants mais interconnectés
- Feedbacks positifs, messages d’encouragement, absence de notifications culpabilisantes
- Liberté totale d’utiliser ou non chaque fonctionnalité, aucune action obligatoire
- Valorisation de la constance, de l’écoute de soi, du retour à l’intention profonde (“Mon pourquoi”)
- Statistiques et tableaux de bord conçus comme des espaces de progression, jamais de contrôle

---

## 2. Synthèse des fonctionnalités et logique métier (blocs principaux)

### **Bloc 1 – Accueil**
- Vue synthétique : score quotidien, défi en cours, message boostant, “Mon pourquoi”, accès rapide à tous les modules
- Affichage positif, encouragements, indicateurs non-culpabilisants

### **Bloc 2 – Suivi alimentaire**
- Saisie des repas, possibilité de suivre ou non le plan alimentaire
- Ajout rapide d’aliments (base référentielle ou création à la volée)
- Calcul automatique des calories, comparaison prévu/réel
- Champ “Pourquoi j’ai mangé ?” (facultatif) pour auto-observation
- Feedback empathique, jamais de jugement

### **Bloc 3 – Extras**
- Saisie spécifique des écarts/extras hors plan
- Impact direct sur le score et la projection pondérale, mais ton toujours doux
- Suggestion de pause mentale avant validation d’un extra non recommandé

### **Bloc 4 – Check-in émotionnel**
- Enregistrement de l’humeur quotidienne, impacte suggestions et messages
- Déclenchement de propositions adaptées (défis, pauses, messages boostants)

### **Bloc 5 – Challenges**
- Défis personnalisés ou suggérés selon humeur, progression affichée
- Un seul défi actif à la fois, début/fin clairs
- Récompenses à la réussite (badges, messages, confettis)

### **Bloc 6 – Récompenses**
- Système de score journalier et de constance
- Badges visuels, messages boostants, animations lors de succès
- Jamais de sanction : uniquement valorisation, recentrage doux si besoin

### **Bloc 7 – Métabolisme et calories**
- Calcul MB (Mifflin-St Jeor), TDEE, objectifs personnalisés
- Intégration des apports réels, projection pondérale, visualisation douce des écarts
- Aucune pression sur la perte : l’outil est un guide, jamais un juge

### **Bloc 8 – Référentiel alimentaire**
- Base personnalisée d’aliments et de plats avec portions, calories, fréquence
- Suggestions lors de la saisie, alertes douces si fréquence dépassée
- Extension possible avec API alimentaires, suggestions selon humeur

### **Bloc 9 – Pause mentale**
- Accès à tout moment, séquence de respiration guidée, messages bienveillants
- Historique des pauses (jamais exploité pour juger)
- Possibilité de relire son “Pourquoi” pour se recentrer

### **Bloc 10 – Mon pourquoi**
- Saisie, modification, historique et affichage du “Pourquoi” (intention profonde)
- Présentation comme boussole, jamais comme objectif
- Affichage contextuel (accueil, pause mentale, humeur fragile…)

### **Bloc 11 – Plan alimentaire structuré**
- Création modulable de plans alimentaires (semaine/mois, duplication, adaptation)
- Comparaison alignement prévu/réel, proposition d’évolution du plan selon vécu
- Jamais de contrainte : le plan est un support, pas une règle

### **Bloc 12 – Statistiques & évolution comportementale**
- Tableau de bord centralisé, indicateurs de progression, classements, focus mensuel auto-calculé
- Analyse croisée de toutes les dimensions (alimentation, humeur, pauses, poids, satiété, alignement…)
- Focus mensuel proposé comme suggestion, jamais comme contrainte

---

## 3. Logique transversale et interconnexions

- **Chaque bloc fonctionne de manière indépendante**, mais les données sont croisées pour enrichir l’expérience (ex : humeur → suggestions de défis/pauses/messages, extras → projection pondérale, plan alimentaire → score de constance, etc.).
- Les **feedbacks sont toujours positifs ou recentrants**, jamais culpabilisants ni prescriptifs.
- L’**historique personnel** (pauses, pourquoi, plans, statistiques…) sert à créer une expérience sur-mesure, valorisant l’évolution et l’écoute de soi.
- **Personnalisation forte** : référentiel alimentaire, “Mon pourquoi”, challenges, plan adaptatif, focus statistique… chaque utilisatrice compose son parcours.

---

## 4. Bonnes pratiques, plans d’action, et synthèses intégrées

- Les plans d’action et tableaux synthétiques produits pendant le projet ont servi à :
  - Garantir la conformité stricte à l’intention (aucune fonctionnalité ne contrevient à la philosophie du projet)
  - Croiser toutes les sources pour éviter les pertes de sens ou d’information
  - Maintenir l’équilibre entre flexibilité, autonomie et cohérence du système
- Les itérations successives ont permis d’enrichir la logique métier, d’affiner la granularité des données, de préciser les connexions transversales et de renforcer l’ergonomie (UI/UX)
- Les erreurs des versions précédentes ont été corrigées (ex : sections UI toujours incluses, aucune donnée implicite oubliée, tout ajout validé avec l’intention centrale)

---

## 5. Enjeux majeurs et unicité du projet

- **Accompagnement centré sur l’humain** : l’application n’est pas un coach, mais un compagnon, qui soutient l’auto-évolution sans jamais imposer de standard ni d’objectif extérieur.
- **Analyse systémique** : chaque donnée, chaque interaction, chaque feedback s’inscrit dans un écosystème où tout est lié, mais rien n’est obligatoire.
- **Valorisation du chemin** : progression, constance et retours à soi sont toujours valorisés, les écarts sont simplement observés, jamais jugés.
- **Liberté, sécurité, douceur** : l’utilisatrice garde le contrôle, choisit son rythme, adapte l’outil à sa réalité.

---

## 6. Conclusion

**Le projet propose une expérience alimentaire et émotionnelle unique** :  
- 100 % personnalisée,
- 100 % non-jugeante,
- 100 % évolutive et flexible,
- 100 % tournée vers la valorisation de soi et la progression douce.

Chaque bloc, chaque donnée, chaque composant UI a été conçu pour servir cette intention, dans une logique d’écosystème modulaire et interconnecté.







1. Cohérence UX & expérience utilisateur
Question :
Explique comment la philosophie d’accompagnement bienveillant, non-jugeant et personnalisable infuse l’architecture des différents blocs (suivi alimentaire, challenges, récompenses, pause mentale, plan alimentaire) et en quoi cette posture influence concrètement la logique métier, la gestion des feedbacks et l’interface utilisateur sur l’ensemble du parcours.

2. Gestion transversale de la donnée et des interactions
Question :
Décris comment les données issues des différents blocs (ex : humeur, repas réels, pauses mentales, plan prévu, challenges, récompenses) sont croisées et exploitées pour générer à la fois des feedbacks contextuels, des suggestions personnalisées, et des statistiques pertinentes dans le tableau de bord. Donne un exemple de chaîne de décision ou de déclenchement impliquant au moins trois blocs interconnectés.

3. Approche modulaire et évolutive du plan alimentaire
Question :
Montre en quoi le module “Plan alimentaire structuré” est pensé à la fois comme un guide évolutif (modèles-types, duplication, adaptation) et comme une base de comparaison flexible, jamais contraignante. Comment cette conception se traduit-elle dans la logique de validation des repas, la gestion des écarts, et l’articulation avec les autres outils (statistiques, challenges, récompenses) ?

4. Enjeux de personnalisation et d’autonomisation de l’utilisatrice
Question :
Analyse la manière dont le projet permet à l’utilisatrice de personnaliser son expérience (référentiel alimentaire, “Mon Pourquoi”, création de challenges, choix des feedbacks, visualisation des données), et explique comment cette personnalisation soutient l’autonomisation, la motivation durable et l’appropriation du parcours, tout en préservant la cohérence système.

Ces 4 questions poussent à mobiliser la compréhension globale, la transversalité, la logique métier, l’UX, et l’intention fondamentale du projet.
Elles sont idéales pour tester la prise en main “systémique” du sujet par une IA ou un nouvel intervenant (développeur, PM, UX, etc.).





