import { useState, useEffect } from 'react'
import FlipNumbers from 'react-flip-numbers'
import { supabase } from '../lib/supabaseClient'

// Référentiel d'aliments de base pour suggestions/calculs (modifiable)
const referentielAliments = [
  { nom: "Poulet", kcal: 120 },
  { nom: "Riz", kcal: 110 },
  { nom: "Épinard", kcal: 25 },
  { nom: "Haricots verts", kcal: 30 },
  { nom: "Banane", kcal: 90 },
  { nom: "Chocolat", kcal: 150 }
]

// Baromètre d'état alimentaire
const etatsAlimentaires = [
  { label: "Léger", value: "léger", icon: "🌱", color: "#a5d6a7" },
  { label: "Satisfait", value: "satisfait", icon: "😊", color: "#ffe082" },
  { label: "Lourd", value: "lourd", icon: "😑", color: "#ffcc80" },
  { label: "Ballonné", value: "ballonné", icon: "🤢", color: "#ef9a9a" },
  { label: "Je regrette", value: "je regrette", icon: "😔", color: "#b0bec5" },
  { label: "Je culpabilise", value: "je culpabilise", icon: "😟", color: "#b39ddb" },
  { label: "J’assume", value: "j’assume", icon: "💪", color: "#80cbc4" }
]

// Liste des signaux de satiété
const signauxSatieteList = [
  "Ventre qui se resserre",
  "Perte d’envie de manger",
  "Sensation de lourdeur",
  "Difficulté à avaler",
  "Autre"
]

export default function RepasBloc({
  type,
  date,
  planCategorie,
  routineCount = 0,
  onSave,
  repasSemaine = []
}) {
  // --- Repas complet ---
  const [repasComplet, setRepasComplet] = useState(false)
  const [composition, setComposition] = useState([
    { nom: "", quantite: "", kcal: "" }
  ])
  const [nbAssiettes, setNbAssiettes] = useState(1)

  // Calcule les kcal pour chaque aliment de l'assiette (repas complet)
  useEffect(() => {
    if (repasComplet) {
      setComposition(composition.map(aliment => {
        const ref = referentielAliments.find(a => a.nom.toLowerCase() === aliment.nom.toLowerCase())
        if (ref && aliment.quantite) {
          const q = parseFloat(aliment.quantite) || 0
          return { ...aliment, kcal: Math.round((q * ref.kcal) / 100) }
        }
        return { ...aliment, kcal: "" }
      }))
    }
    // eslint-disable-next-line
  }, [composition.map(a => a.nom).join(), composition.map(a => a.quantite).join(), repasComplet])

  const totalKcal1Assiette = composition.reduce((sum, a) => sum + (parseInt(a.kcal) || 0), 0)
  const totalKcalFinal = totalKcal1Assiette * (parseInt(nbAssiettes) || 1)

  // Ajouter/enlever/éditer des aliments dans l'assiette complète
  const addAliment = () => setComposition([...composition, { nom: "", quantite: "", kcal: "" }])
  const updateAliment = (idx, field, value) => {
    setComposition(composition.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  }
  const removeAliment = idx => setComposition(composition.filter((_, i) => i !== idx))

  // Reset si on décoche repas complet
  useEffect(() => {
    if (!repasComplet) {
      setComposition([{ nom: "", quantite: "", kcal: "" }])
      setNbAssiettes(1)
    }
  }, [repasComplet])

  // --- États classiques (repas non complet) ---
  const [aliment, setAliment] = useState('')
  const [categorie, setCategorie] = useState('')
  const [quantite, setQuantite] = useState('')
  const [kcal, setKcal] = useState('')
  const [estExtra, setEstExtra] = useState(false)
  const [satiete, setSatiete] = useState('')
  const [pourquoi, setPourquoi] = useState('')
  const [ressenti, setRessenti] = useState('')
  const [detailsSignaux, setDetailsSignaux] = useState([])
  const [reactBloc, setReactBloc] = useState([])
  const [showDefi, setShowDefi] = useState(false)

  // Liste des repas enregistrés pour ce type et cette date
  const [repasEnregistres, setRepasEnregistres] = useState([])

  // --- Compteur d'extras restants cette semaine ---
  const quota = 3 // quota hebdo d'extras, adapte selon ton besoin
  const extrasCount = repasSemaine.filter(r => r.est_extra).length
  const extrasRestants = Math.max(0, quota - extrasCount)

  // Charger les repas déjà enregistrés pour ce type et cette date
  useEffect(() => {
    const fetchRepas = async () => {
      const { data, error } = await supabase
        .from('repas_reels')
        .select('*')
        .eq('type', type)
        .eq('date', date)
        .order('id', { ascending: true });
      if (!error) setRepasEnregistres(data || []);
    };
    fetchRepas();
  }, [type, date]);

  // Suggestion automatique de catégorie et kcal selon l'aliment choisi (référentiel)
  useEffect(() => {
    if (!repasComplet) {
      const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
      if (found) {
        setCategorie(found.categorie || "")
        setKcal(found.kcal)
        setEstExtra(found.categorie === "extra")
      }
    }
    // eslint-disable-next-line
  }, [aliment])

  // Calcul automatique des kcal selon la quantité et l'aliment (référentiel)
  useEffect(() => {
    if (!repasComplet) {
      const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
      if (found && quantite) {
        const quantiteNum = parseFloat(quantite)
        setKcal((quantiteNum * found.kcal / 100).toFixed(0))
      } else if (!found) {
        setKcal('')
      }
    }
    // eslint-disable-next-line
  }, [aliment, quantite])

  // --- AJOUT AUTOMATIQUE DES KCAL POUR ALIMENTS NON RÉFÉRENCÉS ---
  // (à compléter si tu veux l'API OpenFoodFacts/Nutritionix ici)

  // --- Feedbacks utilisateurs/routines (peut être adapté) ---
  useEffect(() => {
    const rules = [
      {
        check: ({ estExtra, extrasRestants }) => estExtra && extrasRestants <= 0,
        type: "challenge",
        message: "Tu as dépassé ton quota d'extras cette semaine. Prends un instant pour te demander : est-ce le bon moment pour ce plaisir ? Tu pourrais le planifier pour un autre moment, pour le savourer pleinement et sans culpabilité."
      },
      {
        check: ({ satiete }) => satiete === "non",
        type: "defi",
        message: "Défi : Essaie d'écouter ta satiété sur le prochain repas."
      },
      {
        check: ({ categorie, planCategorie }) => categorie !== planCategorie && categorie && planCategorie,
        type: "suggestion",
        message: "Tu as adapté ton repas, pense à garder l’équilibre des catégories."
      },
      {
        check: ({ routineCount }) => routineCount >= 3,
        type: "feedback",
        message: "Bravo, tu ancre ta routine !"
      }
    ]
    const context = { estExtra, satiete, categorie, planCategorie, routineCount, extrasRestants }
    const blocs = rules.filter(rule => rule.check(context))
    setReactBloc(blocs)
  }, [estExtra, satiete, categorie, planCategorie, routineCount, extrasRestants])

  // --- ENREGISTREMENT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (repasComplet) {
      await onSave && onSave({
        type, date,
        aliment: composition.map(a => `${a.quantite}g ${a.nom}`).join(" + "),
        categorie: "Repas complet",
        quantite: `${nbAssiettes} assiette${nbAssiettes > 1 ? "s" : ""}`,
        kcal: totalKcalFinal,
        composition,
        repas_complet: true,
        nb_assiettes: nbAssiettes,
        satiete, pourquoi, ressenti,
        details_signaux: detailsSignaux
      });
      setRepasComplet(false);
      setComposition([{ nom: "", quantite: "", kcal: "" }]);
      setNbAssiettes(1);
      setSatiete('');
      setPourquoi('');
      setRessenti('');
      setDetailsSignaux([]);
      return;
    }
    // Repas classique
    await onSave && onSave({
      type, date, aliment, categorie, quantite, kcal,
      est_extra: estExtra,
      satiete, pourquoi, ressenti,
      details_signaux: detailsSignaux,
      regle_respectee: planCategorie && categorie && planCategorie === categorie
    })
    setAliment('')
    setCategorie('')
    setQuantite('')
    setKcal('')
    setEstExtra(false)
    setSatiete('')
    setPourquoi('')
    setRessenti('')
    setDetailsSignaux([])
    // Recharge la liste après ajout
    const { data } = await supabase
      .from('repas_reels')
      .select('*')
      .eq('type', type)
      .eq('date', date)
      .order('id', { ascending: true });
    setRepasEnregistres(data || []);
  }

  // Sélection d'un état alimentaire dans le baromètre
  const handleSelectEtat = (value) => setRessenti(value)

  // Gestion des signaux de satiété ignorés
  const handleCheckSignal = (signal) => {
    if (detailsSignaux.includes(signal)) {
      setDetailsSignaux(detailsSignaux.filter(s => s !== signal))
    } else {
      setDetailsSignaux([...detailsSignaux, signal])
    }
  }

  return (
    <div>
      {/* Liste des repas déjà enregistrés */}
      {repasEnregistres.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: "8px 0 8px 0" }}>Repas enregistrés :</h4>
          <ul style={{ paddingLeft: 0 }}>
            {repasEnregistres.map(repas => (
              <li key={repas.id} style={{
                listStyle: "none",
                background: "#f5f5f5",
                borderRadius: 8,
                marginBottom: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>
                  <b>
                    {repas.repas_complet
                      ? `Repas complet (${repas.nb_assiettes} assiette${repas.nb_assiettes > 1 ? "s" : ""})`
                      : repas.aliment}
                  </b> — {repas.categorie} — {repas.quantite} — {repas.kcal} kcal
                </span>
                {/* Tu peux ajouter un bouton de suppression ou édition ici */}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compteur flipboard stylisé pour extras restants */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Extras restants</span>
        <FlipNumbers
          height={40}
          width={30}
          color={extrasRestants > 0 ? "#1976d2" : "#b71c1c"}
          background="#fff"
          play
          numbers={`${extrasRestants}`}
        />
        <span style={{ color: '#888', marginLeft: 8 }}>/ {quota}</span>
      </div>

      {/* Option Repas complet */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={repasComplet}
            onChange={e => setRepasComplet(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Repas complet (assiette équilibrée)
        </label>
      </div>

      {/* Bloc dynamique pour REPAS COMPLET */}
      {repasComplet && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3>{type} du {date}</h3>
          <div>
            <b>Compose ton assiette pour 1 assiette :</b>
            {composition.map((aliment, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <input
                  list="aliments"
                  placeholder="Aliment"
                  value={aliment.nom}
                  onChange={e => updateAliment(idx, "nom", e.target.value)}
                  style={{ width: 100 }}
                  required
                />
                <datalist id="aliments">
                  {referentielAliments.map(a => <option value={a.nom} key={a.nom} />)}
                </datalist>
                <input
                  type="number"
                  placeholder="Quantité (g)"
                  value={aliment.quantite}
                  onChange={e => updateAliment(idx, "quantite", e.target.value)}
                  style={{ width: 80 }}
                  required
                />
                <span>{aliment.kcal ? `${aliment.kcal} kcal` : ""}</span>
                {composition.length > 1 && (
                  <button type="button" onClick={() => removeAliment(idx)} style={{ color: "red" }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAliment} style={{ marginTop: 4 }}>Ajouter un aliment</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <b>Calories pour 1 assiette :</b> {totalKcal1Assiette} kcal
          </div>
          <div style={{ marginTop: 10 }}>
            <label>
              Nombre d’assiettes :
              <input
                type="number"
                min={1}
                max={5}
                value={nbAssiettes}
                onChange={e => setNbAssiettes(e.target.value)}
                style={{ width: 50, marginLeft: 8 }}
                required
              />
            </label>
          </div>
          <div style={{ marginTop: 10 }}>
            <b>Calories totales :</b> {totalKcalFinal} kcal
          </div>
          <label>Satiété respectée ?</label>
          <select value={satiete} onChange={e => setSatiete(e.target.value)} required>
            <option value="">Choisir…</option>
            <option value="oui">Oui, j’ai respecté ma satiété</option>
            <option value="non">Non, j’ai dépassé ma satiété</option>
            <option value="pas de faim">Je n’ai pas mangé par faim</option>
          </select>
          {/* Suite logique si NON */}
          {satiete === "non" && (
            <>
              <label>Quels signaux de satiété as-tu ignorés ?</label>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
                {signauxSatieteList.map(signal => (
                  <label key={signal} style={{ fontWeight: "normal" }}>
                    <input
                      type="checkbox"
                      checked={detailsSignaux.includes(signal)}
                      onChange={() => handleCheckSignal(signal)}
                    />
                    {signal}
                  </label>
                ))}
              </div>
              <label>Pourquoi as-tu continué à manger ?</label>
              <input
                value={pourquoi}
                onChange={e => setPourquoi(e.target.value)}
                placeholder="Ex : gourmandise, stress, habitude…"
              />
            </>
          )}
          {/* Suite logique si PAS DE FAIM */}
          {satiete === "pas de faim" && (
            <>
              <label>Pourquoi as-tu mangé ?</label>
              <input
                value={pourquoi}
                onChange={e => setPourquoi(e.target.value)}
                placeholder="Ex : stress, habitude, social…"
              />
            </>
          )}
          {/* Baromètre d'état alimentaire */}
          <label style={{ marginTop: 16, display: "block" }}>Ressenti physique après le repas</label>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {etatsAlimentaires.map(etat => (
              <button
                key={etat.value}
                type="button"
                onClick={() => handleSelectEtat(etat.value)}
                style={{
                  background: ressenti === etat.value ? etat.color : "#f5f5f5",
                  border: ressenti === etat.value ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  fontSize: "2rem",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                aria-label={etat.label}
                title={etat.label}
              >
                {etat.icon}
              </button>
            ))}
          </div>
          {ressenti && (
            <div style={{ marginBottom: 16, color: "#1976d2" }}>
              Ton ressenti : <b>{etatsAlimentaires.find(e => e.value === ressenti)?.label}</b>
            </div>
          )}
          <button type="submit" style={{ marginTop: 16 }}>Enregistrer ce repas</button>
        </form>
      )}

      {/* Formulaire classique si non repas complet */}
      {!repasComplet && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3>{type} du {date}</h3>
          <label>Aliment mangé</label>
          <input
            value={aliment}
            onChange={e => setAliment(e.target.value)}
            placeholder="Saisissez un aliment"
            autoComplete="off"
            required
            style={{ marginBottom: 0 }}
          />
          <label>Catégorie</label>
          <input
            list="categories"
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            required
          />
          <datalist id="categories">
            <option value="féculent" />
            <option value="protéine" />
            <option value="légume" />
            <option value="fruit" />
            <option value="extra" />
            <option value="poisson" />
            <option value="volaille" />
          </datalist>
          <label>Quantité</label>
          <input value={quantite} onChange={e => setQuantite(e.target.value)} required />

          <label>Kcal</label>
          <input value={kcal} onChange={e => setKcal(e.target.value)} />

          <label>
            <input type="checkbox" checked={estExtra} onChange={e => setEstExtra(e.target.checked)} />
            Cet aliment est-il un extra ?
          </label>
          <label>Satiété respectée ?</label>
          <select value={satiete} onChange={e => setSatiete(e.target.value)} required>
            <option value="">Choisir…</option>
            <option value="oui">Oui, j’ai respecté ma satiété</option>
            <option value="non">Non, j’ai dépassé ma satiété</option>
            <option value="pas de faim">Je n’ai pas mangé par faim</option>
          </select>
          {/* Suite logique si NON */}
          {satiete === "non" && (
            <>
              <label>Quels signaux de satiété as-tu ignorés ?</label>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
                {signauxSatieteList.map(signal => (
                  <label key={signal} style={{ fontWeight: "normal" }}>
                    <input
                      type="checkbox"
                      checked={detailsSignaux.includes(signal)}
                      onChange={() => handleCheckSignal(signal)}
                    />
                    {signal}
                  </label>
                ))}
              </div>
              <label>Pourquoi as-tu continué à manger ?</label>
              <input
                value={pourquoi}
                onChange={e => setPourquoi(e.target.value)}
                placeholder="Ex : gourmandise, stress, habitude…"
              />
            </>
          )}
          {/* Suite logique si PAS DE FAIM */}
          {satiete === "pas de faim" && (
            <>
              <label>Pourquoi as-tu mangé ?</label>
              <input
                value={pourquoi}
                onChange={e => setPourquoi(e.target.value)}
                placeholder="Ex : stress, habitude, social…"
              />
            </>
          )}
          {/* Baromètre d'état alimentaire */}
          <label style={{ marginTop: 16, display: "block" }}>Ressenti physique après le repas</label>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {etatsAlimentaires.map(etat => (
              <button
                key={etat.value}
                type="button"
                onClick={() => handleSelectEtat(etat.value)}
                style={{
                  background: ressenti === etat.value ? etat.color : "#f5f5f5",
                  border: ressenti === etat.value ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  fontSize: "2rem",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                aria-label={etat.label}
                title={etat.label}
              >
                {etat.icon}
              </button>
            ))}
          </div>
          {ressenti && (
            <div style={{ marginBottom: 16, color: "#1976d2" }}>
              Ton ressenti : <b>{etatsAlimentaires.find(e => e.value === ressenti)?.label}</b>
            </div>
          )}
          {/* Affichage dynamique des feedbacks/challenges/défis */}
          {reactBloc.map((bloc, i) => (
            <div key={i} style={{
              background: bloc.type === "challenge" ? "#ffe0b2" :
                          bloc.type === "defi" ? "#e1f5fe" :
                          bloc.type === "feedback" ? "#e8f5e9" : "#f3e5f5",
              color: "#222", borderRadius: 8, padding: 10, margin: "12px 0"
            }}>
              {bloc.message}
            </div>
          ))}
          <button type="submit" style={{ marginTop: 16 }}>Enregistrer ce repas</button>
        </form>
      )}
    </div>
  )
}