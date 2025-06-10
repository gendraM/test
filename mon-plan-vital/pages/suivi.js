import RepasBloc from "../components/workspaces/test/mon-plan-vital/components/RepasBloc";
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';
import { extrasMessages } from "../src/utils/messages";
import Link from 'next/link';

// Utilitaire pour message cyclique (par clé locale)
function pickMessage(array, key) {
  if (!array || array.length === 0) return "";
  let idx = 0;
  if (typeof window !== "undefined" && window.localStorage) {
    idx = Number(localStorage.getItem(key) || 0);
    localStorage.setItem(key, (idx + 1) % array.length);
  }
  const msg = array[idx % array.length];
  return msg;
}

// Utilitaires de date
function isInLast7Days(dateString, refDateString) {
  const now = new Date(refDateString);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  const target = new Date(dateString);
  return target >= sevenDaysAgo && target <= now;
}

// Snackbar
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

// ----------- Composant dynamique Extras ---------
function ExtrasQuotaDisplay({
  extrasHorsQuota = [],
  extrasTotalSemaine = [],
  enReequilibrage = false,
}) {
  let cat = "";
  let buttonLabel = "";
  let buttonAction = null;

  if (enReequilibrage) {
    cat = "retour";
  } else if (extrasTotalSemaine.length === 3) {
    cat = "usedAll";
  } else if (extrasTotalSemaine.length < 3) {
    cat = "savedSome";
  } else if (extrasHorsQuota.length === 1) {
    cat = "plus1";
  } else if (extrasHorsQuota.length === 2) {
    cat = "plus2";
    buttonLabel = "Planifier mes extras";
    buttonAction = () => window.location.href = "/planification-alimentaire";
  } else if (extrasHorsQuota.length >= 3) {
    cat = "plus3";
    buttonLabel = "Commencer un défi";
    buttonAction = () => window.location.href = "/defi-re-equilibrage";
  }

  // Sécurise l'accès à extrasMessages[cat]
  const arr = extrasMessages[cat] || [];
  const message = pickMessage(arr, `msg_${cat}`);

  return (
    <div style={{ margin: "24px 0" }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
        Extras utilisés cette semaine :{" "}
        <span style={{ color: "#e57373", fontSize: 20 }}>
          {Math.min(3, extrasTotalSemaine.length)}/3
        </span>
      </h3>
      {extrasHorsQuota.length > 0 && (
        <div style={{
          marginTop: 12,
          borderRadius: 8,
          padding: "8px 12px",
          background: "#fffbe6",
          border: "1px solid #ffe082",
          color: "#ffa000"
        }}>
          <div style={{ fontWeight: 600 }}>
            🟡 Au-delà du nécessaire
          </div>
          <ul>
            {extrasHorsQuota.map((extra, i) => (
              <li key={i}>
                ↗ {extra.nom || "Extra"} —{" "}
                <span style={{ color: "#aaa" }}>{extra.date?.slice(5, 10)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        marginTop: 10,
        color: "#888",
        background: "#f5f5f5",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 15,
        textAlign: "center"
      }}>
        {message}
      </div>

      {buttonLabel && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            style={{
              background: buttonLabel === "Commencer un défi"
                ? "linear-gradient(90deg,#d32f2f,#ffb300)"
                : "linear-gradient(90deg,#1976d2,#26c6da)",
              color: "#fff",
              border: "none",
              borderRadius: 18,
              padding: "10px 36px",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 2px 10px rgba(38,198,218,0.08)",
              cursor: "pointer"
            }}
            onClick={buttonAction}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Suivi() {
  // ----------- Gestion du repas sélectionné (URL ou bouton) -----------
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const repasParam = params?.get('repas');
  // Map URL -> libellé
  const mapType = {
    'petit-dejeuner': 'Petit-déjeuner',
    'dejeuner': 'Déjeuner',
    'collation': 'Collation',
    'diner': 'Dîner',
    'autre': 'Autre'
  };
  const [selectedType, setSelectedType] = useState(repasParam ? mapType[repasParam] : null);
  // ---------------------------------------------------------------

  const [repasPlan, setRepasPlan] = useState({});
  const [repasSemaine, setRepasSemaine] = useState([]);
  const [extrasRestants, setExtrasRestants] = useState(3);
  const [scoreJournalier, setScoreJournalier] = useState(0);
  const [scoreHebdomadaire, setScoreHebdomadaire] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Extras states
  const [extrasDuJour, setExtrasDuJour] = useState([]);
  const [extrasHorsQuota, setExtrasHorsQuota] = useState([]);
  const [extrasTotalSemaine, setExtrasTotalSemaine] = useState([]);
  const [showProgressionMessage, setShowProgressionMessage] = useState(false);
  const [enReequilibrage, setEnReequilibrage] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const plan = await fetchRepasPlan();
      const semaine = await fetchRepasSemaine();
      setRepasPlan(plan);
      setRepasSemaine(semaine);

      // Extras semaine courante
      const extrasTotal = semaine.filter((repas) => repas.est_extra);
      setExtrasTotalSemaine(extrasTotal);
      const extrasAujourdHui = semaine.filter(
        (repas) => repas.date === selectedDate && repas.est_extra
      );
      setExtrasDuJour(extrasAujourdHui);

      // 7 jours glissants pour affichage "au-delà du nécessaire"
      const extrasHorsQuotaAll = extrasTotal.slice(3);
      const extrasHorsQuota7j = extrasHorsQuotaAll.filter(extra =>
        isInLast7Days(extra.date, selectedDate)
      );
      setExtrasHorsQuota(extrasHorsQuota7j);

      setExtrasRestants(Math.max(0, 3 - extrasTotal.length));

      // Détection retour à l’équilibre (bloc gris)
      const d = new Date(selectedDate);
      const day = d.getDay();
      // Début de semaine = lundi
      const startCurrent = new Date(d);
      startCurrent.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const endCurrent = new Date(startCurrent);
      endCurrent.setDate(startCurrent.getDate() + 6);

      // Semaine précédente
      const startPrev = new Date(startCurrent);
      startPrev.setDate(startCurrent.getDate() - 7);
      const endPrev = new Date(startCurrent);
      endPrev.setDate(startCurrent.getDate() - 1);

      const extrasHorsQuotaPrevWeek = extrasHorsQuotaAll.filter(extra =>
        new Date(extra.date) >= startPrev && new Date(extra.date) <= endPrev
      );
      const extrasHorsQuotaCurrentWeek = extrasHorsQuotaAll.filter(extra =>
        new Date(extra.date) >= startCurrent && new Date(extra.date) <= endCurrent
      );
      const retourEquilibre = extrasHorsQuotaPrevWeek.length > 0 && extrasHorsQuotaCurrentWeek.length === 0 && extrasHorsQuota7j.length > 0;
      setEnReequilibrage(retourEquilibre);

      calculerScores(semaine);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [selectedDate]);

  // Détection du retour à l'équilibre et gestion du message de progression
  useEffect(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const debutSemaineCourante = new Date(d);
    debutSemaineCourante.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const finSemaineCourante = new Date(debutSemaineCourante);
    finSemaineCourante.setDate(debutSemaineCourante.getDate() + 6);

    const debutSemainePrecedente = new Date(debutSemaineCourante);
    debutSemainePrecedente.setDate(debutSemaineCourante.getDate() - 7);
    const finSemainePrecedente = new Date(debutSemaineCourante);
    finSemainePrecedente.setDate(debutSemaineCourante.getDate() - 1);

    // Extras hors quota de chaque semaine
    const extrasHorsQuotaAll = repasSemaine.filter((repas) => repas.est_extra).slice(3);
    const extrasHorsQuotaCourante = extrasHorsQuotaAll.filter(
      (repas) =>
        new Date(repas.date) >= debutSemaineCourante &&
        new Date(repas.date) <= finSemaineCourante
    );
    const extrasHorsQuotaPrecedente = extrasHorsQuotaAll.filter(
      (repas) =>
        new Date(repas.date) >= debutSemainePrecedente &&
        new Date(repas.date) <= finSemainePrecedente
    );
    setShowProgressionMessage(extrasHorsQuotaPrecedente.length > 0 && extrasHorsQuotaCourante.length === 0);
  }, [repasSemaine, selectedDate]);

  const fetchRepasPlan = async () => {
    const { data, error } = await supabase
      .from('plan_alimentaire')
      .select('*')
      .eq('date', selectedDate);

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

  const calculerScores = (repasSemaine) => {
    const repasDuJour = repasSemaine.filter((repas) => repas.date === selectedDate);
    const repasAlignes = repasDuJour.filter((repas) => repas.regle_respectee).length;
    const totalRepas = repasDuJour.length;
    setScoreJournalier(Math.round((repasAlignes / (totalRepas || 1)) * 100));
    const repasAlignesHebdo = repasSemaine.filter((repas) => repas.regle_respectee).length;
    setScoreHebdomadaire(Math.round((repasAlignesHebdo / 28) * 100));
  };

  const handleSaveRepas = async (data) => {
    const { error } = await supabase.from('repas_reels').insert([{ ...data, date: selectedDate }]);
    if (error) {
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du repas.", type: "error" });
    } else {
      setSnackbar({ open: true, message: "Repas enregistré avec succès !", type: "success" });
      setLoading(true);
      const updatedRepasSemaine = await fetchRepasSemaine();
      setRepasSemaine(updatedRepasSemaine);
      setLoading(false);
    }
  };

  // ----------- AFFICHAGE -----------
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
      <h1 style={{
        textAlign: "center",
        marginBottom: 8,
        fontWeight: 800,
        fontSize: 32,
        letterSpacing: "0.5px"
      }}>
        🥗 Suivi alimentaire du jour
      </h1>

      {/* Message de progression retour à l'équilibre */}
      {showProgressionMessage && (
        <div style={{
          background: "linear-gradient(90deg,#e3f6e5,#f5fff7 80%)",
          color: "#357a38",
          borderRadius: 10,
          padding: "16px 20px",
          margin: "0 0 20px 0",
          fontWeight: 700,
          textAlign: "center",
          fontSize: 16,
          boxShadow: "0 2px 16px rgba(76,175,80,0.08)"
        }}>
          La semaine dernière, tu avais franchi ton quota plusieurs fois.<br />
          Cette semaine, tu es revenu(e) à l’essentiel. C’est un vrai pas vers la régularité.
        </div>
      )}

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

      {/* Bloc gestion extras ENRICHI */}
      <ExtrasQuotaDisplay
        extrasHorsQuota={extrasHorsQuota}
        extrasTotalSemaine={extrasTotalSemaine}
        enReequilibrage={enReequilibrage}
      />

      {loading ? (
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>Chargement en cours…</div>
        </div>
      ) : (
        !selectedType ? (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <h2>Quel repas veux-tu consigner ?</h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedType("Petit-déjeuner")}>🥐 Petit-déjeuner</button>
              <button onClick={() => setSelectedType("Déjeuner")}>🍽️ Déjeuner</button>
              <button onClick={() => setSelectedType("Collation")}>🍏 Collation</button>
              <button onClick={() => setSelectedType("Dîner")}>🍲 Dîner</button>
              <button onClick={() => setSelectedType("Autre")}>🍴 Autre</button>
            </div>
          </div>
        ) : (
          <div
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
              }[selectedType]}`,
              transition: "box-shadow 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{repasIcons[selectedType]}</span>
              <span style={{ fontWeight: 600, fontSize: 18 }}>{selectedType}</span>
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
              {repasPlan[selectedType]?.aliment ? (
                <>
                  {repasPlan[selectedType]?.aliment}{" "}
                  <span style={{
                    background: "#eee", borderRadius: 8, padding: "2px 8px", marginLeft: 4,
                    fontSize: 13, color: "#888"
                  }}>
                    {repasPlan[selectedType]?.categorie}
                  </span>
                </>
              ) : (
                <span style={{ color: "#bbb" }}>Non défini</span>
              )}
            </div>
            <RepasBloc
              type={selectedType}
              date={selectedDate}
              planCategorie={repasPlan[selectedType]?.categorie}
              extrasRestants={extrasRestants}
              onSave={handleSaveRepas}
              setSnackbar={setSnackbar}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                style={{
                  background: "#e0e0e0",
                  color: "#333",
                  border: "none",
                  borderRadius: 18,
                  padding: "8px 22px",
                  fontWeight: 600,
                  fontSize: 15,
                  marginTop: 8,
                  cursor: "pointer"
                }}
                onClick={() => setSelectedType(null)}
              >
                ⬅️ Changer de type de repas
              </button>
            </div>
          </div>
        )
      )}

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

      <div style={{
        marginTop: 36,
        fontSize: 13,
        color: "#888",
        textAlign: "center"
      }}>
        <span>Astuce : Cliquez sur un repas pour saisir ce que vous avez mangé.<br />Les extras sont limités à 3 par semaine, utilisez-les à bon escient !</span>
      </div>

      <div style={{
        textAlign: "center",
        marginTop: 32
      }}>
        <Link href="/repas">
          <button style={{
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}>
            🗑️ Gérer/Supprimer mes repas
          </button>
        </Link>
      </div>
    </div>
  );
}
