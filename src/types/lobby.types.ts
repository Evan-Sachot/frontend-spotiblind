export interface LobbyPlayer {
  id: number;
  username: string;
  isHost: boolean;
  isReady: boolean;
}

export interface PlayerSidebarProps {
  roomCode: string;
  players: LobbyPlayer[];
  onInvite: () => void;
}

export interface GameOptionsProps {
  isHost: boolean;
  rounds: number;
  setRounds: (val: number) => void;
  guessTime: number;
  setGuessTime: (val: number) => void;
}