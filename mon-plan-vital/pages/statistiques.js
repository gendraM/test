import React from 'react';

const Statistiques = () => {
    // Exemple de données de statistiques
    const statistiquesData = {
        caloriesConsommees: 1500,
        caloriesDepensees: 2000,
        repasSains: 5,
        repasTotal: 7,
        defisCompletes: 3,
        defisTotal: 5,
    };

    return (
        <div>
            <h1>Tableau de Bord Personnel</h1>
            <div>
                <h2>Statistiques du Jour</h2>
                <p>Calories Consommées: {statistiquesData.caloriesConsommees}</p>
                <p>Calories Dépensées: {statistiquesData.caloriesDepensees}</p>
                <p>Repas Sains: {statistiquesData.repasSains} / {statistiquesData.repasTotal}</p>
                <p>Défis Complétés: {statistiquesData.defisCompletes} / {statistiquesData.defisTotal}</p>
            </div>
        </div>
    );
};

export default Statistiques;