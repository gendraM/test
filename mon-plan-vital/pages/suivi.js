import RepasBloc from "../components/workspaces/test/mon-plan-vital/components/RepasBloc";
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Snackbar({ open, message, type = "info", onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: type === "error" ? "#f44336" : "#4caf50",
        color: "#fff",
        padding: "12px 32px",
        borderRadius: 32,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontWeight: 500,
        fontSize: 16,
        minWidth: 180,
        textAlign: "center",
      }}
      onClick={onClose}
      tabIndex={0}
      aria-live="polite"
    >
      {message}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "#4caf50" }) {
  return (
    <div style={{ background: "#e0e0e0", borderRadius: 8, height: 16, width: "100%" }}>
      <div
        style={{
          width: `${Math.min(value, max)}%`,
          height: "100%",
          background: color,
          borderRadius: 8,
          transition: "width 0.5s",
        }}
      ></div>
    </div>
  );
}

const repasIcons = {
  "Petit-déjeuner": "🥐",
  "Déjeuner": "🍽️",
  "Collation": "🍏",
  "Dîner": "🍲",
  "Autre": "🍴",
};

export default function Suivi() {
  const [repasPlan, setRepasPlan] = useState({});
  const [repasSemaine, setRepasSemaine] = useState([]);
  const [extrasRestants, setExtrasRestants] = useState(3);
  const [scoreJournalier, setScoreJournalier] = useState(0);
  const [scoreHebdomadaire, setScoreHebdomadaire] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Date sélectionnée
  const [aliment, setAliment] = useState(''); // Aliment saisi
  const [suggestions, setSuggestions] = useState([]); // Suggestions d'aliments
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Chargement des suggestions

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const plan = await fetchRepasPlan();
      const semaine = await fetchRepasSemaine();
      setRepasPlan(plan);
      setRepasSemaine(semaine);
      setExtrasRestants(3 - calculerExtrasConsommes(semaine));
      calculerScores(semaine);
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  const fetchRepasPlan = async () => {
    const { data, error } = await supabase
      .from('plan_alimentaire')
      .select('*')
      .eq('date', selectedDate); // Utilisation de la date sélectionnée

    if (error) {
      setSnackbar({ open: true, message: "Erreur lors de la récupération des repas prévus.", type: "error" });
      return {};
    }

    const plan = {};
    data.forEach((repas) => {
      plan[repas.type] = { aliment: repas.aliment, categorie: repas.categorie };
    });
    return plan;
  };

  const fetchRepasSemaine = async () => {
    const { data, error } = await supabase
      .from('repas_reels')
      .select('*')
      .gte('date', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10));

    if (error) {
      setSnackbar({ open: true, message: "Erreur lors de la récupération des repas réels.", type: "error" });
      return [];
    }
    return data;
  };

  const calculerExtrasConsommes = (repasSemaine) =>
    repasSemaine.filter((repas) => repas.est_extra).length;

  const calculerScores = (repasSemaine) => {
    const repasDuJour = repasSemaine.filter((repas) => repas.date === selectedDate); // Utilisation de la date sélectionnée
    const repasAlignes = repasDuJour.filter((repas) => repas.regle_respectee).length;
    const totalRepas = repasDuJour.length;
    setScoreJournalier(Math.round((repasAlignes / (totalRepas || 1)) * 100));

    const repasAlignesHebdo = repasSemaine.filter((repas) => repas.regle_respectee).length;
    setScoreHebdomadaire(Math.round((repasAlignesHebdo / 28) * 100));
  };

  // Fonction pour enregistrer un repas
  const handleSaveRepas = async (data) => {
    const { error } = await supabase.from('repas_reels').insert([{ ...data, date: selectedDate }]); // Enregistrement avec la date sélectionnée
    if (error) {
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du repas.", type: "error" });
    } else {
      setSnackbar({ open: true, message: "Repas enregistré avec succès !", type: "success" });
      setLoading(true);
      const updatedRepasSemaine = await fetchRepasSemaine();
      setRepasSemaine(updatedRepasSemaine);
      setExtrasRestants(3 - calculerExtrasConsommes(updatedRepasSemaine));
      calculerScores(updatedRepasSemaine);
      setLoading(false);
    }
  };

  // Recherche dynamique via Open Food Facts
  useEffect(() => {
    if (aliment) {
      setLoadingSuggestions(true);
      axios
        .get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(aliment)}&search_simple=1&action=process&json=1&page_size=5`)
        .then((res) => {
          const produits = res.data.products || [];
          const suggestions = produits.map((p) => ({
            nom: p.product_name || "Aliment inconnu",
            categorie: p.categories_tags?.[0] || "non catégorisé",
            kcal: p.nutriments?.["energy-kcal_100g"] || 0,
          }));
          setSuggestions(suggestions);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    } else {
      setSuggestions([]);
    }
  }, [aliment]);

  return (
    <div style={{
      maxWidth: 700,
      margin: "0 auto",
      padding: "24px 8px 64px",
      fontFamily: "system-ui, Arial, sans-serif"
    }}>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>
        🥗 Suivi alimentaire du jour
      </h1>

      {/* Sélecteur de date */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <label htmlFor="date-select" style={{ fontWeight: 600, marginRight: 8 }}>Sélectionnez une date :</label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Recherche d'aliments */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="aliment-input" style={{ fontWeight: 600, marginRight: 8 }}>Rechercher un aliment :</label>
        <input
          id="aliment-input"
          type="text"
          value={aliment}
          onChange={(e) => setAliment(e.target.value)}
          placeholder="Saisissez un aliment"
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        {loadingSuggestions && <div>Recherche en cours...</div>}
        {suggestions.length > 0 && (
          <ul style={{ background: "#f9f9f9", border: "1px solid #ccc", borderRadius: 8, padding: 8, marginTop: 4 }}>
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => {
                  setAliment(s.nom);
                  setSnackbar({ open: true, message: `Aliment sélectionné : ${s.nom}`, type: "success" });
                }}
                style={{ cursor: "pointer", padding: 4 }}
              >
                {s.nom} - {s.kcal} kcal
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>Chargement en cours…</div>
        </div>
      ) : (
        <>
          {["Petit-déjeuner", "Déjeuner", "Collation", "Dîner", "Autre"].map((type) => (
            <div
              key={type}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                padding: 20,
                marginBottom: 24,
                borderLeft: `6px solid ${{
                  "Petit-déjeuner": "#ffa726",
                  "Déjeuner": "#29b6f6",
                  "Collation": "#66bb6a",
                  "Dîner": "#ab47bc",
                  "Autre": "#ff7043",
                }[type]}`,
                transition: "box-shadow 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{repasIcons[type]}</span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{type}</span>
              </div>
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 6,
                  color: "#333",
                  fontSize: 15,
                }}
              >
                <strong>Repas prévu :</strong>{" "}
                {repasPlan[type]?.aliment ? (
                  <>
                    {repasPlan[type]?.aliment}{" "}
                    <span style={{
                      background: "#eee", borderRadius: 8, padding: "2px 8px", marginLeft: 4,
                      fontSize: 13, color: "#888"
                    }}>
                      {repasPlan[type]?.categorie}
                    </span>
                  </>
                ) : (
                  <span style={{ color: "#bbb" }}>Non défini</span>
                )}
              </div>
              <RepasBloc
                type={type}
                date={selectedDate} // Utilisation de la date sélectionnée
                planCategorie={repasPlan[type]?.categorie}
                extrasRestants={extrasRestants}
                onSave={handleSaveRepas} // Correction : Fonction définie
              />
            </div>
          ))}

          <div style={{
            marginTop: 24,
            background: "#fafafa",
            borderRadius: 12,
            padding: "20px 16px",
            boxShadow: "0 1px 5px rgba(0,0,0,0.03)"
          }}>
            <h2 style={{ margin: "0 0 16px 0" }}>Mes scores</h2>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>Score journalier : </span>
              <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>{scoreJournalier}%</span>
              <ProgressBar value={scoreJournalier} color="#1976d2" />
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Score hebdomadaire : </span>
              <span style={{ fontWeight: 700, color: "#43a047", fontSize: 18 }}>{scoreHebdomadaire}%</span>
              <ProgressBar value={scoreHebdomadaire} color="#43a047" />
            </div>
          </div>
        </>
      )}

      <div style={{
        marginTop: 36,
        fontSize: 13,
        color: "#888",
        textAlign: "center"
      }}>
        <span>Astuce : Cliquez sur un repas pour saisir ce que vous avez mangé.<br />Les extras sont limités à 3 par semaine, utilisez-les à bon escient !</span>
      </div>
    </div>
  );
}