import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Actions et messages pour les portes
const actionsFreinDoux = [
  {
    message: "C’est dur de résister à une pulsion, mais si on agit maintenant, on referme la porte à la dérive.",
    action: "Choisis un aliment dans ton repas et prends 3 bouchées en pleine conscience. Observe sa texture, son goût, et ce qu’il te fait ressentir."
  },
  {
    message: "Parfois, il suffit d’un instant pour changer la dynamique du repas.",
    action: "Avant de commencer ton repas, prends une pause de 30 secondes pour respirer et te recentrer. Puis commence doucement."
  }
];

const actionsRappelleToi = {
  message: "Il y a des jours comme ça, et c’est ok. Mais rappelle-toi que ça ne définit pas qui tu es.",
  action: "Sur 2 jours, pense à celle que tu veux être et choisis une action qui l’incarne. Pose cette action dès demain."
};

const actionsLeveToi = {
  message: "Tu n’as pas besoin de recommencer, accepte juste aujourd’hui de continuer à avancer.",
  action: "Choisis une action simple aujourd’hui : écrire un repas, remplir une émotion, ou respirer avant de manger."
};

export default function BlocSatiété({ startDate, endDate }) {
  const [repasPeriode, setRepasPeriode] = useState([]);
  const [activePorte, setActivePorte] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("repas_reels")
        .select("date, satiete, humeur_associee")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        console.error("Erreur lors de la récupération des repas réels :", error);
      } else {
        console.log("Données récupérées depuis Supabase :", data); // Log des données récupérées
        setRepasPeriode(data);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (!repasPeriode.length) return;

    // Regrouper les repas par jour
    const repasParJour = {};
    repasPeriode.forEach(r => {
      repasParJour[r.date] = repasParJour[r.date] || [];
      repasParJour[r.date].push(r);
    });

    const dates = Object.keys(repasParJour).sort();
    const today = dates[dates.length - 1];
    const repasToday = repasParJour[today] || [];
    const depassesToday = repasToday.filter(r => r.satiete === "non").length;
    const tauxDepassement = repasToday.length ? depassesToday / repasToday.length : 0;

    const humeurFragile = repasPeriode.filter(r => r.humeur_associee === "fragile").length >= 2;
    const aucunRepasSaisi = repasPeriode.length === 0;

    // Logs pour vérifier les calculs
    console.log("Repas par jour :", repasParJour);
    console.log("Repas aujourd'hui :", repasToday);
    console.log("Taux de dépassement :", tauxDepassement);
    console.log("Humeur fragile détectée :", humeurFragile);
    console.log("Aucun repas saisi :", aucunRepasSaisi);

    // Critères pour les portes
    if (tauxDepassement >= 2 / 3) {
      // Porte : Frein doux
      const count = parseInt(localStorage.getItem("freinDouxCount") || "0", 10);
      console.log("Porte activée : Frein doux");
      setActivePorte(actionsFreinDoux[count % actionsFreinDoux.length]);
      localStorage.setItem("freinDouxCount", count + 1);
    } else if (humeurFragile) {
      console.log("Porte activée : Rappelle-toi que tu crées tout moment");
      setActivePorte(actionsRappelleToi);
    } else if (aucunRepasSaisi) {
      console.log("Porte activée : Lève-toi intérieurement");
      setActivePorte(actionsLeveToi);
    } else {
      console.log("Aucune porte activée");
      setActivePorte(null);
    }
  }, [repasPeriode]);

  if (!activePorte) return null;

  return (
    <div style={{ background: "#f5f5f5", borderRadius: 12, padding: 16, margin: "16px 0" }}>
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>{activePorte.message}</div>
      <div style={{ marginBottom: 8 }}>{activePorte.action}</div>
      <button style={{ marginRight: 8, padding: "8px 16px", background: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Je pose ce pas
      </button>
      <button style={{ padding: "8px 16px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Plus tard
      </button>
    </div>
  );
}