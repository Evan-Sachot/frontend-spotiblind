import {Socket} from "socket.io-client"

export type SocketContextType = {
    socket:Socket | null;
    isConnected: boolean;
};

export type SocketProviderProps={
    children: React.ReactNode;
}