import {useAuthLogic} from "../hooks/useAuthLogic";
import {Button} from "../components/ui/Button";

export const Login =()=>{
    const {isNewUser, username, setUsername, error, handleSpotifyLogin, handleUsernameSubmit} = useAuthLogic();

    return(
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex flex-col items-center justify-center p-4 font-sans">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-12 drop-shadow-lg tracking-widest uppercase">Spoti-Blind</h1>
            <div className="w-full max-w-sm bg-purple-950/40 border border-purple-500/30 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
            {isNewUser ? (
                <div className="flex flex-col items-center gap-6">
                    <Button variant="spotify" onClick={handleSpotifyLogin}>
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.539-1.56.3z"/>
                        </svg>
                        Sign in with Spotify
                    </Button>
                    </div>
            ):(
                <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-purple-200 text-sm font-medium">
                            Choisis un Pseudo
                        </label>
                        <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        placeholder="Ex: PlayerOne"
                        maxLength={15}
                        className="w-full bg-purple-900/50 border border-purple-500/50 text-white placeholder-purple-400 rounded-md px-4 py-3 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all"
                        autoComplete="off"/>
                        {error && <span className="text-red-400 text-xs font-semibold">{error}</span>}
                    </div>
                    <Button variant="primary" type="submit">
                        Register
                    </Button>
                </form>
            )}
            </div>
        </div>
    )
}