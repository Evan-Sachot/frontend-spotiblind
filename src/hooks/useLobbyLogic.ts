import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useToast } from "../contexts/ToastContext";
import { getUserFromToken } from "../utils/auth.util";
import type { PublicPlayer } from "../types/game.types";

const ROOM_CODE_LENGTH = 6; 

export const useLobbyLogic = () => {
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const currentUser = getUserFromToken(); 

  //  ÉTAT DU SALON 
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [hostUsername, setHostUsername] = useState<string | null>(null);
  const isHost =
    hostUsername !== null && hostUsername === currentUser?.username;
  const [error, setError] = useState("");
  const pendingJoinRef = useRef(false);

  //  ÉTAT DE L'UI 
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "presets" | "options" | "playlists"
  >("options");

  // RÉGLAGES DE PARTIE 
  const [rounds, setRoundsState] = useState(10);
  const [guessTime, setGuessTimeState] = useState(30);

  //  PLAYLISTS 
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playersReady, setPlayersReady] = useState<Record<number, string>>({});

  const playersRef = useRef<PublicPlayer[]>([]);
  const activeRoomRef = useRef<string | null>(null);
  const hostRef = useRef<string | null>(null);
  useEffect(() => {
    playersRef.current = players;
    activeRoomRef.current = activeRoom;
    hostRef.current = hostUsername;
  }, [players, activeRoom, hostUsername]);

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
      pendingJoinRef.current = false; 
    });

    socket.on("roomUpdated", (data) => {
      setPlayers(data.players);
      setHostUsername(data.roomHost);
      // Événement transitoire -> toast auto-expirant
      if (data.message) showToast(data.message, "info");
    });

    // L'hôte a fermé le salon 
    socket.on("roomClosed", (data) => {
      setActiveRoom(null);
      setPlayers([]);
      setHostUsername(null);
      setPlayersReady({});
      setSelectedPlaylist(null);
      setError(data.message);
    });

    // Reconnexion après un rafraîchissement de page 
    socket.on("roomRejoined", (data) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setHostUsername(data.roomHost);
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
    socket.on("settingsUpdated", (data) => {
      setRoundsState(data.maxRounds);
      setGuessTimeState(data.guessTime);
    });

    // Un joueur a choisi sa playlist 
    socket.on("playerSelectedPlaylist", (data) => {
      setPlayersReady((prev) => ({ ...prev, [data.userId]: data.playlistId }));
    });
    socket.on("gameStarted", () => {
      navigate("/game", {
        state: {
          players: playersRef.current,
          roomCode: activeRoomRef.current,
          isHost: hostRef.current === currentUser?.username,
        },
      });
    });

    socket.on("error", (data) => {
      if (pendingJoinRef.current) {
        setError(data.message);
        pendingJoinRef.current = false;
      } else {
        showToast(data.message, "error");
      }
    });

    // Nettoyage 
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
  }, [socket]);

  // ACTIONS DU JOUEUR
  const handleCreateRoom = () => socket?.emit("createRoom");

  const handleJoinClick = () => setShowJoinInput(true);

  const submitJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== ROOM_CODE_LENGTH) {
      setError(`Le code doit faire ${ROOM_CODE_LENGTH} caractères.`);
      return;
    }
    pendingJoinRef.current = true;
    socket?.emit("joinRoom", code);
  };

  const handleLeaveRoom = () => {
    socket?.emit("leaveRoom");
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
    socket?.emit("selectPlaylist", playlistId);
  };

  // Les setters de réglages 
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
      showToast(`Code ${activeRoom} copié !`, "success");
    }
  };

  const startGame = () => socket?.emit("startGame");

  return {
    isConnected,
    currentUser,
    activeRoom,
    players,
    isHost,
    hostUsername,
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
