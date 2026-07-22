// ============================================================
// USE AUTH LOGIC — Gère le retour du callback Spotify et le
// formulaire de pseudo (première connexion).
//
// Corrections par rapport à l'ancienne version :
// - navigate() au lieu de window.location.href : on reste dans
//   la SPA, donc la connexion socket N'EST PAS détruite par un
//   rechargement complet de page
// - API_URL centralisée (fini les ports 3000/5000 mélangés)
// - connect() appelé dès que le token est stocké
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { API_URL } from "../config/env";

export const useAuthLogic = () => {
  const navigate = useNavigate();
  const { connect, disconnect } = useSocket();

  const [isNewUser, setIsNewUser] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // --- RETOUR DU CALLBACK SPOTIFY ---
  // Le back redirige vers /login?token=xxx&newUser=true|false
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const isNew = params.get("newUser") === "true";

    if (!urlToken) return;

    localStorage.setItem("token", urlToken);
    connect(); // le token existe maintenant : on ouvre le socket

    // On nettoie l'URL (le token ne doit pas rester visible/partageable)
    window.history.replaceState({}, document.title, "/login");

    if (isNew) {
      // Première connexion : on affiche le formulaire de pseudo
      setIsNewUser(true);
    } else {
      // Joueur connu : direction le lobby SANS recharger la page
      navigate("/lobby");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CLIC SUR "SIGN IN WITH SPOTIFY" ---
  // Ici window.location.href est CORRECT et voulu : on quitte
  // volontairement la SPA pour aller sur le site de Spotify.
  // URL alignée sur le back : GET /api/spotify/login
  const handleSpotifyLogin = () => {
    window.location.href = `${API_URL}/api/spotify/login`;
  };

  // --- SOUMISSION DU PSEUDO (première connexion) ---
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      setError("Ton pseudo doit faire au moins 3 caractères.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Alignée sur le back : PUT /api/spotify/username (route protégée)
      const response = await fetch(`${API_URL}/api/spotify/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        // Le back renvoie un NOUVEAU token (avec le pseudo dedans) :
        // on remplace l'ancien pour que socket.data.user soit à jour
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          // ⚠️ CRUCIAL : le socket s'est connecté avec l'ANCIEN token
          // (pseudo temporaire). On le recycle pour que le serveur
          // connaisse le vrai pseudo (roomHost, scoreboard, etc.)
          disconnect();
          connect();
        }
        navigate("/lobby");
      } else {
        setError("Erreur lors de la mise à jour du pseudo.");
      }
    } catch {
      setError("Le serveur est inaccessible.");
    }
  };

  return {
    isNewUser,
    username,
    setUsername,
    error,
    handleSpotifyLogin,
    handleUsernameSubmit,
  };
};