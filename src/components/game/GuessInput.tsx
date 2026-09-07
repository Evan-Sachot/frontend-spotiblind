import type { GuessInputProps } from "../../types/game.types";

export const GuessInput = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  isSearching,
  onSelect,
  disabled,
}: GuessInputProps) => {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={disabled}
        placeholder="Quel est ce titre ?"
        autoComplete="off"
        className="w-full bg-white/10 border-2 border-purple-400/50 focus:border-[#1DB954] text-white placeholder-purple-300 text-lg font-semibold px-5 py-4 rounded-xl focus:outline-none transition-colors disabled:opacity-50"
      />

      {isSearching && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-300 animate-pulse">
          ...
        </span>
      )}

      {suggestions.length > 0 && !disabled && (
      <ul className="absolute top-full mt-2 w-full max-h-[35vh] bg-[#2D054D] rounded-xl shadow-2xl z-50 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                onClick={() => onSelect(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-left transition-colors"
              >
                {suggestion.imageUrl && (
                  <img
                    src={suggestion.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{suggestion.title}</p>
                  <p className="text-xs text-purple-300 truncate">
                    {suggestion.artist}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuessInput;
