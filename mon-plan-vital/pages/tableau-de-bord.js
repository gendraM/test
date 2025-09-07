import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import Link from "next/link";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const COLORS = [
  "#43a047", // vert
  "#1976d2", // bleu
  "#ffa726", // orange
  "#e53935", // rouge
  "#9c27b0", // violet
];

function getMotivationMessage({ progression, extras, humeurCounts, tauxSatiete }) {
  if (progression.badge) {
    return `🏆 ${progression.badge} : ${progression.message}`;
  }
  if (extras > 0 && extras <= progression.quota) {
    return "💪 Tu respectes ton quota d'extras : continue comme ça !";
  }
  if (tauxSatiete > 70) {
    return "🥗 Tu manges majoritairement par faim réelle, c'est top !";
  }
  if (humeurCounts["En forme"] > humeurCounts["Fragile"]) {
    return "😄 Ton humeur est globalement positive, tu gères bien ta semaine !";
  }
  return "🚀 Chaque petite action compte : recommence, progresse, bats tes records !";
}

export default function TableauDeBord() {
  const [poidsData, setPoidsData] = useState([]);
  const [humeurData, setHumeurData] = useState([]);
  const [satieteData, setSatieteData] = useState({ faim: 0, total: 0 });
  const [extrasData, setExtrasData] = useState({ current: 0, quota: 3 });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Progression badge/message
  const [progression, setProgression] = useState({
    badge: null,
    message: "",
    quota: 3,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let user;
      try {
        const { data, error } = await supabase.auth.getUser();
        user = data?.user;
      } catch {
        user = null;
      }
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Historique poids
      const { data: poidsHistory } = await supabase
        .from("historique_poids")
        .select("date, poids")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      setPoidsData(poidsHistory || []);

      // 2. Humeurs 30j
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const { data: humeurs } = await supabase
        .from("humeur_checkin")
        .select("humeur")
        .eq("user_id", user.id)
        .gte("date", oneMonthAgo.toISOString());
      setHumeurData(humeurs || []);

      // 3. Satiété (repas pris par faim)
      const { data: repasReels, count: totalRepas } = await supabase
        .from("repas_reel")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);
      const repasParFaim =
        repasReels?.filter((r) => r.raison_manger === "J'avais faim").length || 0;
      setSatieteData({ faim: repasParFaim, total: totalRepas || 0 });

      // 4. Extras de la semaine courante
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const { data: extrasWeek } = await supabase
        .from("repas_reel")
        .select("est_extra")
        .eq("user_id", user.id)
        .gte("date", monday.toISOString().slice(0, 10))
        .lte("date", sunday.toISOString().slice(0, 10));
      let quota = 3;
      const { data: profil } = await supabase
        .from("profil")
        .select("delai")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (profil?.[0]?.delai) {
        quota = Math.max(1, Math.round(3 - profil[0].delai / 2));
      }
      setExtrasData({
        current: extrasWeek?.filter((r) => r.est_extra)?.length || 0,
        quota,
      });

      // 5. Badges/défis
      const { data: badgesList } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", user.id);
      setBadges(badgesList || []);

      // 6. Progression/gamification
      let badge = null,
        message = "";
      const extrasCount = extrasWeek?.filter((r) => r.est_extra).length || 0;
      if (extrasCount === 0) {
        badge = "Semaine parfaite";
        message =
          "Tu n'as pris aucun extra cette semaine. C'est la discipline maximale !";
      } else if (extrasCount <= quota && extrasCount > 0) {
        badge = "Semaine dans le quota";
        message =
          "Tu as respecté ton quota d'extras, continue ainsi pour progresser !";
      }
      setProgression({ badge, message, quota });
      setLoading(false);
    }
    fetchData();
  }, []);

  // Graphiques
  const poidsChartData = {
    labels: poidsData.map((p) =>
      new Date(p.date).toLocaleDateString("fr-FR")
    ),
    datasets: [
      {
        label: "Évolution du poids (kg)",
        data: poidsData.map((p) => p.poids),
        fill: false,
        borderColor: COLORS[1],
        backgroundColor: COLORS[1],
        tension: 0.2,
        pointRadius: 5,
        pointBackgroundColor: COLORS[3],
      },
    ],
  };

  // Humeurs
  const humeurCounts = humeurData.reduce((acc, curr) => {
    acc[curr.humeur] = (acc[curr.humeur] || 0) + 1;
    return acc;
  }, {});
  const humeurChartData = {
    labels: Object.keys(humeurCounts),
    datasets: [
      {
        label: "Répartition des humeurs",
        data: Object.values(humeurCounts),
        backgroundColor: Object.keys(humeurCounts).map(
          (_, i) => COLORS[i % COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  // Satiété
  const tauxSatiete =
    satieteData.total > 0
      ? ((satieteData.faim / satieteData.total) * 100).toFixed(0)
      : 0;
  const satieteChartData = {
    labels: ["Par faim réelle", "Autres raisons"],
    datasets: [
      {
        data: [
          satieteData.faim,
          Math.max(0, satieteData.total - satieteData.faim),
        ],
        backgroundColor: [COLORS[0], COLORS[2]],
      },
    ],
  };

  // Dopamine/Feedback
  const motivation = getMotivationMessage({
    progression,
    extras: extrasData.current,
    humeurCounts,
    tauxSatiete,
  });

  // Affichage
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          fontSize: "1.4rem",
          color: "#1976d2",
        }}
      >
        Chargement de vos statistiques...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2.2rem",
          color: "#1976d2",
          fontWeight: 800,
          fontSize: "2.7rem",
          letterSpacing: "0.5px",
        }}
      >
        Tableau de Bord
      </h1>

      {/* Dopamine / encouragement */}
      <div
        style={{
          background: "#e3f2fd",
          borderRadius: "15px",
          padding: "1.4rem",
          boxShadow: "0 2px 12px #e0e0e0",
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "1.2rem",
          color: "#1976d2",
          fontWeight: 600,
        }}
      >
        {motivation}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {/* --- Indicateur de Satiété --- */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[0] }}>Taux de Satiété</h2>
          <Doughnut data={satieteChartData} />
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#2980b9",
              margin: "1.1rem 0 0.2rem 0",
            }}
          >
            {tauxSatiete}%
          </p>
          <p style={{ color: "#555" }}>
            des repas ont été pris par faim réelle.
          </p>
        </div>

        {/* --- Extras de la semaine --- */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[2] }}>Extras de la semaine</h2>
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color:
                extrasData.current <= extrasData.quota
                  ? "#43a047"
                  : "#e53935",
              margin: "1.1rem 0 0.2rem 0",
            }}
          >
            {extrasData.current} / {extrasData.quota}
          </p>
          <p>
            {extrasData.current <= extrasData.quota
              ? "Bravo, tu es dans le quota !"
              : "Attention, quota dépassé..."}
          </p>
        </div>

        {/* --- Graphique de Poids --- */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            gridColumn: "1 / -1",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[1] }}>
            Évolution du Poids
          </h2>
          <Line data={poidsChartData} />
        </div>

        {/* --- Graphique d'Humeurs --- */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[4] }}>
            Répartition des Humeurs (30 derniers jours)
          </h2>
          <Pie data={humeurChartData} />
        </div>

        {/* --- Section Succès / Badges --- */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[3] }}>Mes Succès & Badges</h2>
          {badges.length === 0 ? (
            <p style={{ color: "#666" }}>Aucun badge débloqué pour le moment.</p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "1.12rem",
                color: "#444",
                fontWeight: 600,
              }}
            >
              {badges.map((badge, i) => (
                <li key={i} style={{ marginBottom: "0.5rem" }}>
                  🏅 <span>{badge.nom}</span>
                  <span style={{ color: "#888", fontSize: "0.95rem", marginLeft: 4 }}>
                    {badge.description || ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- Actions rapides/navigation --- */}
      <div
        style={{
          textAlign: "center",
          marginTop: "3.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.2rem",
        }}
      >
        <Link href="/suivi">
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🥗 Voir mon suivi
          </button>
        </Link>
        <Link href="/plan">
          <button
            style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            📅 Planifier mes repas
          </button>
        </Link>
        <Link href="/tableau-de-bord">
          <button
            style={{
              background: "#ffa726",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🏠 Retour au tableau de bord
          </button>
        </Link>
        <Link href="/profil">
          <button
            style={{
              background: "#9c27b0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            👤 Voir mon profil
          </button>
        </Link>
      </div>
    </div>
  );
}