import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DeclarerExtra = () => {
    const [extra, setExtra] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!extra || !description) {
            setError('Tous les champs sont requis.');
            return;
        }

        const { data, error: insertError } = await supabase
            .from('extras')
            .insert([{ name: extra, description }]);

        if (insertError) {
            setError('Erreur lors de la déclaration de l\'extra.');
        } else {
            setSuccess('Extra déclaré avec succès !');
            setExtra('');
            setDescription('');
        }
    };

    return (
        <div>
            <h1>Déclarer un Extra</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="extra">Nom de l'extra:</label>
                    <input
                        type="text"
                        id="extra"
                        value={extra}
                        onChange={(e) => setExtra(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">Déclarer</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
};

export default DeclarerExtra;