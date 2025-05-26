export default function FormulaireProfil({
  poids,
  setPoids,
  taille,
  setTaille,
  age,
  setAge,
  objectif,
  setObjectif,
  delai,
  setDelai,
  pourquoi,
  setPourquoi,
  handleSubmit,
  buttonLabel,
  buttonStyle
}) {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Poids de départ (kg)</label>
        <input
          type="number"
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Taille (cm)</label>
        <input
          type="number"
          value={taille}
          onChange={(e) => setTaille(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Âge</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Objectif de poids (kg)</label>
        <input
          type="number"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          required
        />
      </div>

      <div>
        <label>En combien de mois souhaitez-vous atteindre cet objectif&nbsp;?</label>
        <input
          type="number"
          value={delai}
          onChange={(e) => setDelai(e.target.value)}
          min="1"
          required
        />
      </div>

      <div>
        <label>Pourquoi ce projet ?</label>
        <textarea
          value={pourquoi}
          onChange={(e) => setPourquoi(e.target.value)}
          required
        />
      </div>

      {/* Le bouton submit est passé par le parent */}
      <button type="submit" style={buttonStyle}>{buttonLabel}</button>
    </form>
  );
}