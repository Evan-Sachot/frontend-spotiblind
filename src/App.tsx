// ============================================================
// APP — Le chef d'orchestre : routing + connexion socket globale.
//
// Prérequis : npm install react-router-dom (déjà installé au
// setup initial du projet normalement).
//
// L'ORDRE DES WRAPPERS COMPTE :
// - BrowserRouter d'abord (useNavigate est utilisé dans les hooks)
// - SocketProvider ensuite : UNE seule connexion pour toute l'app,
//   qui SURVIT aux changements de page (c'est tout l'intérêt de
//   naviguer avec navigate() au lieu de window.location.href)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { Login } from "./pages/Login";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";

export const App = () => {
  return (
    <BrowserRouter>
      {/* ToastProvider AU-DESSUS de SocketProvider : les hooks qui
          consomment le socket (lobby/game) utilisent aussi useToast */}
      <ToastProvider>
        <SocketProvider>
          <Routes>
            {/* La racine redirige vers le login (qui redirige lui-même
              vers /lobby si un token valide existe déjà) */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* ROUTES PROTÉGÉES : ProtectedRoute vérifie le token
              (présence + expiration) avant de rendre l'enfant.
              /login reste HORS de la garde : c'est lui qui reçoit
              le callback Spotify et le formulaire de pseudo. */}
            <Route element={<ProtectedRoute />}>
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/game" element={<Game />} />
            </Route>

            {/* Toute URL inconnue -> retour au login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
