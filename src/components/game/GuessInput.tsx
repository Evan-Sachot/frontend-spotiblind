import type { GuessInputProps } from "../../types/game.types";

export const GuessInput = ({ 
  searchQuery, 
  setSearchQuery, 
  suggestions, 
  isSearching, 
  onSelect,
  disabled 
}: GuessInputProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          placeholder="Titre de la musique ou artiste..."
          className="w-full bg-[#3B0764] border-2 border-purple-500/50 text-white text-xl md:text-2xl font-bold py-4 px-6 rounded-xl focus:outline-none focus:border-[#1DB954] shadow-lg disabled:opacity-50 transition-colors"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-[#1DB954] rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !disabled && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-[#2D054D] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
          {suggestions.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => onSelect(track.id)}
                className="w-full text-left flex items-center gap-4 p-3 hover:bg-purple-800/80 transition-colors border-b border-purple-500/10 last:border-none"
              >
                <div className="w-12 h-12 bg-purple-900 rounded flex-shrink-0 overflow-hidden">
                  {track.imageUrl && <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-bold truncate">{track.title}</span>
                  <span className="text-purple-300 text-sm truncate">{track.artist}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};