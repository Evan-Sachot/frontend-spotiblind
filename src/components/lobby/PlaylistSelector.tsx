// src/components/lobby/PlaylistSelector.tsx
import type { PlaylistSelectorProps } from "../../types/playlist.types";

export const PlaylistSelector = ({ playlists, selectedPlaylistId, onSelectPlaylist, isLoading }: PlaylistSelectorProps) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-[#1DB954] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center text-purple-300 p-8 italic">
        Aucune playlist trouvée sur ton compte Spotify.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold text-white mb-4">Choisis ta playlist pour la partie</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar">
        {playlists.map((playlist) => {
          const isSelected = selectedPlaylistId === playlist.id;

          return (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 text-left group ${
                isSelected 
                  ? "bg-purple-800/80 ring-4 ring-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.5)] transform scale-105" 
                  : "bg-purple-900/40 hover:bg-purple-800/60 ring-1 ring-purple-500/30"
              }`}
            >
              <div className="w-full aspect-square rounded-md overflow-hidden mb-3 shadow-md relative">
                <img 
                  src={playlist.imageUrl || "https://placehold.co/150x150/3B0764/FFFFFF?text=Mix"} 
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#1DB954]/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="font-bold text-sm text-white truncate w-full text-center">
                {playlist.name}
              </span>
              <span className="text-xs text-purple-300 mt-1">
                {playlist.trackCount} titres
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};