import { Link } from "react-router-dom";

const CONTACT_EMAIL = "sachot20@gmail.com";

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-purple-950/40 border border-purple-500/30 rounded-xl p-8 shadow-2xl backdrop-blur-sm text-purple-100">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-wide uppercase">
          Confidentialité &amp; RGPD
        </h1>

        <section className="mb-6">
          <h2 className="text-purple-200 font-bold mb-2">Données collectées</h2>
          <p className="text-sm leading-relaxed">
            Spoti-Blind collecte uniquement l'identifiant Spotify, l'adresse e-mail, le
            pseudonyme et les jetons d'accès nécessaires pour agir en votre nom auprès
            de l'API Spotify pendant une partie. Aucune donnée d'écoute, aucune liste de
            contacts, aucun droit d'écriture sur votre compte Spotify.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-purple-200 font-bold mb-2">Données de jeu</h2>
          <p className="text-sm leading-relaxed">
            Les salons, parties et scores existent uniquement en mémoire le temps d'une
            partie et ne sont jamais enregistrés en base de données : ils disparaissent
            dès la fin de la partie ou la fermeture du salon.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-purple-200 font-bold mb-2">Vos droits</h2>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
            <li>
              Révoquer l'accès de Spoti-Blind à tout moment depuis les paramètres de
              votre compte Spotify vos jetons deviennent immédiatement inopérants.
            </li>
            <li>
              Demander la suppression définitive de votre compte et des données
              associées : écrivez à{" "}
              <a href={`mailto:${CONTACT_EMAIL}?subject=Suppression%20de%20compte%20Spoti-Blind`} className="underline text-white hover:text-purple-300">
                {CONTACT_EMAIL}
              </a>{" "}
              depuis l'adresse e-mail liée à votre compte. Cette demande est traitée
              manuellement, sous un mois maximum.
            </li>
          </ul>
        </section>

        <Link to="/login" className="inline-block text-sm text-purple-300 hover:text-white underline">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default Privacy;
