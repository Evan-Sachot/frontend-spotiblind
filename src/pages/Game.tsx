import { useGameLogic } from "../hooks/useGameLogic";
import { GuessInput } from "../components/game/GuessInput";

export const Game = () => {
  const game = useGameLogic();

  if (!game.gameState) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-[#5c258d] to-[#430a68] flex items-center justify-center text-white font-black text-2xl animate-pulse">
        Chargement de la partie...
      </div>
    );
  }

  const { phase, currentTrack, tracks, code, maxRounds, scores } = game.gameState;
  const currentTrackData = tracks[currentTrack];
  const realPlayers = Object.keys(scores).map((stringId) => {
    const id = Number(stringId);
    return {
      id,
      name: `Joueur ${id}`,
      score: scores[id] || 0
    };
  });
  const sortedPlayers = [...realPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#5c258d] to-[#430a68] text-white font-sans flex flex-col overflow-hidden relative">

      {phase === "GUESS_SONG" && currentTrackData?.previewUrl && (
        <audio src={currentTrackData.previewUrl} autoPlay />
      )}
      <header className="flex justify-between items-center p-6 shrink-0 z-10">
        <button className="text-white hover:opacity-80 transition-opacity">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="bg-white/90 text-black font-semibold text-sm rounded-full flex items-center shadow-lg">
          <span className="px-6 py-2">Mode de jeu</span>
          <span className="px-6 py-2 border-l border-gray-300 font-bold">{code}</span>
          <span className="px-6 py-2 border-l border-gray-300">
            {currentTrack + 1}/{maxRounds || tracks.length}
          </span>
        </div>

        <div className="w-10 h-10 bg-purple-500 rounded-sm border-2 border-white shadow-lg overflow-hidden">
          <img src="https://i.pravatar.cc/150?img=1" alt="Mon profil" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="flex-1 flex flex-row items-center justify-between w-full px-8 relative z-0">
        
        <div className="w-32 h-2/3 flex flex-col items-center justify-center gap-4">
          <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            {game.timeLeft}s
          </div>
          <div className="w-8 h-full bg-gray-900/50 border-4 border-gray-800 shadow-inner relative flex flex-col justify-end overflow-hidden">
            <div 
              className="w-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)] transition-all duration-1000 ease-linear"
              style={{ height: `${Math.max(0, (game.timeLeft / 30) * 100)}%` }}
            ></div>
          </div>
        </div>


        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto z-10 w-full">
          
          {phase === "SCOREBOARD" ? (
            <div className="w-full max-w-xl bg-[#2D054D]/95 p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
              <h2 className="text-4xl md:text-5xl font-black text-[#1DB954] mb-8 drop-shadow-md uppercase tracking-wider">
                Classement
              </h2>
              
              <div className="w-full flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {sortedPlayers.map((p, index) => (
                  <div key={p.id} className="flex justify-between items-center bg-purple-900/50 p-4 rounded-xl border border-purple-400/20">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-purple-300 w-8 text-right">{index + 1}.</span>
                      <span className="text-xl font-bold text-white">{p.name}</span>
                    </div>
                    <span className="text-2xl font-black text-[#1DB954]">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-900 shadow-2xl flex items-center justify-center mb-8 ${phase === "GUESS_SONG" ? "animate-[spin_4s_linear_infinite]" : ""}`}>
                <div className="w-[90%] h-[90%] rounded-full border border-gray-700/30 flex items-center justify-center">
                  <div className="w-[75%] h-[75%] rounded-full border border-gray-700/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {phase === "GUESS_SONG" ? (
                <div className="w-full max-w-md">
                  <GuessInput
                    searchQuery={game.searchQuery}
                    setSearchQuery={game.setSearchQuery}
                    suggestions={game.suggestions}
                    isSearching={game.isSearching}
                    onSelect={game.submitSongGuess}
                    disabled={false}
                  />
                </div>
              ) : (
                <div className="text-4xl md:text-5xl font-black text-[#1DB954] drop-shadow-[0_0_15px_rgba(29,185,84,0.6)] tracking-wide text-center">
                  {currentTrackData?.title || "Musique"}
                </div>
              )}
            </>
          )}
        </div>
        <div className="w-72 md:w-80 h-[60vh] bg-white/95 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="h-10 bg-purple-100 flex gap-2 p-2">
            <div className="flex-1 bg-purple-200 rounded"></div>
            <div className="flex-1 bg-purple-200 rounded"></div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
          </div>
          <div className="p-3 bg-gray-100 flex items-center gap-2">
            <input type="text" placeholder="Type in chat here..." className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none" />
            <button className="text-purple-600 hover:text-purple-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </main>
      <footer className="h-32 w-full flex items-center px-6 overflow-hidden shrink-0 z-10 pb-4">
        <div className="flex gap-4 w-full overflow-x-auto pb-4 custom-scrollbar items-center justify-center">
          {realPlayers.map((p) => (
            <button 
              key={p.id}
              onClick={() => phase === "GUESS_OWNER" && game.submitOwnerGuess(p.id)}
              className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-2 flex items-center justify-center shrink-0 transition-all ${
                phase === "GUESS_OWNER" 
                  ? "cursor-pointer hover:scale-110 hover:bg-white/40 border-[#1DB954] ring-4 ring-[#1DB954]/40" 
                  : "cursor-default border-white hover:bg-white/20"
              }`}
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span className="absolute -bottom-6 text-[11px] font-bold text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded-full">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </footer>

    </div>
  );
};