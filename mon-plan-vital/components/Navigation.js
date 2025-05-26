import Link from 'next/link';

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link href="/">Accueil</Link>
                </li>
                <li>
                    <Link href="/profil">Profil</Link>
                </li>
                <li>
                    <Link href="/suivi">Repas du jour</Link>
                </li>
                <li>
                    <Link href="/extras">Synthèse extras</Link>
                </li>
                <li>
                    <Link href="/declarer-extra">Déclarer un extra</Link>
                </li>
                <li>
                    <Link href="/regles">Règles d'usage</Link>
                </li>
                <li>
                    <Link href="/statistiques">Tableau de bord</Link>
                </li>
                <li>
                    <Link href="/checkin">Humeur du jour</Link>
                </li>
                <li>
                    <Link href="/pause">Pause mentale</Link>
                </li>
                <li>
                    <Link href="/defis">Défi en cours</Link>
                </li>
                <li>
                    <Link href="/plan">Plan alimentaire</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;