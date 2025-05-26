import React, { useState } from 'react';

const SaisieRepas = () => {
    const [repas, setRepas] = useState('');
    const [quantite, setQuantite] = useState('');
    const [erreur, setErreur] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!repas || !quantite) {
            setErreur('Veuillez remplir tous les champs.');
            return;
        }
        // Logique pour soumettre les données du repas
        console.log(`Repas: ${repas}, Quantité: ${quantite}`);
        setRepas('');
        setQuantite('');
        setErreur('');
    };

    return (
        <div>
            <h2>Saisie de Repas</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="repas">Nom du repas:</label>
                    <input
                        type="text"
                        id="repas"
                        value={repas}
                        onChange={(e) => setRepas(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="quantite">Quantité:</label>
                    <input
                        type="number"
                        id="quantite"
                        value={quantite}
                        onChange={(e) => setQuantite(e.target.value)}
                    />
                </div>
                {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
                <button type="submit">Ajouter Repas</button>
            </form>
        </div>
    );
};

export default SaisieRepas;