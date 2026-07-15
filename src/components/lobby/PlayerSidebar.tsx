import type { PlayerSidebarProps } from "../../types/lobby.types";

export const PlayerSidebar = ({ roomCode, players, onInvite }: PlayerSidebarProps) => {
  return (
    <div className="w-64 bg-[#3B0764] rounded-2xl flex flex-col p-6 shadow-2xl relative">
      <h2 className="text-center font-bold text-sm text-purple-300 mb-6 uppercase tracking-widest">
        Code: {roomCode}
      </h2>
      
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-2">
            
            <div className="relative">
              <div className={`w-16 h-16 rounded-full border-2 overflow-hidden shadow-lg transition-all ${p.isReady ? "border-[#1DB954] ring-4 ring-[#1DB954]/50" : "border-white/20 bg-purple-500"}`}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`} alt={p.username} className="w-full h-full object-cover" />
              </div>
              
              {p.isReady && (
                <div className="absolute -bottom-2 -right-2 bg-[#1DB954] text-black text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-md border-2 border-[#3B0764]">
                  Prêt
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold">{p.username}</span>
              {p.isHost && <span className="text-[10px] text-purple-300 font-black uppercase tracking-wider">Hôte</span>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onInvite} className="mt-6 flex flex-col items-center gap-2 text-purple-300 hover:text-white transition-colors">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-dashed border-purple-400 flex items-center justify-center text-4xl hover:bg-purple-500/40">
          +
        </div>
        <span className="text-xs uppercase font-bold tracking-widest">Inviter</span>
      </button>
    </div>
  );
};