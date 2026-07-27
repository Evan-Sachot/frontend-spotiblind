// ============================================================
// PAGE LOBBY — Accueil (Join/Create) puis salon d'attente.
// Corrections :
// - sidebarPlayers (SidebarPlayer[]) passé à PlayerSidebar au lieu
//   des PublicPlayer bruts du serveur
// - code de salon à 6 caractères (aligné back + maquette "8537C4")
// - affichage des messages d'info du salon (arrivées/départs)
// ============================================================
import { useLobbyLogic } from "../hooks/useLobbyLogic";
import { useSpotifyPlaylists } from "../hooks/useSpotifyPlaylists";
import { PlayerSidebar } from "../components/lobby/PlayerSidebar";
import { GameOptions } from "../components/lobby/GameOptions";
import { PlaylistSelector } from "../components/lobby/PlaylistSelector";
import { LogoutButton } from "../components/ui/LogoutButton";
import type { SidebarPlayer } from "../types/game.types";

export const Lobby = () => {
  const lobby = useLobbyLogic();
  const spotify = useSpotifyPlaylists();

  // Adaptation des joueurs serveur (PublicPlayer) vers le format
  // d'affichage de la sidebar (couronne + badge "prêt")
  const sidebarPlayers: SidebarPlayer[] = lobby.players.map((player) => ({
    ...player,
    isHost: player.username === lobby.hostUsername,
    isReady: Boolean(lobby.playersReady[player.id]),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5c258d] to-[#430a68] text-white font-sans flex flex-col">
      <header className="flex justify-between items-center p-6">
        <button className="text-white hover:opacity-80 transition-opacity">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Bouton de déconnexion (remplace l'avatar de la maquette) */}
        <LogoutButton />
      </header>

      {!lobby.activeRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-6xl md:text-8xl font-black mb-16 drop-shadow-xl tracking-wider uppercase">
            Spoti-Blind
          </h1>

          {/* Erreur globale hors salon (salon introuvable, hôte parti...) */}
          {lobby.error && !lobby.showJoinInput && (
            <p className="text-red-400 font-bold mb-6">{lobby.error}</p>
          )}

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
                  onChange={(e) =>
                    lobby.setRoomCodeInput(e.target.value.toUpperCase())
                  }
                  placeholder="CODE (8537C4)"
                  maxLength={6} /* aligné sur le back : codes à 6 caractères */
                  className="w-full bg-white/10 border-2 border-[#1DB954] text-white text-center text-2xl font-black tracking-[0.5em] py-4 rounded-lg focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => lobby.submitJoinRoom()}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-2 rounded-lg"
                >
                  Valider
                </button>
                {lobby.error && (
                  <span className="text-red-400 text-sm text-center">
                    {lobby.error}
                  </span>
                )}
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
            players={
              sidebarPlayers
            } /* le format adapté, plus les joueurs bruts */
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

            {/* QUITTER / JOUER : grille 2 colonnes égales -> les deux
                boutons ont exactement la même taille et le même
                alignement, quel que soit leur contenu */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={lobby.handleLeaveRoom}
                className="py-4 rounded-lg font-black text-xl uppercase bg-[#2D054D] hover:bg-purple-900 border border-purple-500/30 text-white transition-transform hover:scale-[1.02]"
              >
                Quitter
              </button>

              {lobby.isHost ? (
                <button
                  onClick={lobby.startGame}
                  className="py-4 rounded-lg font-black text-xl uppercase bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-[0_0_20px_rgba(29,185,84,0.4)] transition-transform hover:scale-[1.02]"
                >
                  Jouer
                </button>
              ) : (
                /* Non-hôte : placeholder de MÊME hauteur que le bouton
                   pour garder la grille symétrique */
                <div className="py-4 flex items-center justify-center text-purple-300 font-bold text-lg animate-pulse">
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

export default Lobby;
