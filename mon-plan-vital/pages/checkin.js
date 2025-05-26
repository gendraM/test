import React, { useState } from 'react';

const CheckIn = () => {
    const [mood, setMood] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle mood submission (e.g., save to database)
        setSubmitted(true);
    };

    return (
        <div>
            <h1>Humeur du jour</h1>
            {submitted ? (
                <p>Merci d'avoir partagé votre humeur !</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>
                        Comment vous sentez-vous aujourd'hui ?
                        <input
                            type="text"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Soumettre</button>
                </form>
            )}
        </div>
    );
};

export default CheckIn;