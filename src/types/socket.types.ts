// ============================================================
// CONTRAT SOCKET.IO (FRONT) — COPIE MIROIR de
// backend/src/types/socket.types.ts.
// ⚠️ RÈGLE D'OR : toute modification ici doit être faite dans
// les DEUX fichiers. C'est ce contrat qui garantit que le front
// et le back parlent la même langue (erreur de compil sinon).
// ============================================================
import type { Socket } from "socket.io-client";
import type { GamePhase, PublicPlayer } from "./game.types";

// ------------------------------------------------------------
// CE QUE LE FRONT A LE DROIT D'ENVOYER AU SERVEUR
// ------------------------------------------------------------
export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomCode: string) => void; // ⚠️ une STRING nue, pas un objet
  leaveRoom: () => void;
  selectPlaylist: (playlistId: string) => void;
  setMaxRounds: (maxRounds: number) => void;
  setGuessTime: (guessTime: number) => void;
  startGame: () => void;
  // Le payload complet (et plus seulement l'ID) : la même chanson
  // existe sous plusieurs IDs Spotify (single/album/remaster), la
  // vérification se fait par titre+artiste normalisés côté serveur
  submitSongGuess: (guess: {
    trackId: string;
    title: string;
    artist: string;
  }) => void;
  submitOwnerGuess: (ownerId: number) => void; // ⚠️ un NUMBER nu
  playAgain: () => void;
}

// ------------------------------------------------------------
// CE QUE LE SERVEUR A LE DROIT D'ENVOYER AU FRONT
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// LE SOCKET CLIENT TYPÉ
// ⚠️ Côté client, l'ordre des génériques est INVERSÉ par rapport
// au serveur : d'abord ce qu'on REÇOIT, puis ce qu'on ÉMET.
// ------------------------------------------------------------
export type TypedClientSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;