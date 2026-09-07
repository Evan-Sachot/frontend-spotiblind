export type GamePhase = "LOBBY" | "GUESS_SONG" | "GUESS_OWNER" | "SCOREBOARD";

export type FrontGamePhase = GamePhase | "STARTING" | "ROUND_RESULT";

export interface PublicPlayer {
  id: number;
  username: string;
  score: number;
}

export interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
}

export interface RevealedTrack {
  title: string;
  artist: string;
  imageUrl: string; 
}

export interface GuessInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: TrackSuggestion[];
  isSearching: boolean;
  onSelect: (suggestion: TrackSuggestion) => void;
  disabled: boolean;
}


export type SidebarPlayer = PublicPlayer & {
  isHost: boolean; 
  isReady: boolean;
};

export interface PlayerSidebarProps {
  roomCode: string;
  players: SidebarPlayer[];
  onInvite: () => void;
}