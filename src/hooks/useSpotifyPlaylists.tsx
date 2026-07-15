import { useState, useEffect } from "react";
import type { SpotifyPlaylist } from "../types/playlist.types";

export const useSpotifyPlaylists = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/spotify/playlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des playlists");

        const data = await response.json();
        setPlaylists(data.playlists);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger tes playlists Spotify.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return { playlists, isLoading, error };
};