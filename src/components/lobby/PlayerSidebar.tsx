import type { PlayerSidebarProps } from "../../types/game.types";

export const PlayerSidebar = ({
  roomCode,
  players,
  onInvite,
}: PlayerSidebarProps) => {
  return (
    <div className="w-full md:w-64 shrink-0 bg-[#3B0764] rounded-2xl flex flex-col p-4 md:p-6 shadow-2xl">
      <button
        onClick={onInvite}
        title="Cliquer pour copier le code"
        className="group text-center font-bold text-sm text-purple-300 mb-6 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
      >
        Code : <span className="font-black text-white">{roomCode}</span>
        <span className="block text-[10px] normal-case tracking-normal opacity-0 group-hover:opacity-100 transition-opacity">
           copier
        </span>
      </button>

      <ul className="flex flex-row flex-wrap md:flex-col gap-2 md:flex-1 overflow-y-auto">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-3 py-2">
          
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  p.isReady ? "bg-[#1DB954]" : "bg-white/20"
                }`}
                title={
                  p.isReady ? "Playlist choisie" : "En attente de playlist"
                }
              />
              <span className="text-sm font-semibold truncate">
                {p.username}
              </span>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${
                p.isHost ? "text-yellow-400" : "text-purple-300"
              }`}
            >
              {p.isHost ? "Hôte" : "Joueur"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerSidebar;
