import type { SpotifyPlaylist } from "../../types/playlist.types";

interface PlaylistSelectorProps {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
}

export const PlaylistSelector = ({
  playlists,
  isLoading,
  selectedPlaylistId,
  onSelectPlaylist,
}: PlaylistSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-purple-300 font-bold animate-pulse">
        Chargement de tes playlists Spotify...
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-purple-400/50 font-bold italic">
        Aucune playlist trouvée sur ton compte Spotify.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="font-bold text-lg mb-4 shrink-0">
        Choisis ta playlist pour la partie
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 w-full">
          {playlists.map((playlist) => {
            const isSelected = playlist.id === selectedPlaylistId;
            return (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`flex flex-col rounded-xl overflow-hidden text-left transition-all hover:scale-[1.03] ${
                  isSelected
                    ? "ring-4 ring-[#1DB954] shadow-[0_0_20px_rgba(29,185,84,0.4)]"
                    : "ring-1 ring-white/10 hover:ring-white/40"
                }`}
              >
                <div className="relative w-full aspect-square bg-gradient-to-br from-purple-700 to-purple-950">
                  {playlist.imageUrl && (
                    <img
                      src={playlist.imageUrl}
                      alt={playlist.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-4xl">✓</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#3B0764] px-3 py-2">
                  <p className="text-sm font-bold truncate">{playlist.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelector;
