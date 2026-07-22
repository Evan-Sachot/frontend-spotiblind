// ============================================================
// PROTECTED ROUTE — Garde d'accès aux pages qui exigent d'être
// connecté (/lobby, /game).
//
// Fonctionnement (pattern "layout route" de react-router v6) :
// ce composant enveloppe les routes enfants ; si le token est
// absent, corrompu OU EXPIRÉ (vérifié par getUserFromToken),
// on nettoie le localStorage et on redirige vers /login.
// Sinon <Outlet /> rend la route enfant demandée.
//
// ⚠️ POINT D'ARCHITECTURE (à savoir expliquer) : cette garde est
// du CONFORT UTILISATEUR, pas de la sécurité. La vraie sécurité
// est côté serveur : middleware verifyToken sur les routes REST
// et io.use() sur les sockets. Un client modifié peut contourner
// cette garde... et se fera rejeter par le serveur à la première
// requête. Le front guide, le back décide.
// ============================================================
import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken } from "../utils/auth.util";

export const ProtectedRoute = () => {
  const user = getUserFromToken();

  if (!user) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
