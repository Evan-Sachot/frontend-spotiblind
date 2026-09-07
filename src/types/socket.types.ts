
import type { Socket } from "socket.io-client";
import type { GamePhase, PublicPlayer } from "./game.types";

export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  selectPlaylist: (playlistId: string) => void;
  setMaxRounds: (maxRounds: number) => void;
  setGuessTime: (guessTime: number) => void;
  startGame: () => void;
  submitSongGuess: (guess: {
    trackId: string;
    title: string;
    artist: string;
  }) => void;
  submitOwnerGuess: (ownerId: number) => void; 
  playAgain: () => void;
}

export interface ServerToClientEvents {
  roomCreated: (data: {
    roomCode: string;
    players: PublicPlayer[];
    roomHost: string;
  }) => void;
  roomJoined: (data: {
    roomCode: string;
    players: PublicPlayer[];
    roomHost: string;
  }) => void;
  roomUpdated: (data: {
    players: PublicPlayer[];
    roomHost: string;
    message?: string;
  }) => void;
  roomClosed: (data: { message: string }) => void;
  roomRejoined: (data: {
    roomCode: string;
    phase: GamePhase;
    players: PublicPlayer[];
    roomHost: string;
  }) => void;

  error: (data: { message: string }) => void;

  settingsUpdated: (data: { maxRounds: number; guessTime: number }) => void;
  playerSelectedPlaylist: (data: { userId: number; playlistId: string }) => void;

  gameStarted: (data: { totalTracks: number }) => void;
  newTrack: (data: {
    previewUrl: string;
    currentRound: number;
    totalRounds: number;
    duration: number;
  }) => void;
  playerFoundSong: (data: { userId: number; username: string }) => void;
  guessResult: (data: { correct: boolean }) => void;
  songPhaseEnded: (data: {
    title: string;
    artist: string;
    duration: number;
    imageUrl:string;
  }) => void;
  roundSummary: (data: { ownerIds: number[]; players: PublicPlayer[] }) => void;
  gameOver: (data: { players: PublicPlayer[] }) => void;
  gameReset: (data: { message: string }) => void;
}

export type TypedClientSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;