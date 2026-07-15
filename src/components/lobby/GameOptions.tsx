import type { GameOptionsProps } from "../../types/lobby.types";

export const GameOptions = ({ isHost, rounds, setRounds, guessTime, setGuessTime }: GameOptionsProps) => {
  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div className="flex flex-col gap-2">
        <label className="text-purple-200 font-semibold text-lg">Nombre de rounds : {rounds}</label>
        <input 
          type="range" min="5" max="20" step="1"
          value={rounds} 
          onChange={(e) => setRounds(Number(e.target.value))}
          disabled={!isHost}
          className="w-full accent-[#1DB954] cursor-pointer disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-purple-200 font-semibold text-lg">Temps par musique : {guessTime}s</label>
        <div className="flex gap-4">
          {[15, 30, 45].map((time) => (
            <button
              key={time}
              onClick={() => setGuessTime(time)}
              disabled={!isHost}
              className={`flex-1 py-2 rounded-lg font-bold border-2 transition-colors ${
                guessTime === time ? "bg-purple-600 border-purple-400" : "bg-purple-900/50 border-transparent hover:border-purple-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {time}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};