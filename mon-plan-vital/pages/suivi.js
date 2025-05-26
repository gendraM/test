import RepasBloc from "../components/workspaces/test/mon-plan-vital/components/RepasBloc";
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';

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
};

export default function Suivi() {
  const [repasPlan, setRepasPlan] = useState({});
  const [repasSemaine, setRepasSemaine] = useState([]);
  const [extrasRestants, setExtrasRestants] = useState(3);
  const [scoreJournalier, setScoreJournalier] = useState(0);
  const [scoreHebdomadaire, setScoreHebdomadaire] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });

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
  }, []);

  // --- Fonctions de récupération de données SANS user_id ---
  const fetchRepasPlan = async () => {
    const { data, error } = await supabase
      .from('plan_alimentaire')
      .select('*')
      .eq('date', new Date().toISOString().slice(0, 10));

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
    const today = new Date().toISOString().slice(0, 10);
    const repasDuJour = repasSemaine.filter((repas) => repas.date === today);
    const repasAlignes = repasDuJour.filter((repas) => repas.regle_respectee).length;
    const totalRepas = repasDuJour.length;
    setScoreJournalier(Math.round((repasAlignes / (totalRepas || 1)) * 100));

    const repasAlignesHebdo = repasSemaine.filter((repas) => repas.regle_respectee).length;
    setScoreHebdomadaire(Math.round((repasAlignesHebdo / 28) * 100));
  };

  const handleSaveRepas = async (data) => {
    const { error } = await supabase.from('repas_reels').insert([data]);
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

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
      }}>
        <span
          style={{
            background: extrasRestants > 0 ? "#4caf50" : "#f44336",
            color: "#fff",
            borderRadius: 12,
            padding: "4px 12px",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 1,
          }}
        >
          Extras restants cette semaine : {extrasRestants}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>Chargement en cours…</div>
        </div>
      ) : (
        <>
          {["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"].map((type) => (
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
                date={new Date().toISOString().slice(0, 10)}
                planCategorie={repasPlan[type]?.categorie}
                extrasRestants={extrasRestants}
                onSave={handleSaveRepas}
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