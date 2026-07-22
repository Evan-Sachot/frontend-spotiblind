// ============================================================
// SOCKET CONTEXT — UNE SEULE connexion Socket.io pour toute
// l'application, partagée à tous les composants via le contexte.
//
// Pourquoi connect() est exposé : au retour du callback Spotify,
// le token vient d'être posé dans le localStorage APRÈS le
// montage du provider. Sans connect(), le socket ne se créerait
// qu'au prochain rechargement complet de la page.
// ============================================================
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// "import type" obligatoire : verbatimModuleSyntax est activé dans le
// tsconfig — les types doivent être importés séparément des valeurs
import type { ReactNode } from "react";
import { io } from "socket.io-client";
import type { TypedClientSocket } from "../types/socket.types";
import { API_URL } from "../config/env";

interface SocketContextValue {
  socket: TypedClientSocket | null;
  isConnected: boolean;
  connect: () => void; // à appeler juste après avoir stocké le token (login)
  disconnect: () => void; // à appeler au logout
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<TypedClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Ref pour éviter les doubles connexions (StrictMode monte 2x en dev)
  const socketRef = useRef<TypedClientSocket | null>(null);

  const connect = () => {
    // Déjà connecté ? On ne crée pas de doublon.
    if (socketRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return; // pas de token = pas de connexion (le middleware back rejetterait)

    // Le JWT part dans le handshake : c'est ce que lit io.use() côté back
    const newSocket: TypedClientSocket = io(API_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    // Échec d'authentification du middleware (token invalide/expiré)
    newSocket.on("connect_error", (err) => {
      console.error("Connexion socket refusée :", err.message);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setIsConnected(false);
  };

  // Au montage de l'app : si un token existe déjà (session précédente),
  // on se connecte immédiatement
  useEffect(() => {
    connect();
    // Nettoyage à la fermeture de l'app
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook d'accès au contexte (évite d'importer useContext + SocketContext partout)
export const useSocket = () => useContext(SocketContext);
