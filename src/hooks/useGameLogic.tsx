// ============================================================
// USE GAME LOGIC — Le cerveau de l'écran de jeu.
// Réécrit intégralement sur les VRAIS événements du back :
//   newTrack -> songPhaseEnded -> roundSummary -> (boucle) -> gameOver
// (les anciens gameStateUpdate / timerTick n'ont jamais existé côté serveur)
//
// Gère aussi :
// - la lecture audio de l'extrait (new Audio + previewUrl)
// - le compte à rebours LOCAL basé sur "duration" envoyé par le
//   serveur (décision d'archi : le serveur reste l'arbitre via
//   ses setTimeout, le front n'affiche qu'un décompte cosmétique)
// - l'auto-complétion Spotify (debounce 300ms)
// ============================================================
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

  // --- ÉTAT DE LA PARTIE (dicté par le serveur) ---
  const [phase, setPhase] = useState<FrontGamePhase>("STARTING");
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  // Données transmises par le Lobby via le state du router
  const routerState = location.state as {
    players?: PublicPlayer[];
    roomCode?: string;
    isHost?: boolean;
  } | null;
  const roomCode = routerState?.roomCode ?? "";
  const isHost = routerState?.isHost ?? false; // le back re-vérifie de toute façon
  // La liste des joueurs arrive du Lobby, puis est rafraîchie à
  // chaque roundSummary / roomUpdated
  const [players, setPlayers] = useState<PublicPlayer[]>(
    routerState?.players ?? [],
  );
  const [revealedTrack, setRevealedTrack] = useState<RevealedTrack | null>(
    null,
  ); // titre/artiste révélés en GUESS_OWNER
  const [roundOwnerIds, setRoundOwnerIds] = useState<number[]>([]); // les vrais propriétaires (affichés au ROUND_RESULT)
  const [playersWhoFound, setPlayersWhoFound] = useState<PublicPlayer["id"][]>(
    [],
  ); // qui a trouvé la musique (badge vert)

  // --- ÉTAT PERSONNEL DU JOUEUR ---
  const [hasFoundSong, setHasFoundSong] = useState(false); // j'ai trouvé -> input désactivé
  const [lastGuessWrong, setLastGuessWrong] = useState(false); // feedback bordure rouge
  const [myOwnerVote, setMyOwnerVote] = useState<number | null>(null); // mon vote GUESS_OWNER

  // --- CHRONO LOCAL ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(30); // pour calculer la jauge en % (timeLeft/totalTime)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- AUDIO ---
  // new Audio() plutôt qu'une balise <audio> : pas de JSX dans un hook,
  // et le contrôle programmatique (play/pause/src) est plus simple
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false); // politique autoplay du navigateur

  // --- VOLUME (persisté entre les sessions) ---
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem("volume");
    const parsed = stored !== null ? Number(stored) : NaN;
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.8;
  });
  // Ref miroir : le callback newTrack est créé au montage et capturerait
  // sinon la valeur initiale du volume (closure stale)
  const volumeRef = useRef(volume);

  const setVolume = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value)); // borné entre 0 et 1
    setVolumeState(clamped);
    volumeRef.current = clamped;
    localStorage.setItem("volume", String(clamped));
    // Application immédiate sur l'extrait en cours de lecture
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  // --- AUTO-COMPLÉTION ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ============================================================
  // HELPERS CHRONO
  // ============================================================
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
      showToast(`${data.username} a trouvé ! 🎉`, "success");
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
