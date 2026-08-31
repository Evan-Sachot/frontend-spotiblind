// ============================================================
// PAGE GAME — L'écran de jeu, piloté par useGameLogic.
// Une section par phase : STARTING -> GUESS_SONG -> GUESS_OWNER
// -> ROUND_RESULT -> (boucle) -> SCOREBOARD.
//
// ⚠️ Plus AUCUNE donnée de piste ici : l'audio est géré dans le
// hook (new Audio) et le front ne connaît JAMAIS le titre avant
// que le serveur le révèle (anti-triche : rien dans l'inspecteur).
// ============================================================
import { useGameLogic } from "../hooks/useGameLogic";
import { GuessInput } from "../components/game/GuessInput";
import { LogoutButton } from "../components/ui/LogoutButton";

export const Game = () => {
  const game = useGameLogic();

  // Tri décroissant pour le classement (copie : on ne mute pas le state)
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  // Les usernames des propriétaires révélés au bilan de manche
  const ownerNames = game.players
    .filter((p) => game.roundOwnerIds.includes(p.id))
    .map((p) => p.username);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#5c258d] to-[#430a68] text-white font-sans flex flex-col overflow-hidden relative">
      {/* ===================== HEADER ===================== */}
      <header className="flex justify-between items-center gap-2 p-3 md:p-6 shrink-0 z-10">
        <div className="bg-white/90 text-black font-semibold text-sm rounded-full flex items-center shadow-lg">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-[#1DB954]" title="Connecté" />
          <span className="font-bold text-sm truncate max-w-[140px]">
          {game.currentUser?.username}
          </span>
          </div>
          <span className="px-3 md:px-6py-2 border-l border-gray-300 font-bold">
            {game.roomCode}
          </span>
          <span className="px-3 md:px-6 py-2 border-l border-gray-300">
            {game.currentRound}/{game.totalRounds}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Contrôle du volume (persisté via localStorage dans le hook) */}
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 md:px-4 py-2">
            <span className="text-sm">{game.volume === 0 ? "🔇" : "🔊"}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(game.volume * 100)}
              onChange={(e) => game.setVolume(Number(e.target.value) / 100)}
              className="w-16 md:w-24 accent-[#1DB954] cursor-pointer"
              title={`Volume : ${Math.round(game.volume * 100)}%`}
            />
          </div>

          <LogoutButton />
        </div>
      </header>

      {/* Les notifications ("X a trouvé !", déconnexions, erreurs)
          sont désormais gérées par le ToastContext global */}

      {/* ===================== CONTENU CENTRAL ===================== */}
      {/* Le main est "relative" : la section est centrée par rapport à
          l'ÉCRAN ENTIER (absolute inset-0), et la sidebar flotte en
          overlay à droite SANS décaler le centre — sinon le contenu
          serait centré dans "l'espace restant" et paraîtrait déporté */}
      <main className="flex-1 relative w-full min-h-0 flex flex-col md:block overflow-y-auto md:overflow-visible">
        {/* --- Zone principale (change selon la phase) --- */}
        <section className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-4 md:absolute md:inset-0 md:px-8">
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            {/* PHASE : la partie se lance */}
            {game.phase === "STARTING" && (
              <h2 className="text-3xl font-black animate-pulse">
                La partie commence...
              </h2>
            )}

            {/* PHASE : deviner la musique */}
            {game.phase === "GUESS_SONG" && (
              <>
                {/* Jauge de temps : plus de /30 en dur, on utilise totalTime */}
                <TimerGauge
                  timeLeft={game.timeLeft}
                  totalTime={game.totalTime}
                />

                {/* Autoplay bloqué par le navigateur : bouton de secours */}
                {game.isAudioBlocked && (
                  <button
                    onClick={game.enableAudio}
                    className="bg-white text-purple-900 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    🔊 Activer le son
                  </button>
                )}

                {game.hasFoundSong ? (
                  <p className="text-2xl font-black text-green-400">
                    Trouvé ! +10 points 🎉
                  </p>
                ) : (
                  <GuessInput
                    searchQuery={game.searchQuery}
                    setSearchQuery={game.setSearchQuery}
                    suggestions={game.suggestions}
                    isSearching={game.isSearching}
                    onSelect={game.submitSongGuess}
                    disabled={game.hasFoundSong}
                  />
                )}

                {/* Feedback bordure rouge de la maquette : mauvaise réponse */}
                {game.lastGuessWrong && !game.hasFoundSong && (
                  <p className="text-red-400 font-bold">Raté, réessaie !</p>
                )}
              </>
            )}

            {/* PHASE : voter le propriétaire de la musique */}
            {game.phase === "GUESS_OWNER" && game.revealedTrack && (
              <>
                <TimerGauge
                  timeLeft={game.timeLeft}
                  totalTime={game.totalTime}
                />

                {/* Pochette de l'album révélée avec la réponse */}
                {game.revealedTrack.imageUrl && (
                  <img
                    src={game.revealedTrack.imageUrl}
                    alt={`Pochette de ${game.revealedTrack.title}`}
                    className="w-44 h-44 rounded-xl shadow-2xl object-cover border-2 border-white/20"
                  />
                )}

                <div className="text-center">
                  <p className="text-sm uppercase tracking-widest text-purple-200">
                    C'était...
                  </p>
                  <h2 className="text-3xl font-black">
                    {game.revealedTrack.title}
                  </h2>
                  <p className="text-xl text-purple-200">
                    {game.revealedTrack.artist}
                  </p>
                </div>

                <p className="font-semibold">Dans la playlist de qui ?</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {game.players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => game.submitOwnerGuess(player.id)}
                      className={`px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 ${
                        game.myOwnerVote === player.id
                          ? "bg-green-400 text-purple-950" // mon vote actuel (modifiable)
                          : "bg-white/90 text-purple-900"
                      }`}
                    >
                      {player.username}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE : bilan de la manche */}
            {game.phase === "ROUND_RESULT" && (
              <div className="text-center">
                <h2 className="text-2xl font-black mb-2">Bilan de la manche</h2>
                <p className="text-purple-200">
                  {ownerNames.length > 0
                    ? `Cette musique venait de : ${ownerNames.join(", ")}`
                    : "Personne ne possédait cette musique ?!"}
                </p>
                <p className="mt-4 text-sm animate-pulse">
                  Manche suivante dans un instant...
                </p>
              </div>
            )}

            {/* PHASE : podium final */}
            {game.phase === "SCOREBOARD" && (
              <div className="text-center w-full max-w-md">
                <h2 className="text-3xl font-black mb-6">
                  🏆 Classement final
                </h2>
                <ol className="flex flex-col gap-2">
                  {sortedPlayers.map((player, index) => (
                    <li
                      key={player.id}
                      className={`flex justify-between px-6 py-3 rounded-lg font-bold ${
                        index === 0
                          ? "bg-yellow-400 text-purple-950"
                          : "bg-white/10"
                      } ${player.id === game.currentUser?.id ? "border-2 border-white" : ""}`}
                    >
                      <span>
                        {index + 1}. {player.username}
                      </span>
                      <span>{player.score} pts</span>
                    </li>
                  ))}
                </ol>

                {/* Seul l'hôte peut relancer (le back re-vérifie de toute façon) */}
                {game.isHost && (
                  <button
                    onClick={game.playAgain}
                    className="mt-8 bg-white text-purple-900 font-black px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    Rejouer
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* --- Sidebar scores : OVERLAY à droite, centré verticalement,
            n'influence pas le centrage du contenu principal --- */}
        {game.phase !== "SCOREBOARD" && (
          <aside className="w-[calc(100%-2rem)] mx-auto mb-4 max-h-40 overflow-y-auto bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-xl md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 md:w-60 md:max-h-[70%] md:mx-0 md:mb-0">
            <h3 className="font-black uppercase text-sm tracking-widest mb-3">
              Joueurs
            </h3>
            <ul className="flex flex-col gap-2">
              {sortedPlayers.map((player) => (
                <li
                  key={player.id}
                  className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2"
                >
                  <span className="font-semibold truncate">
                    {player.username}
                    {/* Check vert : ce joueur a trouvé la musique en cours */}
                    {game.playersWhoFound.includes(player.id) && " ✅"}
                  </span>
                  <span className="font-bold">{player.score}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </div>
  );
};

// ------------------------------------------------------------
// Petit composant local : la jauge de temps de la maquette.
// Largeur = pourcentage du temps restant (fourni par le serveur
// via duration, décompté localement par le hook).
// ------------------------------------------------------------
const TimerGauge = ({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) => {
  const percent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between text-sm font-bold mb-1">
        <span>Temps restant</span>
        <span>{timeLeft}s</span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default Game;
