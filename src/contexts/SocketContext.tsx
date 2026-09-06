import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { io } from "socket.io-client";
import type { TypedClientSocket } from "../types/socket.types";
import { API_URL } from "../config/env";

interface SocketContextValue {
  socket: TypedClientSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void; 
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
  const socketRef = useRef<TypedClientSocket | null>(null);

  const connect = () => {
    if (socketRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    const newSocket: TypedClientSocket = io(API_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
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

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
export const useSocket = () => useContext(SocketContext);
