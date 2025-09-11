import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>Bienvenue sur Mon Plan Vital</h1>
      <p style={{ marginTop: '1rem' }}>
        Votre application pour suivre votre santé et votre bien-être au quotidien.
      </p>
      <div>
        <p>Explorez les différentes sections pour :</p>
        <ul>
          <li>Gérer votre profil utilisateur</li>
          <li>Suivre vos repas et vos signaux de satiété</li>
          <li>Analyser vos données comportementales</li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/profil"
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
          → Accéder à mon profil
        </Link>
      </p>
    </div>
  );
}