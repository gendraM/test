import React, { useState } from "react";

export default function FeedbackSynthétique({ repasReels = [], extrasRestants = 3, routineCount = 0, userName = "Utilisateur" }) {
  // États locaux
  const [suggestionsAcceptees, setSuggestionsAcceptees] = useState([]); // Suivi des suggestions acceptées

  // Calculer le nombre de repas respectés
  const repasRespectes = repasReels.filter(r => r.satiete === "oui").length;
  const totalRepas = repasReels.length;
  const scoreEquilibre = Math.round((repasRespectes / (totalRepas || 1)) * 100);

  // Générer le message principal
  const messageSynthese = totalRepas === 0
    ? `Aucun repas saisi aujourd’hui. Pense à enregistrer vos repas pour suivre vos progrès.`
    : `Bravo ${userName} ! Tu as respecté ${repasRespectes} repas sur ${totalRepas} aujourd’hui (${scoreEquilibre}% d'équilibre).`;

  // Suggestions d'amélioration
  const suggestions = [];
  if (extrasRestants <= 0) suggestions.push("🚫 Essayez de limiter les extras demain.");
  if (scoreEquilibre < 75) suggestions.push("🥦 Ajoutez plus de légumes ou de protéines pour équilibrer vos repas.");

  // Objectif motivant
  const objectifMotivant = "Pour le prochain repas, essayez de respecter votre satiété et d'ajouter une portion de légumes.";

  // Gérer l'acceptation des suggestions
  const handleSuggestionChange = (index, isChecked) => {
    setSuggestionsAcceptees(prev => {
      const updated = [...prev];
      if (isChecked) {
        updated.push(index);
      } else {
        const suggestionIndex = updated.indexOf(index);
        if (suggestionIndex > -1) updated.splice(suggestionIndex, 1);
      }
      return updated;
    });
  };

  return (
    <div style={{ background: "#e8f5e9", borderRadius: 12, padding: 16, marginTop: 24, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      {/* Titre */}
      <h3 style={{ color: "#388e3c", fontSize: "18px", fontWeight: "bold", marginBottom: 8 }}>Feedback du jour</h3>

      {/* Message principal */}
      <p style={{ fontSize: "16px", color: "#555", marginBottom: 12 }}>{messageSynthese}</p>

      {/* Suggestions d'amélioration */}
      {suggestions.length > 0 && (
        <div>
          <h4 style={{ fontSize: "16px", color: "#555", marginBottom: 8 }}>Suggestions pour s'améliorer :</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{ fontSize: "14px", color: "#888", marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    style={{ marginRight: 8 }}
                    checked={suggestionsAcceptees.includes(index)}
                    onChange={(e) => handleSuggestionChange(index, e.target.checked)}
                  />
                  {suggestion}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Objectif motivant */}
      <p style={{ fontSize: "16px", color: "#1976d2", fontWeight: "bold", marginTop: 16 }}>{objectifMotivant}</p>

      {/* Barre de progression */}
      <div style={{ background: "#f0f0f0", borderRadius: "8px", overflow: "hidden", marginTop: "16px" }}>
        <div style={{ width: `${scoreEquilibre}%`, background: "#388e3c", height: "16px", transition: "width 0.3s ease" }} />
      </div>
      <p style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>{scoreEquilibre}% des repas respectés aujourd’hui.</p>

      {/* Badge de récompense */}
      {scoreEquilibre === 100 && (
        <div style={{ background: "#ffd700", color: "#000", padding: "8px", borderRadius: "8px", marginTop: "16px" }}>
          🏆 Félicitations ! Vous avez respecté tous vos repas aujourd’hui !
        </div>
      )}

      {/* Bouton "Accepter un défi" */}
      <button
        style={{
          background: "#e1f5fe",
          color: "#1976d2",
          border: "1px solid #1976d2",
          borderRadius: "8px",
          padding: "10px 16px",
          cursor: "pointer",
          marginTop: "16px"
        }}
        onClick={() => alert("Défi accepté ! Bonne chance !")}
      >
        Accepter un défi
      </button>

      {/* Bouton "Voir mes progrès" */}
      <button
        style={{
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 16px",
          cursor: "pointer",
          marginTop: "16px",
          marginLeft: "8px"
        }}
        onClick={() => alert("Redirection vers la page de progression (à développer).")}
      >
        Voir mes progrès
      </button>
    </div>
  );
}