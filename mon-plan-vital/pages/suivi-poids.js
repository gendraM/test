import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function formatDateFr(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export default function SuiviPoids() {
  const [poids, setPoids] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [historique, setHistorique] = useState([])
  const [poidsActuel, setPoidsActuel] = useState(null)
  const [poidsDepart, setPoidsDepart] = useState(null)
  const [objectif, setObjectif] = useState(null)
  const [message, setMessage] = useState('')
  const [progression, setProgression] = useState(null)
  const [reste, setReste] = useState(null)
  const [pourquoi, setPourquoi] = useState('')
  const [showAnchor, setShowAnchor] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [editId, setEditId] = useState(null)

  // Récupère le profil pour poids de départ, objectif, pourquoi
  useEffect(() => {
    const fetchProfil = async () => {
      const { data, error } = await supabase
        .from('profil')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
      if (!error && data && data.length > 0) {
        setPoidsDepart(parseFloat(data[0].poids_de_depart))
        setObjectif(parseFloat(data[0].objectif))
        setPourquoi(data[0].pourquoi || '')
      }
    }
    fetchProfil()
  }, [])

  // Récupère l'historique des pesées
  useEffect(() => {
    const fetchHistorique = async () => {
      const { data, error } = await supabase
        .from('historique_poids')
        .select('*')
        .order('date', { ascending: false })
      if (!error && data) {
        setHistorique(data)
        if (data.length > 0) {
          setPoidsActuel(parseFloat(data[0].poids))
        }
      }
    }
    fetchHistorique()
  }, [message])

  // Calcul progression
  useEffect(() => {
    if (poidsDepart && poidsActuel && objectif) {
      const total = poidsDepart - objectif
      const perdu = poidsDepart - poidsActuel
      const reste = poidsActuel - objectif
      const percent = total > 0 ? Math.max(0, Math.min(100, (perdu / total) * 100)) : 0
      setProgression(percent)
      setReste(reste)
    }
  }, [poidsDepart, poidsActuel, objectif])

  // Gestion du rappel conditionnel (à adapter selon tes vrais critères)
  useEffect(() => {
    if (historique.length > 10) {
      setShowReminder(true)
    } else {
      setShowReminder(false)
    }
  }, [historique])

  // Actions immédiates après pesée
  const actions = [
    { label: "Préparer mon prochain repas", onClick: () => alert("Prends un instant pour planifier ton prochain repas.") },
    { label: "Relire mon objectif", onClick: () => alert("Ton objectif : " + objectif + " kg.") },
    { label: "Me recentrer sur mon pourquoi", onClick: () => alert("Ton pourquoi : " + pourquoi) }
  ]

  // Modification d'une pesée
  const handleEdit = (item) => {
    setEditId(item.id)
    setPoids(item.poids)
    setDate(item.date)
  }

  // Suppression d'une pesée
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette pesée ?")) return
    const { error } = await supabase
      .from('historique_poids')
      .delete()
      .eq('id', id)
    if (error) setMessage("Erreur lors de la suppression : " + error.message)
    else setMessage("Pesée supprimée.")
  }

  // Gestion de la soumission du poids (ajout ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!poids || !date) {
      setMessage("Merci d'indiquer ton poids et la date.")
      return
    }
    if (editId) {
      // Modification
      const { error } = await supabase
        .from('historique_poids')
        .update({ poids, date })
        .eq('id', editId)
      if (error) {
        setMessage("Erreur lors de la modification : " + error.message)
      } else {
        setMessage("Pesée modifiée.")
        setShowAnchor(true)
        setPoids('')
        setDate(new Date().toISOString().slice(0, 10))
        setEditId(null)
      }
    } else {
      // Ajout
      const { error } = await supabase.from('historique_poids').insert({ poids, date })
      if (error) {
        setMessage("Erreur lors de l'enregistrement : " + error.message)
      } else {
        setMessage("Poids enregistré.")
        setShowAnchor(true)
        setPoids('')
        setDate(new Date().toISOString().slice(0, 10))
      }
    }
  }

  // Styles sobres et doux
  const styles = {
    container: {
      maxWidth: 540,
      margin: '0 auto',
      padding: '2rem',
      background: '#f7fafc',
      borderRadius: 18,
      boxShadow: '0 2px 16px #e0e0e0',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textAlign: 'center',
      color: '#2c3e50',
      fontWeight: 'bold',
      fontSize: '2.2rem',
      marginBottom: 0
    },
    subtitle: {
      textAlign: 'center',
      color: '#2980b9',
      fontSize: '1.1rem',
      marginBottom: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      background: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 1px 6px #e0e0e0'
    },
    label: {
      fontWeight: 'bold',
      color: '#222'
    },
    input: {
      padding: '0.7rem',
      borderRadius: 8,
      border: '1px solid #b0c4de',
      fontSize: '1rem'
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
      alignSelf: 'center',
      boxShadow: '0 2px 8px #d0e6f7'
    },
    poidsActuel: {
      background: '#eafaf1',
      border: '2px solid #27ae60',
      borderRadius: 14,
      padding: '1.2rem',
      textAlign: 'center',
      fontSize: '1.3rem',
      color: '#222',
      fontWeight: 'bold',
      marginBottom: '1.2rem'
    },
    progressionBlock: {
      background: '#fff',
      borderRadius: 12,
      padding: '1.2rem',
      marginBottom: '1.2rem',
      boxShadow: '0 1px 6px #e0e0e0',
      textAlign: 'center'
    },
    barre: {
      width: '100%',
      height: 16,
      background: '#e0e0e0',
      borderRadius: 8,
      margin: '0.7rem 0'
    },
    barreInterne: {
      height: 16,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #27ae60 0%, #2980b9 100%)'
    },
    historiqueBlock: {
      background: '#fff',
      borderRadius: 12,
      padding: '1.2rem',
      marginBottom: '1.2rem',
      boxShadow: '0 1px 6px #e0e0e0'
    },
    historiqueTitle: {
      color: '#2980b9',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      marginBottom: '0.7rem'
    },
    historiqueList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    historiqueItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '1rem'
    },
    anchorBlock: {
      background: '#f7f7f7',
      border: '1px solid #b0c4de',
      borderRadius: 10,
      padding: '1rem',
      margin: '1.2rem 0',
      color: '#2980b9',
      fontStyle: 'italic',
      textAlign: 'center'
    },
    reminderBlock: {
      background: '#f9fbe7',
      border: '1px solid #cddc39',
      borderRadius: 10,
      padding: '1rem',
      margin: '1.2rem 0',
      color: '#827717',
      textAlign: 'center'
    },
    actionsBlock: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      margin: '1.2rem 0'
    },
    actionButton: {
      background: '#2980b9',
      color: '#fff',
      border: 'none',
      borderRadius: 16,
      padding: '0.7rem 1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    navBlock: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '2rem'
    },
    navButton: {
      background: '#fff',
      color: '#2980b9',
      border: '1px solid #2980b9',
      borderRadius: 16,
      padding: '0.7rem 1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Suivi de mon poids réel</h1>
      <div style={styles.subtitle}>Chaque évolution compte, même les plus petites.</div>

      {/* Formulaire d'enregistrement */}
      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Poids du jour (kg)</label>
        <input
          style={styles.input}
          type="number"
          step="0.1"
          value={poids}
          onChange={e => setPoids(e.target.value)}
          required
        />
        <label style={styles.label}>Date de la pesée</label>
        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">
          {editId ? "Mettre à jour la pesée" : "Enregistrer mon poids"}
        </button>
        {editId && (
          <button
            style={{ ...styles.button, background: '#b0b0b0', color: '#222', marginLeft: 10 }}
            type="button"
            onClick={() => {
              setEditId(null)
              setPoids('')
              setDate(new Date().toISOString().slice(0, 10))
            }}
          >
            Annuler
          </button>
        )}
      </form>

      {/* Message d'ancrage après pesée */}
      {showAnchor && (
        <div style={styles.anchorBlock}>
          Ce chiffre est un instantané. Ta constance vaut plus que ta courbe.<br />
          Tu avances. Ce n’est pas une fin, c’est une continuité.
        </div>
      )}

      {/* Poids actuel */}
      {poidsActuel !== null && (
        <div style={styles.poidsActuel}>
          Poids actuel : {poidsActuel.toFixed(1)} kg
        </div>
      )}

      {/* Progression + Courbe */}
      {progression !== null && (
        <div style={styles.progressionBlock}>
          <div>
            {reste > 0
              ? <>Tu es à {progression.toFixed(0)}% de ton objectif.<br />Il te reste {reste.toFixed(1)} kg à perdre pour atteindre ton poids de forme</>
              : <>Objectif atteint ou dépassé. Continue à t’ancrer dans la durée.</>
            }
          </div>
          <div style={styles.barre}>
            <div style={{ ...styles.barreInterne, width: `${Math.min(100, Math.max(0, progression))}%` }} />
          </div>
          {/* Courbe de progression */}
          {historique.length > 1 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.2rem', marginTop: '1.2rem', boxShadow: '0 1px 6px #e0e0e0' }}>
              <div style={{ color: '#2980b9', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.7rem', textAlign: 'center' }}>
                Courbe de progression
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={[...historique].reverse()}>
                  <CartesianGrid stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={formatDateFr} fontSize={12} />
                  <YAxis domain={['auto', 'auto']} tickCount={6} />
                  <Tooltip formatter={v => `${v} kg`} labelFormatter={formatDateFr} />
                  <Line type="monotone" dataKey="poids" stroke="#27ae60" strokeWidth={3} dot={{ r: 5, fill: '#2980b9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Actions immédiates après pesée */}
      {showAnchor && (
        <div style={styles.actionsBlock}>
          {actions.map((action, idx) => (
            <button key={idx} style={styles.actionButton} type="button" onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Rappel intelligent de pesée */}
      {showReminder && (
        <div style={styles.reminderBlock}>
          Tu te montres régulier·e. Si tu veux, une pesée peut t’aider à valoriser tes efforts.
        </div>
      )}

      {/* Historique */}
      <div style={styles.historiqueBlock}>
        <div style={styles.historiqueTitle}>Historique des pesées</div>
        <ul style={styles.historiqueList}>
          {historique.map((item) => (
            <li key={item.id || item.date} style={styles.historiqueItem}>
              <span>{formatDateFr(item.date)}</span>
              <span>{parseFloat(item.poids).toFixed(1)} kg</span>
              <button
                style={{ ...styles.actionButton, background: '#f39c12', fontSize: '0.9rem', padding: '0.3rem 0.8rem' }}
                onClick={() => handleEdit(item)}
                type="button"
              >
                Modifier
              </button>
              <button
                style={{ ...styles.actionButton, background: '#c0392b', fontSize: '0.9rem', padding: '0.3rem 0.8rem' }}
                onClick={() => handleDelete(item.id)}
                type="button"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
        {historique.length === 0 && <div>Aucune pesée enregistrée pour le moment.</div>}
      </div>

      {/* Navigation */}
      <div style={styles.navBlock}>
        <button style={styles.navButton} onClick={() => window.location.href = '/profil'}>
          Retour à mon profil
        </button>
        <button style={styles.navButton} onClick={() => window.location.href = '/tableau-de-bord'}>
          Voir mon tableau de bord
        </button>
      </div>

             {/* BOUTONS CONSIGNER UN REPAS */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span style={{ fontWeight: 600 }}>Consigner un repas :</span>
        <div style={{ marginTop: 10, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={styles.navButton} onClick={() => window.location.href = '/suivi?repas=petit-dejeuner'}>🥐 Petit-déjeuner</button>
          <button style={styles.navButton} onClick={() => window.location.href = '/suivi?repas=dejeuner'}>🍽️ Déjeuner</button>
          <button style={styles.navButton} onClick={() => window.location.href = '/suivi?repas=collation'}>🍏 Collation</button>
          <button style={styles.navButton} onClick={() => window.location.href = '/suivi?repas=diner'}>🍲 Dîner</button>
          <button style={styles.navButton} onClick={() => window.location.href = '/suivi?repas=autre'}>🍴 Autre</button>
        </div>
      </div>
    </div>
  )
}