// ============================================================
// TYPES DE JEU (FRONT) — Miroir des types serveur nécessaires
// à l'affichage, + types purement front (phases d'UI, recherche)
// ============================================================

// Les phases officielles dictées par le serveur
export type GamePhase = "LOBBY" | "GUESS_SONG" | "GUESS_OWNER" | "SCOREBOARD";

// Phases d'AFFICHAGE côté front : on ajoute des états intermédiaires
// que le serveur n'a pas besoin de connaître
// - STARTING     : entre gameStarted et le premier newTrack (écran "Préparez-vous")
// - ROUND_RESULT : affichage du roundSummary avant la manche suivante
export type FrontGamePhase = GamePhase | "STARTING" | "ROUND_RESULT";

// Un joueur tel que le serveur nous l'envoie dans tous les payloads
export interface PublicPlayer {
  id: number;
  username: string;
  score: number;
}

// Ce que l'API /api/spotify/search renvoie pour l'auto-complétion
export interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
}

// La réponse révélée en phase GUESS_OWNER (envoyée par songPhaseEnded)
export interface RevealedTrack {
  title: string;
  artist: string;
  imageUrl: string; // pochette de l'album, affichée avec la réponse
}

// Props du composant GuessInput (centralisées ici, conformément
// à ta règle "tous les types dans src/types/")
export interface GuessInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: TrackSuggestion[];
  isSearching: boolean;
  // La suggestion COMPLÈTE (plus seulement l'id) : le serveur
  // vérifie la réponse par titre+artiste, pas uniquement par ID
  onSelect: (suggestion: TrackSuggestion) => void;
  disabled: boolean;
}

// Un joueur enrichi pour l'affichage de la sidebar du lobby :
// PublicPlayer (venant du serveur) + les 2 infos calculées côté front.
// REMPLACE l'ancien type LobbyPlayer.
export type SidebarPlayer = PublicPlayer & {
  isHost: boolean; // couronne 👑 : username === hostUsername
  isReady: boolean; // a choisi sa playlist (présent dans playersReady)
};

// Props du composant PlayerSidebar (remplace celles de lobby.types)
export interface PlayerSidebarProps {
  roomCode: string;
  players: SidebarPlayer[];
  onInvite: () => void;
}