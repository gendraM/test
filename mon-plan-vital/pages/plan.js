import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Papa from "papaparse";
import referentielAliments from "../data/referentiel";
import { useRouter } from "next/router";

const typesRepas = [
  { nom: "Petit-déjeuner", emoji: "🥐", color: "#ffe082" },
  { nom: "Déjeuner", emoji: "🍽️", color: "#b3e5fc" },
  { nom: "Dîner", emoji: "🍲", color: "#c8e6c9" },
  { nom: "Collation", emoji: "🍏", color: "#f8bbd0" }
];
const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const moisNoms = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const reglesGestion = {
  "féculent": "Féculents cuits : 50-80g max/jour. Riz : 2 CS bombées. Pâtes : 3 CS bombées.",
  "protéine": "Protéines animales : 100-120g max/jour.",
  "légume": "Légumes : à volonté, privilégier la variété.",
  "fruit": "Fruits : 2 à 3 portions/jour.",
  "extra": "Extras : 3/semaine max, portion raisonnable, jamais à jeun."
};

function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function Plan() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [planning, setPlanning] = useState({});
  const [aliment, setAliment] = useState("");
  const [type, setType] = useState(typesRepas[0].nom);
  const [selectedDate, setSelectedDate] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [regle, setRegle] = useState("");
  const [categorie, setCategorie] = useState("");
  // Correction : initialisation sans localStorage
  const [mantra, setMantra] = useState("");
  const [objectifPoids, setObjectifPoids] = useState("");
  const [loading, setLoading] = useState(false);

  // Patch : lecture de localStorage uniquement côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMantra(localStorage.getItem("mantra") || "");
      setObjectifPoids(localStorage.getItem("objectifPoids") || "");
    }
  }, []);

  // Edition inline
  const [isEditing, setIsEditing] = useState(null);
  const [editAliment, setEditAliment] = useState("");

  // Comparaison repas respectés
  const [comparaison, setComparaison] = useState({ semaineActuelle: 0, semainePrecedente: 0 });

  const days = getDaysInMonth(year, month);

  // Charger les repas planifiés du mois
  useEffect(() => {
    const fetchPlanning = async () => {
      setLoading(true);
      const start = new Date(year, month, 1).toISOString().slice(0, 10);
      const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("repas_planifies")
        .select("*")
        .gte("date", start)
        .lte("date", end);
      const grouped = {};
      data?.forEach(r => {
        grouped[r.date] = grouped[r.date] || [];
        grouped[r.date].push(r);
      });
      setPlanning(grouped);
      setLoading(false);
    };
    fetchPlanning();
  }, [year, month]);

  // Suggestions personnalisées (bons ressentis)
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from("repas_reels")
        .select("aliment, categorie")
        .eq("ressenti", "satisfait")
        .eq("satiete", "oui")
        .limit(10);
      setSuggestions(data || []);
    };
    fetchSuggestions();
  }, []);

  // Comparaison repas respectés semaine actuelle/précédente
  useEffect(() => {
    const fetchComparaison = async () => {
      const today = new Date();
      const dayOfWeek = today.getDay() || 7;
      const startThisWeek = new Date(today);
      startThisWeek.setDate(today.getDate() - dayOfWeek + 1);
      const endThisWeek = new Date(startThisWeek);
      endThisWeek.setDate(startThisWeek.getDate() + 6);

      const startLastWeek = new Date(startThisWeek);
      startLastWeek.setDate(startThisWeek.getDate() - 7);
      const endLastWeek = new Date(startThisWeek);
      endLastWeek.setDate(startThisWeek.getDate() - 1);

      const { data: planifiesThis } = await supabase
        .from("repas_planifies")
        .select("*")
        .gte("date", startThisWeek.toISOString().slice(0, 10))
        .lte("date", endThisWeek.toISOString().slice(0, 10));
      const { data: reelsThis } = await supabase
        .from("repas_reels")
        .select("*")
        .gte("date", startThisWeek.toISOString().slice(0, 10))
        .lte("date", endThisWeek.toISOString().slice(0, 10));

      const { data: planifiesLast } = await supabase
        .from("repas_planifies")
        .select("*")
        .gte("date", startLastWeek.toISOString().slice(0, 10))
        .lte("date", endLastWeek.toISOString().slice(0, 10));
      const { data: reelsLast } = await supabase
        .from("repas_reels")
        .select("*")
        .gte("date", startLastWeek.toISOString().slice(0, 10))
        .lte("date", endLastWeek.toISOString().slice(0, 10));

      const respectes = (planifies, reels) =>
        planifies.filter(p =>
          reels.some(r => r.date === p.date && r.type === p.type && r.aliment === p.aliment)
        ).length;

      setComparaison({
        semaineActuelle: respectes(planifiesThis || [], reelsThis || []),
        semainePrecedente: respectes(planifiesLast || [], reelsLast || [])
      });
    };
    fetchComparaison();
  }, [year, month, planning]);

  // Met à jour la catégorie et la règle quand on sélectionne un aliment
  useEffect(() => {
    if (!aliment) {
      setCategorie("");
      setRegle("");
      return;
    }
    const found = referentielAliments.find(a => a.nom === aliment);
    if (found) {
      setCategorie(found.categorie);
      setRegle(reglesGestion[found.categorie] || "");
    } else {
      setCategorie("");
      setRegle("");
    }
  }, [aliment]);

  // Suggestions issues du référentiel pour le type de repas sélectionné
  const suggestionsRef = referentielAliments.filter(a => a.typeRepas === type);

  // Calcul du nombre de jours planifiés
  const nbJoursPlanifies = days.filter(d => planning[d.toISOString().slice(0, 10)]?.length).length;

  // Ajout manuel
  const handleAdd = async () => {
    if (!aliment || !type || !selectedDate) return;
    setLoading(true);
    await supabase.from("repas_planifies").insert([
      { date: selectedDate, type, aliment, categorie }
    ]);
    setAliment("");
    setSelectedDate("");
    setLoading(false);
    // Recharge le planning
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data } = await supabase
      .from("repas_planifies")
      .select("*")
      .gte("date", start)
      .lte("date", end);
    const grouped = {};
    data?.forEach(r => {
      grouped[r.date] = grouped[r.date] || [];
      grouped[r.date].push(r);
    });
    setPlanning(grouped);
  };

  // Edition inline
  const handleEdit = async (id) => {
    if (!editAliment) return;
    await supabase.from("repas_planifies").update({ aliment: editAliment }).eq("id", id);
    setIsEditing(null);
    setEditAliment("");
    // Recharge le planning
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data } = await supabase
      .from("repas_planifies")
      .select("*")
      .gte("date", start)
      .lte("date", end);
    const grouped = {};
    data?.forEach(r => {
      grouped[r.date] = grouped[r.date] || [];
      grouped[r.date].push(r);
    });
    setPlanning(grouped);
  };

  // Drag & drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    await supabase
      .from("repas_planifies")
      .update({ date: destination.droppableId })
      .eq("id", draggableId);
    // Recharge le planning
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data } = await supabase
      .from("repas_planifies")
      .select("*")
      .gte("date", start)
      .lte("date", end);
    const grouped = {};
    data?.forEach(r => {
      grouped[r.date] = grouped[r.date] || [];
      grouped[r.date].push(r);
    });
    setPlanning(grouped);
  };

  // Sauvegarde du mantra
  const handleMantraChange = (e) => {
    setMantra(e.target.value);
    localStorage.setItem("mantra", e.target.value);
  };

  // Sauvegarde objectif poids
  const handleObjectifPoidsChange = (e) => {
    setObjectifPoids(e.target.value);
    localStorage.setItem("objectifPoids", e.target.value);
  };

  // Import CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      delimiter: ";",
      complete: async (results) => {
        for (const row of results.data) {
          if (row.date && row.type && row.aliment) {
            await supabase.from("repas_planifies").insert([
              {
                date: row.date,
                type: row.type,
                aliment: row.aliment,
                categorie: row.categorie || null
              }
            ]);
          }
        }
        // Recharge le planning après import
        const start = new Date(year, month, 1).toISOString().slice(0, 10);
        const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
        const { data } = await supabase
          .from("repas_planifies")
          .select("*")
          .gte("date", start)
          .lte("date", end);
        const grouped = {};
        data?.forEach(r => {
          grouped[r.date] = grouped[r.date] || [];
          grouped[r.date].push(r);
        });
        setPlanning(grouped);
      }
    });
  };

  // Générer modèle CSV mensuel pré-rempli
  const handleDownloadModele = () => {
    const header = "date;type;aliment\n";
    let rows = "";
    days.forEach(d => {
      const dateStr = d.toISOString().slice(0, 10);
      typesRepas.forEach(t => {
        rows += `${dateStr};${t.nom};\n`;
      });
    });
    // Ajoute le BOM pour les accents et le bon séparateur
    const blob = new Blob(
      ["\uFEFF" + header + rows],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planning-${moisNoms[month]}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: 16,
          background: "#e3f2fd",
          color: "#1976d2",
          border: "none",
          borderRadius: 8,
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: 15,
          cursor: "pointer"
        }}
      >
        ⬅️ Retour
      </button>
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>🌟 Planning alimentaire du mois</h1>
      <div style={{
        margin: "16px 0 24px 0",
        textAlign: "center",
        background: "#e3f2fd",
        borderRadius: 12,
        padding: 16,
        fontWeight: 500,
        fontSize: 18
      }}>
        <span>🎯 <b>Ton mantra du mois :</b></span>
        <input
          value={mantra}
          onChange={handleMantraChange}
          placeholder="Ex : Je prends soin de moi chaque jour !"
          style={{
            marginLeft: 12,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #90caf9",
            width: 350,
            fontSize: 16
          }}
        />
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span>🎯 <b>Objectif perte de poids du mois :</b></span>
        <input
          value={objectifPoids}
          onChange={handleObjectifPoidsChange}
          placeholder="Ex : -2 kg"
          style={{
            marginLeft: 12,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #90caf9",
            width: 120,
            fontSize: 16
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}>⬅️ Mois précédent</button>
        <span style={{ fontWeight: 600, fontSize: 18 }}>
          {moisNoms[month]} {year}
        </span>
        <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}>Mois suivant ➡️</button>
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <button onClick={handleDownloadModele}
          style={{
            background: "#90caf9",
            color: "#1976d2",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            marginRight: 12
          }}>
          📥 Télécharger le modèle mensuel à remplir (Excel)
        </button>
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          style={{ marginLeft: 8 }}
        />
        <span style={{ marginLeft: 16, color: "#888" }}>ou importe ton planning Excel</span>
      </div>
      <div style={{
        marginBottom: 24,
        textAlign: "center",
        background: "#fffde7",
        borderRadius: 10,
        padding: 12,
        fontWeight: 500
      }}>
        <span>➕ <b>Ajoute un repas planifié :</b></span>
        <select value={type} onChange={e => setType(e.target.value)} style={{ marginLeft: 8 }}>
          {typesRepas.map(t => <option key={t.nom}>{t.nom}</option>)}
        </select>
        <input
          list="aliments"
          placeholder="Aliment"
          value={aliment}
          onChange={e => setAliment(e.target.value)}
          style={{ marginLeft: 8, minWidth: 120 }}
        />
        <datalist id="aliments">
          {suggestionsRef.map((a, i) => (
            <option key={i} value={a.nom}>{a.nom}</option>
          ))}
        </datalist>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={handleAdd} style={{ marginLeft: 8 }} disabled={loading}>Ajouter</button>
        <span style={{ marginLeft: 24 }}>Suggestions :</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            style={{
              marginLeft: 8,
              background: "#c8e6c9",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer"
            }}
            onClick={() => setAliment(s.aliment)}
          >
            {s.aliment} ({s.categorie})
          </button>
        ))}
      </div>
      {regle && (
        <div style={{
          background: "#fffde7",
          border: "1px solid #ffe082",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: "#795548",
          fontWeight: 500,
          maxWidth: 600,
          margin: "0 auto"
        }}>
          <span>📋 <b>Règle à respecter pour ce choix :</b> {regle}</span>
        </div>
      )}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <span style={{
          background: "#f8bbd0",
          borderRadius: 8,
          padding: "6px 18px",
          fontWeight: 600,
          color: "#ad1457"
        }}>
          {nbJoursPlanifies}/{days.length} jours planifiés ce mois-ci
        </span>
      </div>
      <div style={{ textAlign: "center", margin: "24px 0", fontWeight: 600 }}>
        <span>📊 Repas respectés cette semaine : {comparaison.semaineActuelle} <br />
          Semaine dernière : {comparaison.semainePrecedente}</span>
      </div>
      {!loading && nbJoursPlanifies < days.length && (
        <div style={{
          background: "#ffebee",
          color: "#c62828",
          border: "1px solid #ffcdd2",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontWeight: 600,
          textAlign: "center"
        }}>
          ⚠️ Il manque des repas planifiés pour certains jours du mois.<br />
          Plus tu planifies, plus tu progresses vers tes objectifs !
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            minWidth: 700,
            width: "100%",
            borderCollapse: "collapse",
            background: "#fafafa",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <thead>
              <tr>
                {joursSemaine.map(j => (
                  <th key={j} style={{
                    padding: 8,
                    background: "#e3f2fd",
                    border: "1px solid #90caf9",
                    fontWeight: 700,
                    fontSize: 16
                  }}>{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5].map(week => (
                <tr key={week}>
                  {joursSemaine.map((_, dayIdx) => {
                    const firstDay = new Date(year, month, 1).getDay() || 7;
                    const dayNum = week * 7 + dayIdx + 1 - (firstDay - 1);
                    const dateObj = new Date(year, month, dayNum);
                    const dateStr = dateObj.toISOString().slice(0, 10);
                    const isCurrentMonth = dateObj.getMonth() === month && dayNum > 0 && dayNum <= days.length;
                    return (
                      <td
                        key={dayIdx}
                        style={{
                          minWidth: 120,
                          minHeight: 80,
                          border: "1px solid #e0e0e0",
                          background: isCurrentMonth ? "#fff" : "#f0f0f0",
                          verticalAlign: "top",
                          position: "relative"
                        }}
                      >
                        {isCurrentMonth && (
                          <>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{dateObj.getDate()}</div>
                            <Droppable droppableId={dateStr}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {(planning[dateStr] || []).map((r, idx) => {
                                    const repasType = typesRepas.find(t => t.nom === r.type);
                                    return (
                                      <Draggable key={r.id} draggableId={r.id} index={idx}>
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              background: repasType?.color || "#fff",
                                              border: "1px solid #ccc",
                                              borderRadius: 8,
                                              padding: 6,
                                              marginBottom: 6,
                                              fontSize: 14,
                                              color: "#1976d2",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 8,
                                              ...provided.draggableProps.style
                                            }}
                                          >
                                            <span style={{ fontSize: 18 }}>{repasType?.emoji}</span>
                                            {isEditing === r.id ? (
                                              <>
                                                <input
                                                  value={editAliment}
                                                  onChange={e => setEditAliment(e.target.value)}
                                                  style={{ marginRight: 4, minWidth: 80 }}
                                                />
                                                <button
                                                  onClick={() => handleEdit(r.id)}
                                                  style={{ color: "#388e3c", marginRight: 4 }}
                                                  title="Valider"
                                                >✔️</button>
                                                <button onClick={() => setIsEditing(null)} style={{ color: "#c62828" }}>✖️</button>
                                              </>
                                            ) : (
                                              <>
                                                <b>{r.type}</b> : {r.aliment}
                                                <button
                                                  onClick={() => {
                                                    setIsEditing(r.id);
                                                    setEditAliment(r.aliment);
                                                  }}
                                                  style={{ background: "none", border: "none", color: "#1976d2", marginLeft: 4 }}
                                                  title="Modifier ce repas"
                                                >✏️</button>
                                                <button
                                                  onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await supabase.from("repas_planifies").delete().eq("id", r.id);
                                                    // Recharge le planning après suppression
                                                    const start = new Date(year, month, 1).toISOString().slice(0, 10);
                                                    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
                                                    const { data } = await supabase
                                                      .from("repas_planifies")
                                                      .select("*")
                                                      .gte("date", start)
                                                      .lte("date", end);
                                                    const grouped = {};
                                                    data?.forEach(r => {
                                                      grouped[r.date] = grouped[r.date] || [];
                                                      grouped[r.date].push(r);
                                                    });
                                                    setPlanning(grouped);
                                                  }}
                                                  style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#c62828",
                                                    cursor: "pointer",
                                                    fontSize: 18,
                                                    marginLeft: 4
                                                  }}
                                                  title="Supprimer ce repas"
                                                >
                                                  🗑️
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DragDropContext>
      <div style={{
        marginTop: 32,
        textAlign: "center",
        color: nbJoursPlanifies === days.length ? "#388e3c" : "#1976d2",
        fontWeight: 700,
        fontSize: 18
      }}>
        {nbJoursPlanifies === days.length ? (
          <div style={{
            background: "#c8e6c9",
            color: "#388e3c",
            borderRadius: 12,
            padding: 16,
            fontWeight: 700,
            fontSize: 22,
            animation: "pop 0.7s"
          }}>
            🏅 <b>Bravo !</b> Tu as planifié tous tes repas du mois !
          </div>
        ) : (
          "💡 Astuce : Plus tu planifies, plus tu progresses vers tes objectifs !"
        )}
      </div>
      <div style={{
        marginTop: 32,
        textAlign: "center",
        fontSize: 16,
        color: "#888"
      }}>
        <span>👑 <b>Le coach du mois :</b> "N’oublie pas, chaque petit pas compte ! Tu es sur la bonne voie."</span>
      </div>
      <button
        onClick={() => {
          const csv = Object.entries(planning)
            .flatMap(([date, repas]) =>
              repas.map(r => `${date};${r.type};${r.aliment}`)
            )
            .join("\n");
          const blob = new Blob(["\uFEFFDate;Type;Aliment\n" + csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "planning-alimentaire.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
        style={{
          margin: "24px auto 0",
          display: "block",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        📤 Exporter mon planning (.csv)
      </button>
      <style jsx global>{`
        @media (max-width: 600px) {
          input, select, button {
            width: 100% !important;
            margin: 8px 0 !important;
          }
        }
        .dragged-success {
          animation: pop 0.4s;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}