import { createContext,useContext,useEffect,useState}from "react"
import {io, Socket} from "socket.io-client"

import type { SocketContextType, SocketProviderProps } from "../types/socket.types"

const SocketContext= createContext<SocketContextType>({
    socket:null,
    isConnected:false,
});

export const SocketProvider=({children}:SocketProviderProps)=>{
    const [socket,setSocket]=useState<Socket|null>(null);
    const [isConnected,setIsConnected]=useState<boolean>(false);

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (!token) return;

        const socketInstance = io("http://localhost:5000",{
            auth:{token},
            transports:["websocket"],
        })
        socketInstance.on("connect",()=>{
            console.log("Connecté au serveur WebSocket:",socketInstance.id);
            setIsConnected(true);
        })
        socketInstance.on("disconnect",()=>{
            console.log("Déconnecté du serveur WebSocket")
            setIsConnected(false)
        })
        socketInstance.on("connect_error",(err)=>{
            console.error("Erreur de connexion Socket:", err.message);
            

        })
        setSocket(socketInstance)
        return ()=>{
            socketInstance.disconnect()
        }
    },[])
    return (
        <SocketContext.Provider value={{socket,isConnected}}>
        {children}
        </SocketContext.Provider>
    )
}
export const useSocket=():SocketContextType=>{
    const context = useContext(SocketContext);
    if(!context){
        throw new Error("useSocket doit être utilisé a l'intérieur d'un SocketProvider")
    }
    return context;
}