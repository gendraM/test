

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenue sur Mon Plan Vital</h1>
      <p>Votre application pour suivre votre santé et votre bien-être.</p>
      <p>Explorez les différentes sections pour gérer votre profil, suivre vos repas, et bien plus encore.</p>
      <p>
        <Link href="/profil">→ Accéder à mon profil</Link>
      </p>
    </div>
  );
}

