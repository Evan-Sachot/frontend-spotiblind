export type GamePhase = "LOBBY" | "GUESS_SONG" | "GUESS_OWNER" | "SCOREBOARD";

export type BlindTestTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  ownerIds: number[];
};

export type GameState = {
  roomHost: string;
  code: string;
  phase: GamePhase;
  tracks: BlindTestTrack[];
  playlists?: Record<number, string>;
  currentTrack: number;
  scores: Record<number, number>;
  maxRounds?: number;
  roundCorrectPlayers?: Record<number, boolean>;
  roundOwnerGuesses?: Record<number, number>;
};


export type TrackSuggestion = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
};

export type GuessInputProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: TrackSuggestion[];
  isSearching: boolean;
  onSelect: (trackId: string) => void;
  disabled: boolean;
};