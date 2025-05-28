# Mon Plan Vital

## Description
Mon Plan Vital est une application dédiée à la gestion de la santé et du bien-être. Elle permet aux utilisateurs de suivre leur alimentation, de gérer leur profil personnel, et d'accéder à divers outils pour améliorer leur qualité de vie.

## Fonctionnalités
- **Page d'accueil** : Présente un aperçu des fonctionnalités de l'application.
- **Profil utilisateur** : Permet aux utilisateurs de saisir et de modifier leurs informations personnelles telles que la taille et le poids.
- **Suivi des repas** : Affiche les repas du jour et permet de suivre l'alimentation.
- **Synthèse des extras** : Présente un récapitulatif des extras déclarés par l'utilisateur.
- **Déclaration d'extras** : Permet aux utilisateurs de déclarer des extras via un formulaire.
- **Règles d'usage** : Fournit des informations sur les règles et les bonnes pratiques d'utilisation de l'application.
- **Tableau de bord personnel** : Affiche des statistiques et des analyses sur les habitudes alimentaires.
- **Humeur du jour** : Permet aux utilisateurs de saisir leur humeur quotidienne.
- **Pause mentale** : Propose des exercices de pause mentale guidée.
- **Défis en cours** : Affiche les défis que l'utilisateur a entrepris.
- **Plan alimentaire structuré** : Présente un plan alimentaire personnalisé.

## Structure du projet
```
mon-plan-vital
├── pages
│   ├── index.js
│   ├── profil.js
│   ├── suivi.js
│   ├── extras.js
│   ├── declarer-extra.js
│   ├── regles.js
│   ├── statistiques.js
│   ├── checkin.js
│   ├── pause.js
│   ├── defis.js
│   ├── plan.js
│   └── _app.js
├── components
│   ├── Navigation.js
│   ├── FormulaireProfil.js
│   ├── SaisieRepas.js
│   ├── RecapAlignement.js
│   ├── ScoreBar.js
│   ├── FocusDuMois.js
│   └── (autres à créer)
├── lib
│   └── supabaseClient.js
├── public
│   └── (icônes / logos / images)
├── install.sh
├── vercel.json
├── .gitignore
├── package.json
└── package-lock.json
```

## Installation
Pour installer les dépendances du projet, exécutez le script suivant :

```bash
./install.sh
```

## Déploiement
Le projet est configuré pour être déployé sur Vercel. Assurez-vous que le fichier `vercel.json` est correctement configuré pour vos besoins.

## Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à soumettre des demandes de tirage ou à ouvrir des problèmes pour discuter des améliorations.

## License
Ce projet est sous licence MIT.