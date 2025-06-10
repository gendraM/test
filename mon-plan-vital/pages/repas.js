import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Repas() {
  const [repas, setRepas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepas();
  }, []);

  const fetchRepas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("repas_reels")
      .select("*")
      .order("date", { ascending: false })
      .order("id", { ascending: false });
    if (!error) setRepas(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce repas ?")) return;
    await supabase.from("repas_reels").delete().eq("id", id);
    fetchRepas();
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>🗑️ Supprimer des repas</h1>
      {loading ? (
        <div>Chargement…</div>
      ) : repas.length === 0 ? (
        <div>Aucun repas enregistré.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Aliment</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Catégorie</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Quantité</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Kcal</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {repas.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.date}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.type}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.aliment}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.categorie}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.quantite}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.kcal}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button
                    style={{
                      background: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDelete(r.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}