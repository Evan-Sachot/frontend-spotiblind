import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useToast } from "../contexts/ToastContext";
import { getUserFromToken } from "../utils/auth.util";
import { API_URL } from "../config/env";
import type {
  FrontGamePhase,
  PublicPlayer,
  TrackSuggestion,
  RevealedTrack,
} from "../types/game.types";

export const useGameLogic = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUserFromToken();
  const { showToast } = useToast();

  // ÉTAT DE LA PARTIE 
  const [phase, setPhase] = useState<FrontGamePhase>("STARTING");
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const routerState = location.state as {
    players?: PublicPlayer[];
    roomCode?: string;
    isHost?: boolean;
  } | null;
  const roomCode = routerState?.roomCode ?? "";
  const isHost = routerState?.isHost ?? false; 
  const [players, setPlayers] = useState<PublicPlayer[]>(
    routerState?.players ?? [],
  );
  const [revealedTrack, setRevealedTrack] = useState<RevealedTrack | null>(
    null,
  );
  const [roundOwnerIds, setRoundOwnerIds] = useState<number[]>([]); 
  const [playersWhoFound, setPlayersWhoFound] = useState<PublicPlayer["id"][]>(
    [],
  ); 

  //  ÉTAT PERSONNEL DU JOUEUR 
  const [hasFoundSong, setHasFoundSong] = useState(false); 
  const [lastGuessWrong, setLastGuessWrong] = useState(false); 
  const [myOwnerVote, setMyOwnerVote] = useState<number | null>(null); 

  //  CHRONO LOCAL 
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(30); 
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  //  AUDIO 

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false); 

  //  VOLUME 
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem("volume");
    const parsed = stored !== null ? Number(stored) : NaN;
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.8;
  });
  const volumeRef = useRef(volume);

  const setVolume = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    localStorage.setItem("volume", String(clamped));
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  // AUTO-COMPLÉTION 
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // HELPERS CHRONO

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCountdown = (duration: number) => {
    stopCountdown();
    setTotalTime(duration);
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  };

  useEffect(() => {
    if (!socket) {
       navigate(getUserFromToken() ? "/lobby" : "/login", { replace: true });
    }
  }, [socket]);

// EVENEMENTS SOCKET
  useEffect(() => {
    if (!socket) return;

    audioRef.current = new Audio();

// NOUVELLE MUSIQUE : phase GUESS_SONG
    socket.on("newTrack", (data) => {
      setPhase("GUESS_SONG");
      setCurrentRound(data.currentRound);
      setTotalRounds(data.totalRounds);

      setRevealedTrack(null);
      setRoundOwnerIds([]);
      setPlayersWhoFound([]);
      setHasFoundSong(false);
      setLastGuessWrong(false);
      setMyOwnerVote(null);
      setSearchQuery("");
      setSuggestions([]);

// LANCEMENT DE LA MUSIQUE
      if (audioRef.current) {
        audioRef.current.src = data.previewUrl;
        audioRef.current.volume = volumeRef.current;
        audioRef.current
          .play()
          .then(() => setIsAudioBlocked(false))
          .catch(() => {
            setIsAudioBlocked(true);
          });
      }
      startCountdown(data.duration);
    });

    socket.on("songPhaseEnded", (data) => {
      setPhase("GUESS_OWNER");
      setRevealedTrack({
        title: data.title,
        artist: data.artist,
        imageUrl: data.imageUrl,
      });
      audioRef.current?.pause();
      startCountdown(data.duration);
    });

    socket.on("playerFoundSong", (data) => {
      setPlayersWhoFound((prev) => [...prev, data.userId]);
      showToast(`${data.username} a trouvé !`, "success");
    });

    socket.on("guessResult", (data) => {
      if (data.correct) {
        setHasFoundSong(true); 
        setLastGuessWrong(false);
      } else {
        setLastGuessWrong(true); 
      }
    });

// BILAN DE LA MANCHE
    socket.on("roundSummary", (data) => {
      setPhase("ROUND_RESULT");
      setRoundOwnerIds(data.ownerIds);
      setPlayers(data.players);
      stopCountdown();
    });

// FIN DE LA PARTIE
    socket.on("gameOver", (data) => {
      setPhase("SCOREBOARD");
      setPlayers(data.players);
      stopCountdown();
      audioRef.current?.pause();
    });

    socket.on("gameReset", () => {
      navigate("/lobby");
    });

    socket.on("roomUpdated", (data) => {
      setPlayers(data.players);
      if (data.message) showToast(data.message, "info");
    });

    socket.on("roomClosed", () => {
      navigate("/lobby");
    });

    socket.on("error", (data) => {
      showToast(data.message, "error");
    });

    return () => {
      socket.off("newTrack");
      socket.off("songPhaseEnded");
      socket.off("playerFoundSong");
      socket.off("guessResult");
      socket.off("roundSummary");
      socket.off("gameOver");
      socket.off("gameReset");
      socket.off("roomUpdated");
      socket.off("roomClosed");
      socket.off("error");
      stopCountdown();
      audioRef.current?.pause();
      audioRef.current = null;
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
        const response = await fetch(
          `${API_URL}/api/spotify/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.tracks ?? []);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche :", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
// ACTION DU JOUEUR


  const submitSongGuess = (suggestion: TrackSuggestion) => {
    socket?.emit("submitSongGuess", {
      trackId: suggestion.id,
      title: suggestion.title,
      artist: suggestion.artist,
    });
    setSearchQuery("");
    setSuggestions([]);
  };
  const submitOwnerGuess = (ownerId: number) => {
    socket?.emit("submitOwnerGuess", ownerId);
    setMyOwnerVote(ownerId); 
  };

  const playAgain = () => socket?.emit("playAgain");

  const enableAudio = () => {
    audioRef.current
      ?.play()
      .then(() => setIsAudioBlocked(false))
      .catch(() => setIsAudioBlocked(true));
  };

  return {
    phase,
    roomCode,
    isHost,
    currentRound,
    totalRounds,
    players,
    revealedTrack,
    roundOwnerIds,
    playersWhoFound,
    currentUser,
    hasFoundSong,
    lastGuessWrong,
    myOwnerVote,
    timeLeft,
    totalTime,
    isAudioBlocked,
    enableAudio,
    volume,
    setVolume,
    searchQuery,
    setSearchQuery,
    suggestions,
    isSearching,
    submitSongGuess,
    submitOwnerGuess,
    playAgain,
  };
};
