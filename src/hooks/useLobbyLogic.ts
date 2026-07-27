// ============================================================
// USE LOBBY LOGIC — Toute la logique du salon d'attente.
// Réécrit pour coller au contrat socket.types.ts :
// - roomCreated / roomJoined reçoivent { roomCode, players }
// - roomUpdated remplace playerJoined / playerLeft
// - joinRoom envoie une STRING (code à 6 caractères)
// - selectPlaylist remplace l'ancien playerReady
// - les réglages passent par setMaxRounds / setGuessTime
// - gameStarted déclenche la navigation vers /game
// ============================================================
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useToast } from "../contexts/ToastContext";
import { getUserFromToken } from "../utils/auth.util";
import type { PublicPlayer } from "../types/game.types";

const ROOM_CODE_LENGTH = 6; // aligné sur le back (et sur ta maquette "8537C4")

export const useLobbyLogic = () => {
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const currentUser = getUserFromToken(); // { id, username } décodés du JWT

  // --- ÉTAT DU SALON ---
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  // On stocke le PSEUDO de l'hôte (envoyé par le serveur dans tous les
  // payloads de salon) : isHost est DÉRIVÉ par comparaison avec notre
  // propre pseudo. Plus fiable qu'un booléen posé à la création.
  const [hostUsername, setHostUsername] = useState<string | null>(null);
  const isHost =
    hostUsername !== null && hostUsername === currentUser?.username;
  // GESTION DES MESSAGES — règle des 3 familles :
  // - "error" (state) : erreurs de FORMULAIRE et états BLOQUANTS,
  //   affichées inline/persistantes dans la page
  // - transitoire ("X a rejoint", "code copié") : showToast, auto-expire
  const [error, setError] = useState("");
  // Distingue une erreur de JOIN (à afficher inline sous l'input)
  // d'une erreur serveur générale (à afficher en toast) : le
  // listener "error" est unique, ce flag lui donne le contexte
  const pendingJoinRef = useRef(false);

  // --- ÉTAT DE L'UI ---
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "presets" | "options" | "playlists"
  >("options");

  // --- RÉGLAGES DE PARTIE (synchronisés via settingsUpdated) ---
  const [rounds, setRoundsState] = useState(10);
  const [guessTime, setGuessTimeState] = useState(30);

  // --- PLAYLISTS ---
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  // userId -> playlistId : permet d'afficher un badge "prêt" sur chaque joueur
  const [playersReady, setPlayersReady] = useState<Record<number, string>>({});

  // Refs miroirs : les callbacks socket sont créés au montage
  // et captureraient sinon une version PÉRIMÉE du state (closure stale)
  const playersRef = useRef<PublicPlayer[]>([]);
  const activeRoomRef = useRef<string | null>(null);
  const hostRef = useRef<string | null>(null);
  useEffect(() => {
    playersRef.current = players;
    activeRoomRef.current = activeRoom;
    hostRef.current = hostUsername;
  }, [players, activeRoom, hostUsername]);

  // ============================================================
  // ÉCOUTE DES ÉVÉNEMENTS SERVEUR
  // ============================================================
  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (data) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setHostUsername(data.roomHost);
      setError("");
      setShowJoinInput(false);
    });

    socket.on("roomJoined", (data) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setHostUsername(data.roomHost);
      setError("");
      pendingJoinRef.current = false; // le join a réussi
    });

    // UN SEUL événement pour toute évolution de la liste des joueurs
    socket.on("roomUpdated", (data) => {
      setPlayers(data.players);
      setHostUsername(data.roomHost);
      // Événement transitoire -> toast auto-expirant
      if (data.message) showToast(data.message, "info");
    });

    // L'hôte a fermé le salon (volontairement ou déconnexion définitive)
    socket.on("roomClosed", (data) => {
      setActiveRoom(null);
      setPlayers([]);
      setHostUsername(null);
      setPlayersReady({});
      setSelectedPlaylist(null);
      setError(data.message);
    });

    // Reconnexion après un rafraîchissement de page (grâce de 15s du back)
    socket.on("roomRejoined", (data) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setHostUsername(data.roomHost);
      // Si une partie était en cours, on retourne directement sur l'écran de jeu
      if (data.phase !== "LOBBY") {
        navigate("/game", {
          state: {
            players: data.players,
            roomCode: data.roomCode,
            isHost: data.roomHost === currentUser?.username,
          },
        });
      }
    });

    // Réglages diffusés par le serveur : synchronise TOUS les joueurs
    // (y compris les non-hôtes qui voient les sliders bouger)
    socket.on("settingsUpdated", (data) => {
      setRoundsState(data.maxRounds);
      setGuessTimeState(data.guessTime);
    });

    // Un joueur a choisi sa playlist -> badge "prêt"
    socket.on("playerSelectedPlaylist", (data) => {
      setPlayersReady((prev) => ({ ...prev, [data.userId]: data.playlistId }));
    });

    // La partie démarre : tout le monde bascule sur l'écran de jeu.
    // On transmet joueurs / code / statut d'hôte via le state du router
    // (le back envoie 3s plus tard le premier newTrack : le temps
    // que la page Game monte ses listeners)
    socket.on("gameStarted", () => {
      navigate("/game", {
        state: {
          players: playersRef.current,
          roomCode: activeRoomRef.current,
          isHost: hostRef.current === currentUser?.username,
        },
      });
    });

    // Canal d'erreur UNIQUE du contrat. Deux traitements :
    // - erreur d'une tentative de JOIN -> inline sous l'input
    //   (l'utilisateur doit pouvoir la relire en corrigeant le code)
    // - toute autre erreur serveur (ex: "Aucune playlist
    //   sélectionnée" au lancement) -> toast transitoire
    socket.on("error", (data) => {
      if (pendingJoinRef.current) {
        setError(data.message);
        pendingJoinRef.current = false;
      } else {
        showToast(data.message, "error");
      }
    });

    // Nettoyage : indispensable pour éviter les listeners fantômes
    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomUpdated");
      socket.off("roomClosed");
      socket.off("roomRejoined");
      socket.off("settingsUpdated");
      socket.off("playerSelectedPlaylist");
      socket.off("gameStarted");
      socket.off("error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // ============================================================
  // ACTIONS DU JOUEUR
  // ============================================================
  const handleCreateRoom = () => socket?.emit("createRoom");

  const handleJoinClick = () => setShowJoinInput(true);

  const submitJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    // Aligné sur le back : codes à 6 caractères (ex: 8537C4)
    // Erreur de FORMULAIRE -> inline, jamais en toast
    if (code.length !== ROOM_CODE_LENGTH) {
      setError(`Le code doit faire ${ROOM_CODE_LENGTH} caractères.`);
      return;
    }
    // On arme le flag : si le serveur répond "error", le listener
    // saura que c'est une erreur de join -> affichage inline
    pendingJoinRef.current = true;
    // CONTRAT : une string nue, PAS un objet { roomCode }
    socket?.emit("joinRoom", code);
  };

  const handleLeaveRoom = () => {
    socket?.emit("leaveRoom");
    // Reset local immédiat (le serveur ne nous renvoie rien à nous)
    setActiveRoom(null);
    setPlayers([]);
    setHostUsername(null);
    setShowJoinInput(false);
    setSelectedPlaylist(null);
    setPlayersReady({});
    setError("");
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    // CONTRAT : selectPlaylist (l'ancien "playerReady" n'existe pas côté back)
    socket?.emit("selectPlaylist", playlistId);
  };

  // Les setters de réglages : mise à jour locale (réactivité immédiate
  // du slider) + envoi au serveur qui rediffusera via settingsUpdated.
  // Même noms qu'avant (setRounds / setGuessTime) pour ne pas toucher tes pages.
  const setRounds = (value: number) => {
    setRoundsState(value);
    socket?.emit("setMaxRounds", value);
  };

  const setGuessTime = (value: number) => {
    setGuessTimeState(value);
    socket?.emit("setGuessTime", value);
  };

  const copyInviteCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom);
      // Feedback transitoire -> toast success
      showToast(`Code ${activeRoom} copié !`, "success");
    }
  };

  // CONTRAT : startGame sans paramètres (les réglages sont déjà
  // sur le serveur grâce à setMaxRounds / setGuessTime)
  const startGame = () => socket?.emit("startGame");

  return {
    isConnected,
    currentUser,
    activeRoom,
    players,
    isHost,
    hostUsername, // pour la couronne dans PlayerSidebar
    error,
    showJoinInput,
    roomCodeInput,
    activeTab,
    selectedPlaylist,
    playersReady,
    rounds,
    guessTime,
    setRoomCodeInput,
    setActiveTab,
    handleSelectPlaylist,
    setRounds,
    setGuessTime,
    handleCreateRoom,
    handleJoinClick,
    submitJoinRoom,
    handleLeaveRoom,
    copyInviteCode,
    startGame,
  };
};
