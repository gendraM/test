import RepasBloc from "../components/RepasBloc";
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Utilitaire message cyclique
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

// BADGES / PROGRESSION (Zone 2 - affiché uniquement palier===1)
const PROGRESSION_MILESTONES = [
  { streak: 12, message: "3 mois sans dépasser 1 extra/semaine : Ta gestion des extras est exemplaire. C’est un nouveau mode de vie que tu installes, bravo ! Ne relâche pas tes efforts : évite la zone de satisfaction et continue à prendre soin de tes habitudes !" },
  { streak: 8, message: "8 semaines de maîtrise des extras ! Tu prouves que tu peux tenir sur la durée. C’est la marque des personnes déterminées : tu peux être fier(e) de toi." },
  { streak: 4, message: "4 semaines d’affilée, c’est impressionnant ! Tu installes une vraie discipline sur les extras. Ta persévérance va bientôt devenir une habitude solide." },
  { streak: 2, message: "Bravo, deux semaines de suite ! Ta régularité paie : tu maîtrises de mieux en mieux tes envies d’extras. Garde ce cap, chaque semaine compte !" },
  { streak: 1, message: "Félicitations ! Tu as réussi à limiter tes extras à 1 cette semaine. Tu fais un grand pas vers l’équilibre, continue ainsi !" },
];
const INTERRUPTION_VERBATIM = "Pas grave, chaque semaine est une nouvelle chance ! Tu as dépassé ton quota d’extras cette fois-ci, mais ce n’est qu’une étape. Reprends ta série, tu sais que tu peux y arriver !";
const REGULAR_MOTIVATION = "Limiter ses extras, c’est se rapprocher de ses objectifs semaine après semaine. Garde le rythme !";

function getWeeklyExtrasHistory(repasSemaine, selectedDate, nbWeeks = 16) {
  let today = new Date(selectedDate);
  let weeks = [];
  let calcMonday = (d) => {
    let date = new Date(d);
    let day = date.getDay();
    let monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0,0,0,0);
    return monday;
  };
  let monday = calcMonday(today);
  for(let i=0; i<nbWeeks; i++) {
    let weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - (i*7));
    weekStart.setHours(0,0,0,0);
    let weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    let count = repasSemaine.filter(r => {
      let d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d >= weekStart && d <= weekEnd && r.est_extra;
    }).length;
    weeks.push({
      weekStart: weekStart.toISOString().slice(0,10),
      count,
      isCurrent: (i === 0),
    });
  }
  return weeks;
}

function getWeeklyPalier(history) {
  let palier = 7;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].count > 1) {
      palier = Math.max(1, history[i].count - 1);
      break;
    }
    palier = Math.max(1, palier - 1);
  }
  return palier;
}

function getProgressionMessage(history, palier) {
  if (palier > 1) {
    return { badgeMessage: null, milestone: null, interruption: false, nextMilestone: null, weeksToNext: 0, streak: 0, allMilestones: [] };
  }
  let streak = 0, maxStreak = 0, interruption = false, milestone = 0;
  let lastWasStreak = false;
  let milestonesUnlocked = [];
  for(let i = 0; i < history.length; i++) {
    if(history[i].count <= 1) {
      streak++;
      if(streak > maxStreak) maxStreak = streak;
      lastWasStreak = true;
      if(history[i].isCurrent) {
        for (let m of PROGRESSION_MILESTONES) {
          if (streak === m.streak) {
            milestonesUnlocked.push({week: i, msg: m.message, streak: m.streak});
          }
        }
      }
    } else {
      if(history[i].isCurrent && streak > 0 && !lastWasStreak) interruption = true;
      streak = 0;
      lastWasStreak = false;
    }
  }
  const lastMilestone = milestonesUnlocked.length > 0 ? milestonesUnlocked[milestonesUnlocked.length-1] : null;
  const currentStreak = history[0]?.count <= 1 ? streak : 0;
  const nextMilestoneObj = PROGRESSION_MILESTONES.find(m => m.streak > currentStreak);
  return {
    badgeMessage: lastMilestone?.msg,
    milestone: lastMilestone?.streak,
    interruption: interruption && history[0]?.isCurrent,
    nextMilestone: nextMilestoneObj,
    weeksToNext: nextMilestoneObj ? nextMilestoneObj.streak - currentStreak : 0,
    streak: currentStreak,
    allMilestones: milestonesUnlocked
  };
}

function ProgressionHistory({ history }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div>
      <button
        style={{
          background: "#eee", color: "#1976d2", border: "none", borderRadius: 6,
          fontWeight: 600, cursor: "pointer", fontSize: 14, marginTop: 8, marginBottom: 6, padding: "4px 14px"
        }}
        onClick={() => setShowAll(s => !s)}
        aria-expanded={showAll}
      >
        {showAll ? "Masquer l’historique" : "Voir l’historique des badges"}
      </button>
      {showAll && (
        <ul style={{ fontSize: 14, color: "#888", margin: 0, padding: "0 0 0 14px" }}>
          {history.map((w, i) => (
            <li key={i}>
              <span style={{fontWeight: w.isCurrent ? 700 : 400}}>
                Semaine du {w.weekStart} : {w.count} extra{w.count>1?'s':''}
                {w.count<=1 && <span style={{color:"#43a047"}}> (dans l’objectif)</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ZONE 1 : Feedback immédiat (toujours affiché)
function ZoneFeedbackHebdo({
  extrasThisWeek,
  extrasLastWeek,
  palier,
  objectifFinal = 1,
  onInfoClick,
  variation
}) {
  let message, color;
  if (extrasThisWeek <= palier) {
    message = `Bravo, tu as limité tes extras à ${extrasThisWeek} cette semaine${extrasThisWeek <= 1 ? " !" : ""}`;
    color = "#43a047";
  } else {
    message = `Tu as dépassé ton quota cette semaine (${extrasThisWeek}/${palier}). Tu peux faire mieux, penses à planifier tes extras pour t'aider à progresser !`;
    color = "#f57c00";
  }

  const showLastWeek =
    typeof extrasLastWeek === "number" &&
    extrasLastWeek > 0 &&
    typeof variation === "number" &&
    variation < 0;

  return (
    <div
      style={{
        border: "2px solid #1976d2",
        borderRadius: 12,
        background: "#f0f6ff",
        margin: "18px 0 12px",
        padding: "16px 20px",
        fontWeight: 600,
        fontSize: 17,
        color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      aria-live="polite"
    >
      <div style={{marginBottom: 4}}>{message}</div>
      {showLastWeek && (
        <div style={{fontSize: 14, color: "#1976d2", fontWeight: 500, margin: "4px 0"}}>
          Semaine dernière : {extrasLastWeek} extra{extrasLastWeek > 1 ? "s" : ""}
          <span style={{ marginLeft: 10 }}>
            ({variation < 0 ? `-${Math.abs(variation)} extra${variation <= -2 ? "s" : ""}` : ""})
          </span>
        </div>
      )}
      <div style={{fontSize: 14, color: "#888"}}>
        Palier actuel&nbsp;: <b>{palier}</b> extra{palier>1?"s":""}&nbsp;/ semaine&nbsp;&nbsp;|&nbsp;&nbsp;Objectif final&nbsp;: <b>{objectifFinal}</b> extra/semaine
      </div>
      <button
        style={{marginTop: 8, background: "#1976d2", color:"#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor:"pointer", fontSize: 13, padding: "6px 14px"}}
        onClick={onInfoClick}
      >
        Consulter la règle des extras
      </button>
    </div>
  );
}

// ZONE 2 : Progression / badges (affiché SEULEMENT si palier===1)
function ZoneBadgesProgression({ progression, history, palier }) {
  if (palier > 1) {
    return null;
  }
  let content;
  if (progression.badgeMessage) {
    content = <div style={{color:"#4d148c", fontWeight:800, fontSize:16, marginBottom:6}}>{progression.badgeMessage}</div>;
  } else if (progression.interruption) {
    content = <div style={{color:"#e53935", fontWeight:700}}>{INTERRUPTION_VERBATIM}</div>;
  } else if (progression.nextMilestone) {
    content = (
      <div style={{color:"#1976d2", fontWeight:600}}>
        Encore {progression.weeksToNext} semaine{progression.weeksToNext>1?"s":""} à 1 extra ou moins pour débloquer le prochain badge ! Tu es sur la bonne voie, continue ainsi pour franchir un nouveau cap.
      </div>
    );
  } else {
    content = <div style={{color:"#888", fontWeight:600}}>{REGULAR_MOTIVATION}</div>;
  }
  return (
    <div
      style={{
        border: "2px dashed #4d148c",
        borderRadius: 12,
        background: "#faf7ff",
        padding: "14px 18px",
        margin: "12px 0 22px",
        textAlign: "center",
      }}
      aria-live="polite"
    >
      <div style={{fontSize: 17, marginBottom: 2, fontWeight:700, color:"#4d148c"}}>Progression & badges</div>
      {content}
      <ProgressionHistory history={history} />
    </div>
  );
}

// MAIN COMPONENT
export default function Suivi() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const repasParam = params?.get('repas');
  const mapType = {
    'petit-dejeuner': 'Petit-déjeuner',
    'dejeuner': 'Déjeuner',
    'collation': 'Collation',
    'diner': 'Dîner',
    'autre': 'Autre'
  };
  const [selectedType, setSelectedType] = useState(repasParam ? mapType[repasParam] : null);

  const [repasPlan, setRepasPlan] = useState({});
  const [repasSemaine, setRepasSemaine] = useState([]);
  const [extrasRestants, setExtrasRestants] = useState(3);
  const [scoreJournalier, setScoreJournalier] = useState(0);
  const [scoreHebdomadaire, setScoreHebdomadaire] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Ajout pour objectif calorique dynamique
  const [objectifCalorique, setObjectifCalorique] = useState(null);
  const [scoreCalorique, setScoreCalorique] = useState(0);
  const [caloriesDuJour, setCaloriesDuJour] = useState(0);

  // Pour feedback extra
  const [showInfo, setShowInfo] = useState(false);

  // Historique extras/semaines
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [currentPalier, setCurrentPalier] = useState(3);
  const [objectifFinal, setObjectifFinal] = useState(1);
  const [extrasThisWeek, setExtrasThisWeek] = useState(0);
  const [extrasLastWeek, setExtrasLastWeek] = useState(0);
  const [variation, setVariation] = useState(null);
  const [progression, setProgression] = useState({});

  // Pour hors-quota
  const [extrasDuJour, setExtrasDuJour] = useState([]);
  const [extrasHorsQuota, setExtrasHorsQuota] = useState([]);
  const [extrasTotalSemaine, setExtrasTotalSemaine] = useState([]);
  const [showProgressionMessage, setShowProgressionMessage] = useState(false);
  const [enReequilibrage, setEnReequilibrage] = useState(false);
  const [repasPlanifie, setRepasPlanifie] = useState(null);

  // Avertissement dépassement calorique
  const [showAlerteCalorique, setShowAlerteCalorique] = useState(false);

  // Ajout : Pour synchroniser le calcul des scores quand objectifCalorique et repasSemaine sont prêts
  const repasReady = useRef(false);

  // Récupérer l'objectif calorique "objectif" (besoin_objectif) du dernier profil
  useEffect(() => {
    const fetchProfil = async () => {
      // On cherche bien le besoin_objectif (objectif calorique perte de poids)
      const { data, error } = await supabase
        .from('profil')
        .select('besoin_objectif')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        setObjectifCalorique(data[0].besoin_objectif);
      }
    };
    fetchProfil();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const plan = await fetchRepasPlan();
      const semaine = await fetchRepasSemaine();
      setRepasPlan(plan);
      setRepasSemaine(semaine);
      repasReady.current = true; // flag ready pour synchro calcul

      // Historique
      const weekly = getWeeklyExtrasHistory(semaine, selectedDate, 16);
      setWeeklyHistory(weekly);

      // Palier dynamique
      const palier = getWeeklyPalier(weekly);
      setCurrentPalier(palier);

      setExtrasThisWeek(weekly[0]?.count ?? 0);
      setExtrasLastWeek(weekly[1]?.count ?? 0);
      setVariation(
        typeof weekly[0]?.count === "number" && typeof weekly[1]?.count === "number"
          ? weekly[0].count - weekly[1].count
          : null
      );

      // Progression (NE PAS déclencher tant que palier > 1)
      setProgression(getProgressionMessage(weekly, palier));

      // Extras semaine courante
      const extrasTotal = semaine.filter((repas) => repas.est_extra);
      setExtrasTotalSemaine(extrasTotal);
      const extrasAujourdHui = semaine.filter(
        (repas) => repas.date === selectedDate && repas.est_extra
      );
      setExtrasDuJour(extrasAujourdHui);

      // Hors quota = extras > palier
      const extrasHorsQuotaAll = extrasTotal.slice(palier);
      const extrasHorsQuota7j = extrasHorsQuotaAll.filter(extra =>
        isInLast7Days(extra.date, selectedDate)
      );
      setExtrasHorsQuota(extrasHorsQuota7j);

      setExtrasRestants(Math.max(0, palier - extrasTotal.length));

      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [selectedDate, objectifCalorique]);

  // Synchronisation stricte du calcul calorique dès que données prêtes
  useEffect(() => {
    if (
      objectifCalorique !== null &&
      objectifCalorique !== undefined &&
      repasReady.current
    ) {
      calculerScores(repasSemaine);
    }
    // eslint-disable-next-line
  }, [objectifCalorique, repasSemaine, selectedDate]);

  useEffect(() => {
    const fetchRepasPlanifie = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("repas_planifies")
        .select("*")
        .eq("date", today);
      setRepasPlanifie(data?.[0] || null);
    };
    fetchRepasPlanifie();
  }, []);

  const fetchRepasPlan = async () => {
    const { data, error } = await supabase
      .from('repas_planifies')
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
      .gte('date', new Date(new Date().setDate(new Date().getDate() - 120)).toISOString().slice(0, 10));

    if (error) {
      setSnackbar({ open: true, message: "Erreur lors de la récupération des repas réels.", type: "error" });
      return [];
    }
    return data;
  };

  const calculerScores = (repasSemaine) => {
    const repasDuJour = repasSemaine.filter((repas) => repas.date === selectedDate);

    // NOUVEAU SCORE CALORIQUE
    const totalCalories = repasDuJour.reduce((acc, r) => acc + (r.kcal || r.calories || 0), 0);
    setCaloriesDuJour(totalCalories);

    if (objectifCalorique > 0) {
      setScoreCalorique(Math.round((totalCalories / objectifCalorique) * 100));
    } else {
      setScoreCalorique(0);
    }

    // Affiche l'alerte si dépassement calorique
    setShowAlerteCalorique(objectifCalorique > 0 && totalCalories > objectifCalorique);

    // Score discipline (ancien)
    const repasAlignes = repasDuJour.filter((repas) => repas.regle_respectee).length;
    const totalRepas = repasDuJour.length;
    setScoreJournalier(Math.round((repasAlignes / (totalRepas || 1)) * 100));
    const repasAlignesHebdo = repasSemaine.filter((repas) => repas.regle_respectee).length;
    setScoreHebdomadaire(Math.round((repasAlignesHebdo / 28) * 100));
  };

 const handleSaveRepas = async (data) => {
  // Nettoyage des champs attendus
  const repas = { ...data };

  // Champs booléens à nettoyer
  const boolFields = ["est_extra", "regle_respectee"];
  boolFields.forEach(field => {
    // Si la valeur est true ou "true" => true, sinon => false
    repas[field] = repas[field] === true || repas[field] === "true";
  });

  // Champs numériques à nettoyer
  const numFields = ["kcal", "quantite"];
  numFields.forEach(field => {
    if (repas[field] === "" || repas[field] === undefined || repas[field] === null) {
      repas[field] = field === "kcal" ? 0 : null;
    } else {
      repas[field] = Number(repas[field]);
      if (isNaN(repas[field])) repas[field] = field === "kcal" ? 0 : null;
    }
  });

  // Supprimer le champ parasite "calories"
  if ("calories" in repas) {
    delete repas.calories;
  }

  // Supprimer toute string vide restante sur un champ boolean
  boolFields.forEach(field => {
    if (typeof repas[field] === "string" && repas[field].trim() === "") {
      repas[field] = false;
    }
  });

  // Insertion dans la base
  const { error } = await supabase.from('repas_reels').insert([{ ...repas, date: selectedDate }]);
  if (error) {
    setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du repas.", type: "error" });
  } else {
    setSnackbar({ open: true, message: "Repas enregistré avec succès !", type: "success" });
    const updatedRepasSemaine = await fetchRepasSemaine();
    setRepasSemaine(updatedRepasSemaine);
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

      {/* ----------- INFOS CALORIQUES JOURNALIÈRES ----------- */}
      <div style={{
        marginBottom: 16,
        background: "#fff",
        borderRadius: 12,
        padding: "18px 18px 10px 18px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.06)",
        borderLeft: "6px solid #ff9800",
        textAlign: "center"
      }}>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Objectif calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Consommé aujourd’hui : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
            {caloriesDuJour} kcal
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Reste à consommer : </span>
          <span style={{
            fontWeight: 700,
            color: caloriesDuJour > objectifCalorique ? "#e53935" : "#43a047",
            fontSize: 18
          }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
              ? (objectifCalorique - caloriesDuJour) + " kcal"
              : "..."}
          </span>
        </div>
      </div>

      {/* --------- ZONE 1 : Feedback immédiat --------- */}
      <ZoneFeedbackHebdo
        extrasThisWeek={extrasThisWeek}
        extrasLastWeek={extrasLastWeek}
        palier={currentPalier}
        objectifFinal={objectifFinal}
        onInfoClick={() => setShowInfo(true)}
        variation={variation}
      />

      {/* --------- ZONE 2 : Progression / badges --------- */}
      <ZoneBadgesProgression progression={progression} history={weeklyHistory} palier={currentPalier} />

      {/* Modal info règle des extras */}
      {showInfo && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.12)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setShowInfo(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.12)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{fontWeight:700, fontSize:18, marginBottom:8}}>Règle des extras</h2>
            <div style={{fontSize:15, color:"#333"}}>
              <ul>
                <li>Les extras sont limités à un quota hebdomadaire personnalisé.</li>
                <li>Le quota est ajusté chaque semaine selon ta progression : plus tu progresses, plus il se rapproche de l’objectif final (1 extra/semaine).</li>
                <li>Les extras au-delà du quota sont marqués <b>hors quota</b> et visibles.</li>
                <li>Ta progression est récompensée par des badges et messages de félicitations à chaque jalon.</li>
                <li>L’historique complet de tes semaines reste accessible.</li>
              </ul>
              <button style={{
                marginTop:12, background:"#1976d2", color:"#fff", border:"none", borderRadius:8, fontWeight:600, fontSize:14, padding:"6px 16px"
              }} onClick={() => setShowInfo(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* -------- Sélecteur de date -------- */}
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
              repasSemaine={repasSemaine}
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

      {/* ----------- SCORE CALORIQUE ET DISCIPLINE ----------- */}
      <div style={{
        marginTop: 24,
        background: "#fafafa",
        borderRadius: 12,
        padding: "20px 16px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.03)"
      }}>
        <h2 style={{ margin: "0 0 16px 0" }}>Mes scores</h2>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 500 }}>Score calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {scoreCalorique}%
          </span>
          <div>
            <span style={{ fontSize: 14, color: "#888" }}>
              Objectif : {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"} — Consommé : {caloriesDuJour} kcal
            </span>
          </div>
          <div>
            <span style={{ fontSize: 14, color: "#888" }}>
              Calories restantes : {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
                ? (objectifCalorique - caloriesDuJour) + " kcal"
                : "..."}
            </span>
          </div>
          <ProgressBar value={scoreCalorique} color="#ff9800" />
        </div>
        <div>
          <span style={{ fontWeight: 500 }}>Score discipline (repas alignés) : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>{scoreJournalier}%</span>
          <ProgressBar value={scoreJournalier} color="#1976d2" />
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontWeight: 500 }}>Score hebdomadaire : </span>
          <span style={{ fontWeight: 700, color: "#43a047", fontSize: 18 }}>{scoreHebdomadaire}%</span>
          <ProgressBar value={scoreHebdomadaire} color="#43a047" />
        </div>
      </div>

      {/* ----------- AVERTISSEMENT DÉPASSEMENT CALORIQUE ----------- */}
      {showAlerteCalorique && (
        <div style={{
          marginTop: 24,
          background: "#fffbe6",
          border: "1px solid #ffe082",
          borderRadius: 12,
          padding: 20,
          color: "#b26a00",
          boxShadow: "0 1px 6px #ffd60022"
        }}>
          <b>⚠️ Attention : tu dépasses ton objectif calorique !</b>
          <div style={{marginTop:8}}>
            Si tu continues ainsi, tu risques de t’éloigner de ton objectif et de prendre du poids.<br />
            Adapte tes repas pour revenir dans ta zone d’objectif.
          </div>
        </div>
      )}

      {/* Hors quota – affichage léger */}
      {extrasHorsQuota.length > 0 && (
        <div style={{
          marginTop: 18,
          borderRadius: 8,
          padding: "8px 12px",
          background: "#fffbe6",
          border: "1px solid #ffe082",
          color: "#ffa000"
        }}>
          <div style={{ fontWeight: 600 }}>
            🟡 Extras hors quota cette semaine
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
        marginTop: 36,
        fontSize: 13,
        color: "#888",
        textAlign: "center"
      }}>
        <span>Astuce : Cliquez sur un repas pour saisir ce que vous avez mangé.<br />Les extras sont limités à un quota dynamique par semaine, utilisez-les à bon escient !</span>
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
        <Link href="/plan">
          <button style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            marginTop: 16
          }}>
            📅 Planifier mes repas
          </button>
        </Link>
          <Link href="/tableau-de-bord">
            <button style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              marginTop: 16
            }}>
              🏠 Retour au tableau de bord
            </button>
          </Link>
      </div>
    </div>
  );
}