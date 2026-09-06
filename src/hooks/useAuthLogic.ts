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

  //  RETOUR DU CALLBACK SPOTIFY 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const isNew = params.get("newUser") === "true";

    if (!urlToken) return;

    localStorage.setItem("token", urlToken);
    connect(); 
    window.history.replaceState({}, document.title, "/login");

    if (isNew) {
      setIsNewUser(true);
    } else {
      navigate("/lobby");
    }
  }, []);

// CLIC SUR SIGN IN WITH SPOTIFY
  const handleSpotifyLogin = () => {
    window.location.href = `${API_URL}/api/spotify/login`;
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      setError("Ton pseudo doit faire au moins 3 caractères.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/spotify/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          disconnect();
          connect();
        }
        navigate("/lobby");
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Erreur lors de la mise à jour du pseudo.");
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
