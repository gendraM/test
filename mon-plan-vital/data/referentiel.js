const referentielAliments = [
  // Féculents
  { 
    nom: "Pain complet", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 250, 
    portionMax: "50-80g", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain de mie complet", "Céréales muesli"] 
  },
  { 
    nom: "Riz basmati", 
    categorie: "féculent", 
    sousCategorie: "Pâtes/Riz", 
    kcal: 350, 
    portionMax: "2 CS Bombées", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Quinoa", "Couscous"] 
  },
  { 
    nom: "Croissant", 
    categorie: "féculent", 
    sousCategorie: "Viennoiseries", 
    kcal: 400, 
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Céréales muesli"] 
  },
  { 
    nom: "Céréales muesli", 
    categorie: "féculent", 
    sousCategorie: "Céréales petit-déjeuner", 
    kcal: 300, 
    portionMax: "40g", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Flocons d'avoine"] 
  },
  { 
    nom: "Biscuits digestifs", 
    categorie: "féculent", 
    sousCategorie: "Biscuits/gâteaux", 
    kcal: 450, 
    portionMax: "2 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits frais", "Amandes"] 
  },

  // Protéines
  { 
    nom: "Poulet grillé", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 200, 
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Tofu", "Poisson"] 
  },
  { 
    nom: "Saumon fumé", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 180, 
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poulet grillé", "Tofu"] 
  },

  // Légumes
  { 
    nom: "Haricots verts", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 30, 
    portionMax: "100-150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes cuites", "Poêlée de légumes"] 
  },
  { 
    nom: "Carottes râpées", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 40, 
    portionMax: "3,5 CS Bombées", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Betteraves râpées", "Salade verte"] 
  },

  // Fruits
  { 
    nom: "Banane", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 90, 
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pomme", "Poire"] 
  },

  // Extras
  { 
    nom: "Chocolat noir", 
    categorie: "extra", 
    sousCategorie: "Confiseries", 
    kcal: 500, 
    portionMax: "20g", 
    typeRepas: "Collation", 
    moment: "Soir", 
    alternatives: ["Fruits secs", "Amandes"] 
  },
];

export default referentielAliments;