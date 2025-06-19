import { useState, useEffect } from "react";

// --- Données statiques pour chaque jour de jeûne (exemple jusqu'à 10 jours, à compléter si besoin) ---
const JEUNE_DAYS_CONTENT = {
  1: {
    titre: "Jour 1 – Lancement du jeûne",
    corps: [
      "🧠 Esprit : Tu entres dans la phase de rupture. Les premières heures sont surtout mentales. Ton corps commence à utiliser ses réserves de glucose.",
      "🧬 Corps : La glycémie baisse doucement. Tu peux ressentir une légère faim ou des pensées alimentaires récurrentes.",
      "❤️ Synthèse émotionnelle : C’est le début d’un reset. Observe tes sensations sans jugement.",
      "📿 Ancrage spirituel : Prends un temps pour poser ton intention.",
      "🧰 Outil du jour : Respiration profonde, hydratation, marche douce.",
      "💡 Conseil : Prépare-toi à accueillir les premiers signaux de faim sans y répondre tout de suite."
    ],
    message: "Le plus dur, c’est de commencer. Tu viens de franchir la première porte. Tiens bon, tu es sur ton chemin."
  },
  2: {
    titre: "Jour 2 – Bascule métabolique",
    corps: [
      "🧠 Esprit : Les pensées alimentaires diminuent. Tu découvres une nouvelle forme de calme.",
      "🧬 Corps : Ton foie commence à produire des corps cétoniques. Début de la cétose.",
      "❤️ Synthèse émotionnelle : Tu peux ressentir de la fierté ou des doutes. C’est normal.",
      "📿 Ancrage spirituel : Médite sur la patience.",
      "🧰 Outil du jour : Hydratation ++, sieste courte, lecture inspirante.",
      "💡 Conseil : Écoute ton corps, repose-toi si besoin."
    ],
    message: "Tu es en pleine régénération cellulaire. Ton organisme apprend à fonctionner autrement."
  },
  3: {
    titre: "Jour 3 – Corps & Esprit en bascule profonde",
    corps: [
      "🧠 Esprit : Clarté mentale, pensées plus fluides.",
      "🧬 Corps : Cétose activée, autophagie en marche.",
      "❤️ Synthèse émotionnelle : Stabilité émotionnelle, connexion intérieure.",
      "📿 Ancrage spirituel : Silence intérieur, écoute de soi.",
      "🧰 Outil du jour : Marche, écriture, gratitude.",
      "💡 Conseil : Observe les changements subtils en toi."
    ],
    message: "Ton corps ne crie pas. Il travaille. Il se libère. Il peut enfin respirer."
  },
  4: {
    titre: "Jour 4 – Brûle le gras profond",
    corps: [
      "🧠 Esprit : Fatigue possible, résistance mentale.",
      "🧬 Corps : Cétose stabilisée, autophagie active.",
      "❤️ Synthèse émotionnelle : Détachement des réflexes alimentaires.",
      "📿 Ancrage spirituel : Reconnexion à l’essentiel.",
      "🧰 Outil du jour : Respiration, visualisation, soutien.",
      "💡 Conseil : Hydrate-toi +++, repose-toi."
    ],
    message: "Tu es dans la traversée. Ce n’est pas de la privation : c’est de la reconquête."
  },
  5: {
    titre: "Jour 5 – Détox profonde",
    corps: [
      "🧠 Esprit : Sérénité, confiance.",
      "🧬 Corps : Détox cellulaire, élimination des déchets.",
      "❤️ Synthèse émotionnelle : Gratitude, recentrage.",
      "📿 Ancrage spirituel : Prière, méditation.",
      "🧰 Outil du jour : Écriture, partage, repos.",
      "💡 Conseil : Observe la légèreté qui s’installe."
    ],
    message: "Tu élimines des déchets anciens. C’est du grand ménage intérieur."
  },
  // ... Ajoute les jours suivants selon ton cahier des charges ...
};

const SUPPORT_MESSAGES = [
  "Ce n’est pas l’absence de nourriture qui est difficile, c’est la négociation intérieure. Tu tiens ton cap.",
  "Chaque heure passée est une victoire sur tes anciens schémas.",
  "Ton corps apprend à se libérer, ton esprit à s’apaiser.",
  "Tu n’es pas en restriction. Tu es en libération.",
  "Tiens-toi droite, tu nettoies ce que ton mental ne pouvait plus porter seul."
];

const OUTILS_SUGGESTIONS = [
  "Respiration profonde",
  "Lecture inspirante",
  "Prière ou méditation",
  "Marche en nature",
  "Écriture d’un journal",
  "Musique apaisante",
  "Soutien d’un proche"
];

function analyseComportementale(repasRecents = []) {
  const extras = repasRecents.reduce((acc, r) => acc + (r.est_extra ? 1 : 0), 0);
  const categories = {};
  repasRecents.forEach(r => {
    categories[r.categorie] = (categories[r.categorie] || 0) + 1;
  });
  let dominant = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "équilibre";
  return {
    extras,
    dominant,
    message: `Tu avais consommé ${extras} extras sur les 3 derniers jours. Catégorie dominante : ${dominant}. Ce jeûne est une vraie rupture. Tu es en train de couper une boucle.`
  };
}

function pertePoidsEstimee(poids, duree) {
  if (!poids) return "";
  const min = (duree * 0.3).toFixed(1);
  const max = (duree * 0.45).toFixed(1);
  return `Si tu restes hydraté(e) et stable, ta perte estimée est de ${min} à ${max} kg (eau + glycogène + graisses actives).`;
}

function getRepasRecents() {
  return [
    { est_extra: true, categorie: "féculent" },
    { est_extra: false, categorie: "sucre" },
    { est_extra: true, categorie: "féculent" }
  ];
}

function getPoidsDepart() {
  return 72.4;
}

function getDernierRepas() {
  return { aliment: "Pâtes", categorie: "féculent" };
}

function loadState(key, def) {
  if (typeof window === "undefined") return def;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
}
function saveState(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export default function Jeune() {
  const [dureeJeune, setDureeJeune] = useState(loadState("dureeJeune", 5));
  const [jourEnCours, setJourEnCours] = useState(loadState("jourEnCours", 1));
  const [joursValides, setJoursValides] = useState(loadState("joursValides", []));
  const [poidsDepart, setPoidsDepart] = useState(loadState("poidsDepart", getPoidsDepart()));
  const [messagePerso, setMessagePerso] = useState(loadState("messagePerso", ""));
  const [showMessagePerso, setShowMessagePerso] = useState(false);
  const [outils, setOutils] = useState(loadState("outilsJeune", {}));
  const [outilInput, setOutilInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const repasRecents = getRepasRecents();
  const analyse = analyseComportementale(repasRecents);
  const dernierRepas = getDernierRepas();

  useEffect(() => { saveState("dureeJeune", dureeJeune); }, [dureeJeune]);
  useEffect(() => { saveState("jourEnCours", jourEnCours); }, [jourEnCours]);
  useEffect(() => { saveState("joursValides", joursValides); }, [joursValides]);
  useEffect(() => { saveState("poidsDepart", poidsDepart); }, [poidsDepart]);
  useEffect(() => { saveState("messagePerso", messagePerso); }, [messagePerso]);
  useEffect(() => { saveState("outilsJeune", outils); }, [outils]);

  const validerJour = () => {
    if (!joursValides.includes(jourEnCours)) {
      const nv = [...joursValides, jourEnCours].sort((a, b) => a - b);
      setJoursValides(nv);
      if (jourEnCours < dureeJeune) setJourEnCours(jourEnCours + 1);
    }
  };

  const ajouterOutil = () => {
    if (!outilInput.trim()) return;
    setOutils({
      ...outils,
      [jourEnCours]: [...(outils[jourEnCours] || []), outilInput.trim()]
    });
    setOutilInput("");
  };

  const resetJeune = () => {
    setDureeJeune(5);
    setJourEnCours(1);
    setJoursValides([]);
    setPoidsDepart(getPoidsDepart());
    setMessagePerso("");
    setOutils({});
  };

  const isFini = joursValides.length >= dureeJeune;
  // Affiche la préparation à la reprise à partir de la moitié du jeûne ou du J4
  const showReprise = !isFini && (jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2)));

  const contenuJour = JEUNE_DAYS_CONTENT[jourEnCours] || {
    titre: `Jour ${jourEnCours}`,
    corps: ["Contenu à compléter pour ce jour."],
    message: SUPPORT_MESSAGES[(jourEnCours - 1) % SUPPORT_MESSAGES.length]
  };

  const perteEstimee = pertePoidsEstimee(poidsDepart, dureeJeune);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>🌙 Mon jeûne en cours</h1>

      {/* --- Accueil du jeûne actif --- */}
      <div style={{
        background: "#e3f2fd", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #90caf9aa"
      }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          📆 Jour {jourEnCours} / {dureeJeune} – {contenuJour.titre}
        </div>
        <div style={{ marginTop: 6, color: "#1976d2" }}>
          {contenuJour.message}
        </div>
        <div style={{ marginTop: 10 }}>
          ⚖️ Poids de départ : <b>{poidsDepart ? `${poidsDepart} kg` : "Non renseigné"}</b>
        </div>
        <div style={{ marginTop: 4 }}>
          🍽️ Dernier repas analysé : <b>{dernierRepas.aliment}</b> ({dernierRepas.categorie})<br />
          <span style={{ color: "#888" }}>
            {dernierRepas.categorie === "féculent"
              ? "Ton dernier repas était riche en féculents. Ton foie est en train de basculer en mode cétose."
              : "Ton dernier repas était léger. Ton corps démarre le jeûne en douceur."}
          </span>
        </div>
      </div>

      {/* --- Analyse comportementale pré-jeûne (Jour 1 uniquement) --- */}
      {jourEnCours === 1 && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>🧾 Analyse comportementale pré-jeûne</div>
          <div>
            {analyse.message}
          </div>
          <div style={{ marginTop: 8, color: "#888" }}>
            {perteEstimee}
          </div>
        </div>
      )}

      {/* --- Message personnel (bonus) --- */}
      <div style={{ marginBottom: 18 }}>
        <button
          style={{
            background: "#ede7f6", color: "#4d148c", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowMessagePerso(s => !s)}
        >
          {showMessagePerso ? "Masquer mon message à moi-même" : "🪞 Je me parle"}
        </button>
        {showMessagePerso && (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={messagePerso}
              onChange={e => setMessagePerso(e.target.value)}
              placeholder="Écris-toi un message d’encouragement ou d’intention pour ce jeûne…"
              style={{ width: "100%", minHeight: 60, borderRadius: 8, border: "1px solid #b39ddb", padding: 8 }}
            />
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              Ce message te sera réaffiché le jour de la reprise.
            </div>
          </div>
        )}
      </div>

      {/* --- Contenu du jour --- */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #bdbdbd22"
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          {contenuJour.titre}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {contenuJour.corps.map((bloc, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{bloc}</li>
          ))}
        </ul>
        <div style={{ marginTop: 12, fontStyle: "italic", color: "#1976d2" }}>
          {SUPPORT_MESSAGES[((jourEnCours - 1 + SUPPORT_MESSAGES.length) % SUPPORT_MESSAGES.length)]}
        </div>
        <button
          style={{
            marginTop: 18, background: "#43a047", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer"
          }}
          onClick={validerJour}
          disabled={joursValides.includes(jourEnCours)}
        >
          {joursValides.includes(jourEnCours) ? "Jour validé ✅" : "Valider ce jour"}
        </button>
      </div>

      {/* --- Boîte à outils personnelle --- */}
      <div style={{
        background: "#e0f2f1", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>🧰 Ma boîte à outils du jour</div>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
          Qu’est-ce qui t’a aidé aujourd’hui à tenir ?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={outilInput}
            onChange={e => setOutilInput(e.target.value)}
            placeholder="Ex : respiration, prière, marche…"
            style={{ flex: 1, borderRadius: 6, border: "1px solid #80cbc4", padding: 6 }}
          />
          <button
            onClick={ajouterOutil}
            style={{
              background: "#00897b", color: "#fff", border: "none", borderRadius: 6,
              padding: "6px 14px", fontWeight: 600, cursor: "pointer"
            }}
          >
            Ajouter
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {OUTILS_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setOutilInput(s)}
              style={{
                background: "#fff", border: "1px solid #b2dfdb", borderRadius: 6,
                padding: "4px 10px", fontSize: 13, color: "#00897b", cursor: "pointer"
              }}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        {outils[jourEnCours]?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Outils utilisés aujourd’hui :</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {outils[jourEnCours].map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- Bloc “En savoir plus” --- */}
      <div style={{
        background: "#f3e5f5", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <button
          style={{
            background: "#7e57c2", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 18px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowInfo(true)}
        >
          🧬 En savoir plus sur ce qui se passe dans ton corps
        </button>
        {showInfo && (
          <div style={{
            marginTop: 12, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px #b39ddb33"
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {contenuJour.titre}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {contenuJour.corps.map((bloc, i) => (
                <li key={i}>{bloc}</li>
              ))}
            </ul>
            <button
              style={{
                marginTop: 12, background: "#b39ddb", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: "pointer"
              }}
              onClick={() => setShowInfo(false)}
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* --- Préparation à la reprise (à partir de J4 ou moitié du jeûne) --- */}
      {showReprise && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Préparation à la reprise alimentaire
          </div>
          <div>
            Dans {dureeJeune - jourEnCours + 1} jours, tu sortiras de ce jeûne. Ce n’est pas une fin, c’est une entrée vers une alimentation consciente.<br />
            <button
              style={{
                marginTop: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: "pointer"
              }}
              onClick={() => window.location.href = "/reprise"}
            >
              Visualiser mon plan de reprise
            </button>
          </div>
        </div>
      )}

      {/* --- Passerelle automatique vers la reprise --- */}
      {isFini && (
        <div style={{
          background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: 20, marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#388e3c", marginBottom: 8 }}>
            🎉 Bravo, tu as terminé ton jeûne !
          </div>
          <div>
            Demain, tu commences ta reprise guidée de {dureeJeune * 2} jours.<br />
            Les repas sont déjà préparés dans ton planning. Tu n’as plus qu’à les suivre.
          </div>
          {messagePerso && (
            <div style={{
              marginTop: 14, background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #bdbdbd"
            }}>
              <b>Ton message à toi-même :</b>
              <div style={{ marginTop: 6, color: "#4d148c" }}>{messagePerso}</div>
            </div>
          )}
          {Object.keys(outils).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <b>Voici les outils que tu as mobilisés pendant ton jeûne :</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {Object.entries(outils).map(([jour, outs]) =>
                  outs.map((o, i) => (
                    <li key={jour + "-" + i}>
                      Jour {jour} : {o}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* --- Suivi de progression --- */}
      <div style={{
        marginTop: 24, marginBottom: 18, background: "#f5f5f5", borderRadius: 8, padding: 12, textAlign: "center"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Progression : {joursValides.length} / {dureeJeune} jours validés
        </div>
        <div style={{
          height: 12, background: "#e0e0e0", borderRadius: 6, overflow: "hidden", margin: "8px 0"
        }}>
          <div style={{
            width: `${(joursValides.length / dureeJeune) * 100}%`,
            background: "#1976d2", height: "100%", borderRadius: 6, transition: "width 0.4s"
          }} />
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          {joursValides.length < dureeJeune
            ? "Valide chaque jour pour suivre ta progression."
            : "Jeûne terminé ! Prends soin de ta reprise."}
        </div>
      </div>

      {/* --- Paramètres et reset (pour tests) --- */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <label>
          Durée du jeûne (jours) :
          <input
            type="number"
            min={1}
            max={20}
            value={dureeJeune}
            onChange={e => setDureeJeune(Math.max(1, Number(e.target.value)))}
            style={{ marginLeft: 8, width: 60 }}
            disabled={joursValides.length > 0}
          />
        </label>
        <button
          style={{
            marginLeft: 16, background: "#f44336", color: "#fff", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={resetJeune}
        >
          Réinitialiser le jeûne
        </button>
      </div>
    </div>
  );
}