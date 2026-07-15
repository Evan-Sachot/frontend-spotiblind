import { useLobbyLogic } from "../hooks/useLobbyLogic";
import { useSpotifyPlaylists } from "../hooks/useSpotifyPlaylists";
import { PlayerSidebar } from "../components/lobby/PlayerSidebar";
import { GameOptions } from "../components/lobby/GameOptions";
import { PlaylistSelector } from "../components/lobby/PlaylistSelector";
import { Button } from "../components/ui/Button";

export const Lobby = () => {
  const lobby = useLobbyLogic();
  const spotify = useSpotifyPlaylists();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5c258d] to-[#430a68] text-white font-sans flex flex-col">
      <header className="flex justify-between items-center p-6">
        <button className="text-white hover:opacity-80 transition-opacity">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-10 h-10 bg-purple-500 rounded-sm border-2 border-white shadow-lg overflow-hidden">
          <img src="https://i.pravatar.cc/150?img=1" alt="Mon profil" className="w-full h-full object-cover" />
        </div>
      </header>

      {!lobby.activeRoom ? (
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-6xl md:text-8xl font-black mb-16 drop-shadow-xl tracking-wider uppercase">
            Spoti-Blind
          </h1>

          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
            
            {!lobby.showJoinInput ? (
              <button 
                onClick={lobby.handleJoinClick}
                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xl font-bold py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
              >
                Join
              </button>
            ) : (
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={lobby.roomCodeInput}
                  onChange={(e) => lobby.setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="CODE (ABCD)"
                  maxLength={4}
                  className="w-full bg-white/10 border-2 border-[#1DB954] text-white text-center text-2xl font-black tracking-[0.5em] py-4 rounded-lg focus:outline-none"
                  autoFocus
                />
                <button 
                  onClick={() => lobby.submitJoinRoom()}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-2 rounded-lg"
                >
                  Valider
                </button>
                {lobby.error && <span className="text-red-400 text-sm text-center">{lobby.error}</span>}
              </div>
            )}
            <button 
              onClick={lobby.handleCreateRoom}
              className="flex-1 bg-[#3B0764] hover:bg-[#4c0a82] border border-purple-500/30 text-white text-xl font-bold py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              Create
            </button>
          </div>
        </div>
        
      ) : (
        
        <div className="flex-1 flex items-stretch p-6 gap-6 max-w-7xl w-full mx-auto">
          
          <PlayerSidebar 
            roomCode={lobby.activeRoom} 
            players={lobby.players} 
            onInvite={lobby.copyInviteCode} 
          />
          <div className="flex-1 flex flex-col relative">
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => lobby.setActiveTab("presets")}
                className={`px-8 py-3 rounded-t-xl font-bold text-lg transition-colors ${lobby.activeTab === "presets" ? "bg-[#2D054D] text-white" : "bg-[#2D054D]/50 text-purple-400 hover:text-white"}`}
              >
                préréglages
              </button>
              <button 
                onClick={() => lobby.setActiveTab("options")}
                className={`px-8 py-3 rounded-t-xl font-bold text-lg transition-colors ${lobby.activeTab === "options" ? "bg-[#2D054D] text-white" : "bg-[#2D054D]/50 text-purple-400 hover:text-white"}`}
              >
                options
              </button>
              <button 
                onClick={() => lobby.setActiveTab("playlists")}
                className={`px-8 py-3 rounded-t-xl font-bold text-lg transition-colors ${lobby.activeTab === "playlists" ? "bg-[#2D054D] text-white" : "bg-[#2D054D]/50 text-purple-400 hover:text-white"}`}
              >
                playlists
              </button>
            </div>
            <div className="flex-1 bg-[#2D054D] rounded-b-xl rounded-tr-xl p-8 shadow-2xl overflow-hidden flex flex-col">
              
              {lobby.activeTab === "options" && (
                <GameOptions 
                  isHost={lobby.isHost}
                  rounds={lobby.rounds}
                  setRounds={lobby.setRounds}
                  guessTime={lobby.guessTime}
                  setGuessTime={lobby.setGuessTime}
                />
              )}

              {lobby.activeTab === "playlists" && (
                <PlaylistSelector 
                  playlists={spotify.playlists} 
                  isLoading={spotify.isLoading}
                  selectedPlaylistId={lobby.selectedPlaylist}
                  onSelectPlaylist={lobby.handleSelectPlaylist}
                />
              )}

              {lobby.activeTab === "presets" && (
                <div className="flex items-center justify-center h-full text-purple-400/50 font-bold text-xl italic">
                  Les préréglages (modes de jeu) arriveront plus tard...
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="primary" onClick={lobby.handleLeaveRoom} className="w-auto px-10 bg-[#2D054D] hover:bg-purple-900 border border-purple-500/30">
                Quitter
              </Button>

              {lobby.isHost ? (
                <button 
                  onClick={lobby.startGame}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-12 py-4 rounded-lg font-black text-xl shadow-[0_0_20px_rgba(29,185,84,0.4)] transition-transform hover:scale-105 uppercase"
                >
                  Jouer
                </button>
              ) : (
                <div className="text-purple-300 font-bold animate-pulse text-lg">
                  En attente de l'hôte...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};