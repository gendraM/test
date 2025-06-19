import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import FormulaireProfil from '../components/FormulaireProfil'
import Link from "next/link";

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ProfilPage() {
  const [poidsDepart, setPoidsDepart] = useState('')
  const [taille, setTaille] = useState('')
  const [age, setAge] = useState('')
  const [objectif, setObjectif] = useState('')
  const [pourquoi, setPourquoi] = useState('')
  const [delai, setDelai] = useState('')
  const [message, setMessage] = useState('')
  const [poidsActuel, setPoidsActuel] = useState(null)
  const [afficherPoidsActuel, setAfficherPoidsActuel] = useState(false)
  const [texteProgression, setTexteProgression] = useState('')
  const [besoinCaloriqueEntretien, setBesoinCaloriqueEntretien] = useState(null)
  const [besoinObjectif, setBesoinObjectif] = useState(null)
  const [dernierProfil, setDernierProfil] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // Fonction pour récupérer le dernier profil (utilisable partout)
  const fetchDernierProfil = async () => {
    const { data, error } = await supabase
      .from('profil')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!error && data && data.length > 0) {
      setDernierProfil(data[0])
      if (!editMode) {
        setPoidsDepart(data[0].poids_de_depart?.toString() || '')
        setTaille(data[0].taille?.toString() || '')
        setAge(data[0].age?.toString() || '')
        setObjectif(data[0].objectif?.toString() || '')
        setPourquoi(data[0].pourquoi || '')
        setDelai(data[0].delai?.toString() || '')
      }
    }
  }

  // Récupération du dernier poids saisi dans historique_poids
  useEffect(() => {
    const fetchPoidsActuel = async () => {
      const { data, error } = await supabase
        .from('historique_poids')
        .select('poids')
        .order('date', { ascending: false })
        .limit(1)
      if (!error && data && data.length > 0) {
        const poids = parseFloat(data[0].poids)
        setPoidsActuel(poids)
      }
    }
    fetchPoidsActuel()
  }, [])

  // Calcul besoin calorique entretien et objectif (pour femme)
  useEffect(() => {
    const poids = parseFloat(poidsDepart)
    const t = parseFloat(taille)
    const a = parseFloat(age)
    const obj = parseFloat(objectif)
    const nbSemaines = parseFloat(delai) * 4.345

    if (!isNaN(poids) && !isNaN(t) && !isNaN(a)) {
      const mb = Math.round(10 * poids + 6.25 * t - 5 * a - 161)
      const entretien = Math.round(mb * 1.5)
      setBesoinCaloriqueEntretien(entretien)

      if (!isNaN(obj) && !isNaN(nbSemaines) && nbSemaines > 0 && poids > obj) {
        const perte = poids - obj
        const deficitQuotidien = (perte * 7700) / (nbSemaines * 7)
        const objectifCal = Math.round(entretien - deficitQuotidien)
        setBesoinObjectif(objectifCal)
      } else {
        setBesoinObjectif(null)
      }
    } else {
      setBesoinCaloriqueEntretien(null)
      setBesoinObjectif(null)
    }
  }, [poidsDepart, taille, age, objectif, delai])

  // Logique d’affichage dynamique
  useEffect(() => {
    const poidsD = parseFloat(poidsDepart)
    const obj = parseFloat(objectif)
    if (poidsActuel && poidsDepart && objectif && !isNaN(poidsD) && !isNaN(obj)) {
      const perte = poidsD - poidsActuel
      const reste = poidsActuel - obj

      if (perte >= 6) {
        setAfficherPoidsActuel(true)
        setTexteProgression(`Tu as déjà perdu ${perte.toFixed(1)} kg. Il te reste ${reste.toFixed(1)} kg pour atteindre ton objectif.`)
      } else {
        setAfficherPoidsActuel(false)
        setTexteProgression(`Chaque pas compte. Tu avances vers ton poids de forme.`)
      }
    }
  }, [poidsActuel, poidsDepart, objectif])

  // Récupération du dernier profil enregistré pour affichage (avec délai)
  useEffect(() => {
    fetchDernierProfil()
  }, [message, editMode])

  // Gestion de l'enregistrement ou modification du profil — MAJ intégrée ici !
  const handleSubmit = async (e) => {
    e.preventDefault();

    const poids = parseFloat(poidsDepart)
    const t = parseFloat(taille)
    const a = parseFloat(age)
    const obj = parseFloat(objectif)
    const d = delai

    if (isNaN(poids) || isNaN(t) || isNaN(a) || isNaN(obj) || !pourquoi || !delai) {
      setMessage("Merci de remplir tous les champs correctement.")
      return
    }

    // Calcul besoin calorique entretien pour femme
    const mb = Math.round(10 * poids + 6.25 * t - 5 * a - 161)
    const besoinCalorique = Math.round(mb * 1.5)

    // Calcul objectif calorique perte de poids (c'est la valeur affichée "vise 1880 kcal par jour")
    let besoinObjectif = null
    const nbSemaines = parseFloat(d) * 4.345
    if (!isNaN(obj) && !isNaN(nbSemaines) && nbSemaines > 0 && poids > obj) {
      const perte = poids - obj
      const deficitQuotidien = (perte * 7700) / (nbSemaines * 7)
      besoinObjectif = Math.round(besoinCalorique - deficitQuotidien)
    }

    let errorProfil = null

    if (editMode && dernierProfil) {
      // Mise à jour du profil existant
      const { error } = await supabase
        .from('profil')
        .update({
          poids_de_depart: poids,
          taille: t,
          age: a,
          objectif: obj,
          besoin_calorique: besoinCalorique,
          besoin_objectif: besoinObjectif, // <-- AJOUT ICI !
          pourquoi,
          delai: d
        })
        .eq('id', dernierProfil.id)
      errorProfil = error
    } else {
      // Insertion dans la table profil
      const { error } = await supabase.from('profil').insert({
        poids_de_depart: poids,
        taille: t,
        age: a,
        objectif: obj,
        besoin_calorique: besoinCalorique,
        besoin_objectif: besoinObjectif, // <-- AJOUT ICI !
        pourquoi,
        delai: d
      })
      errorProfil = error

      // Insertion dans la table historique_poids (uniquement à la création)
      await supabase.from('historique_poids').insert({
        poids: poids,
        date: new Date().toISOString().slice(0, 10) // format YYYY-MM-DD
      })
    }

    if (errorProfil) {
      setMessage("Erreur lors de l'enregistrement : " + errorProfil.message)
    } else {
      setMessage("Profil enregistré avec succès !")
      setEditMode(false)
      setTimeout(() => {
        fetchDernierProfil()
      }, 400) // délai pour laisser le temps à Supabase
    }
  }

  // Styles personnalisés (inchangés)
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 600,
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      background: '#f7fafc',
      borderRadius: 16,
      boxShadow: '0 2px 16px #e0e0e0'
    },
    title: {
      color: '#2c3e50',
      fontWeight: 'bold',
      fontSize: '2.5rem',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    sectionTitle: {
      color: '#2980b9',
      fontWeight: 'bold',
      fontSize: '1.2rem',
      margin: '1.5rem 0 0.5rem 0'
    },
    formBlock: {
      background: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 6px #e0e0e0'
    },
    button: {
      background: 'linear-gradient(90deg, #27ae60 0%, #2980b9 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: 24,
      padding: '0.8rem 2rem',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 8px #d0e6f7'
    },
    editButton: {
      background: '#f39c12',
      color: '#fff',
      border: 'none',
      borderRadius: 16,
      padding: '0.5rem 1.2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginLeft: '1rem'
    },
    message: {
      fontWeight: 'bold',
      padding: '0.7rem 1rem',
      borderRadius: 8,
      margin: '1rem 0',
      background: message.includes('succès') ? '#eafaf1' : '#fdecea',
      color: message.includes('succès') ? '#27ae60' : '#c0392b',
      border: message.includes('succès') ? '1px solid #27ae60' : '1px solid #c0392b'
    },
    recapBlock: {
      background: '#fff',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '2rem',
      boxShadow: '0 2px 12px #e0e0e0'
    },
    recapTitle: {
      color: '#4CAF50',
      fontWeight: 'bold',
      fontSize: '1.5rem',
      marginBottom: '1rem'
    },
    recapList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    recapLabel: {
      fontWeight: 'bold',
      color: '#222'
    },
    recapDate: {
      color: '#888',
      fontStyle: 'italic',
      marginTop: '0.5rem'
    },
    motivation: {
      fontStyle: 'italic',
      color: '#2980b9',
      marginTop: '1rem',
      fontSize: '1.1rem'
    },
    suivreButton: {
      background: '#27ae60',
      color: '#fff',
      border: 'none',
      borderRadius: 16,
      padding: '0.7rem 1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1.5rem',
      fontSize: '1.1rem'
    }
  }

  // Navigation vers la page de suivi (à créer)
  const goToSuivi = () => {
    window.location.href = '/suivi-poids'
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue sur ton espace forme !</h1>
      {!dernierProfil || editMode ? (
        <div style={styles.formBlock}>
          <div style={styles.sectionTitle}>Informations de départ</div>
          <FormulaireProfil
            poids={poidsDepart}
            setPoids={setPoidsDepart}
            taille={taille}
            setTaille={setTaille}
            age={age}
            setAge={setAge}
            objectif={objectif}
            setObjectif={setObjectif}
            pourquoi={pourquoi}
            setPourquoi={setPourquoi}
            delai={delai}
            setDelai={setDelai}
            handleSubmit={handleSubmit}
            buttonLabel={editMode ? "Mettre à jour mon profil" : "Enregistrer mon profil"}
            buttonStyle={styles.button}
          />
        </div>
      ) : null}

      {message && <div style={styles.message}>{message}</div>}

      {besoinCaloriqueEntretien && (
        <div style={styles.formBlock}>
          <b style={styles.recapLabel}>Besoin calorique d'entretien :</b> {besoinCaloriqueEntretien} kcal
        </div>
      )}

      {besoinObjectif && (
        <div style={styles.formBlock}>
          <b style={styles.recapLabel}>Pour atteindre ton objectif en {delai} mois, vise {besoinObjectif} kcal par jour.</b>
        </div>
      )}

      {dernierProfil && !editMode && (
        <div style={styles.recapBlock}>
          <div style={styles.recapTitle}>Dernier profil enregistré</div>
          <ul style={styles.recapList}>
            <li><span style={styles.recapLabel}>Poids de départ :</span> {dernierProfil.poids_de_depart} kg</li>
            <li><span style={styles.recapLabel}>Taille :</span> {dernierProfil.taille} cm</li>
            <li><span style={styles.recapLabel}>Âge :</span> {dernierProfil.age} ans</li>
            <li><span style={styles.recapLabel}>Objectif :</span> {dernierProfil.objectif} kg</li>
            <li><span style={styles.recapLabel}>Délai :</span> {dernierProfil.delai} mois</li>
            <li><span style={styles.recapLabel}>Pourquoi :</span> {dernierProfil.pourquoi}</li>
            <li><span style={styles.recapLabel}>Besoin calorique :</span> {dernierProfil.besoin_calorique} kcal</li>
            {typeof dernierProfil.besoin_objectif === "number" && dernierProfil.besoin_objectif > 0 && (
              <li><span style={styles.recapLabel}>Objectif calorique (perte de poids) :</span> {dernierProfil.besoin_objectif} kcal</li>
            )}
          </ul>
          <div style={styles.recapDate}>
            Profil créé le {formatDateTime(dernierProfil.created_at)}
          </div>
          <div style={styles.motivation}>
            Courage ! En respectant ce plan, tu atteindras ton objectif de {dernierProfil.objectif} kg en {dernierProfil.delai} mois.
          </div>
          <button style={styles.editButton} onClick={() => setEditMode(true)}>
            Modifier mon profil
          </button>
          <button style={styles.suivreButton} onClick={goToSuivi}>
            Commencer mon suivi
          </button>
        </div>
      )}

      <Link href="/jeune">
        <button style={{
          background: "#1976d2", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer"
        }}>
          Commencer un jeune
        </button>
      </Link>
    </div>
  )
}