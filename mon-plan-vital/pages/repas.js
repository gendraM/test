import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Un composant pour le formulaire d'édition/ajout
function RepasForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      date: "",
      type: "",
      aliment: "",
      categorie: "",
      quantite: "",
      kcal: "",
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: "#f9f9f9", padding: 16, borderRadius: 10 }}>
      <h2>{initial?.id ? "Modifier le repas" : "Ajouter un repas"}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <input
          name="date"
          type="date"
          value={form.date || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          name="type"
          placeholder="Type (petit-déj, déjeuner, etc.)"
          value={form.type || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          name="aliment"
          placeholder="Aliment"
          value={form.aliment || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          name="categorie"
          placeholder="Catégorie"
          value={form.categorie || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          name="quantite"
          placeholder="Quantité"
          value={form.quantite || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 80 }}
        />
        <input
          name="kcal"
          placeholder="Kcal"
          type="number"
          value={form.kcal || ""}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 80 }}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <button type="submit" style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
          {initial?.id ? "Enregistrer" : "Ajouter"}
        </button>
        <button type="button" onClick={onCancel} style={{ background: "#ccc", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function Repas() {
  const [repas, setRepas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRepas, setEditRepas] = useState(null); // Pour le repas en cours d'édition

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

  const handleEdit = (repasToEdit) => {
    setEditRepas(repasToEdit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSave = async (form) => {
    if (editRepas?.id) {
      // Edition
      await supabase
        .from("repas_reels")
        .update({
          date: form.date,
          type: form.type,
          aliment: form.aliment,
          categorie: form.categorie,
          quantite: form.quantite,
          kcal: form.kcal,
        })
        .eq("id", editRepas.id);
    }
    // Si besoin d'ajouter un repas, décommente ici :
    // else {
    //   await supabase.from("repas_reels").insert([form]);
    // }
    setEditRepas(null);
    fetchRepas();
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>🗑️ Gérer mes repas</h1>

      {/* Formulaire d'édition (s'affiche uniquement si on est en mode édition) */}
      {editRepas && (
        <RepasForm
          initial={editRepas}
          onCancel={() => setEditRepas(null)}
          onSave={handleFormSave}
        />
      )}

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
                      background: "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 12px",
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                    onClick={() => handleEdit(r)}
                  >
                    Modifier
                  </button>
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