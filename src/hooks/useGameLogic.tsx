// src/hooks/useGameLogic.ts
import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import type { GameState, TrackSuggestion } from "../types/game.types";

export const useGameLogic = () => {
  const { socket } = useSocket();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on("gameStateUpdate", (state: GameState) => {
      setGameState(state);
    });
    socket.on("timerTick", (time: number) => {
      setTimeLeft(time);
    });

    return () => {
      socket.off("gameStateUpdate");
      socket.off("timerTick");
    };
  }, [socket]);
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/spotify/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.tracks);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche :", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  const submitSongGuess = (trackId: string) => {
    socket?.emit("submitSongGuess", { trackId });
    setSearchQuery("");
    setSuggestions([]);
  };
  const submitOwnerGuess = (ownerId: number) => {
    socket?.emit("submitOwnerGuess", { ownerId });
  };

  return {
    gameState,
    timeLeft,
    searchQuery,
    setSearchQuery,
    suggestions,
    isSearching,
    submitSongGuess,
    submitOwnerGuess,
  };
};