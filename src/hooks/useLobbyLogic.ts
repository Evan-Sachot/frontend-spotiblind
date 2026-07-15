// src/hooks/useLobbyLogic.ts
import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import type { LobbyPlayer } from "../types/lobby.types";

export const useLobbyLogic = () => {
  const { socket, isConnected } = useSocket();

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [activeTab, setActiveTab] = useState<"presets" | "options" | "playlists">("options"); 
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const [rounds, setRounds] = useState(10);
  const [guessTime, setGuessTime] = useState(30);

  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (data: { roomCode: string; players: LobbyPlayer[] }) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setIsHost(true);
      setError("");
      setShowJoinInput(false);
    });

    socket.on("roomJoined", (data: { roomCode: string; players: LobbyPlayer[] }) => {
      setActiveRoom(data.roomCode);
      setPlayers(data.players);
      setIsHost(false);
      setError("");
    });

    socket.on("roomUpdated", (data: { players: LobbyPlayer[] }) => {
      setPlayers(data.players);
    });

    socket.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomUpdated");
      socket.off("error");
    };
  }, [socket]);

  const handleCreateRoom = () => socket?.emit("createRoom");
  const handleJoinClick = () => setShowJoinInput(true);
  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    socket?.emit("playerReady", { playlistId });
  };

  const submitJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (roomCodeInput.trim().length !== 4) {
      setError("Le code doit faire 4 lettres.");
      return;
    }
    socket?.emit("joinRoom", { roomCode: roomCodeInput.toUpperCase() });
  };

  const handleLeaveRoom = () => {
    socket?.emit("leaveRoom");
    setActiveRoom(null);
    setPlayers([]);
    setIsHost(false);
    setShowJoinInput(false);
    setSelectedPlaylist(null);
  };

  const copyInviteCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom);
      alert(`Code ${activeRoom} copié dans le presse-papier !`);
    }
  };

  const startGame = () => {
    socket?.emit("startGame", { rounds, guessTime });
  };

  return {
    isConnected,
    activeRoom,
    players,
    isHost,
    showJoinInput,
    roomCodeInput,
    activeTab,
    selectedPlaylist,
    rounds,
    guessTime,
    error,
    setRoomCodeInput,
    setActiveTab,
    setSelectedPlaylist,
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