import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { socket, disconnect } = useSocket();

  const handleLogout = () => {
    socket?.emit("leaveRoom");
    disconnect();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      title="Se déconnecter"
      className="w-10 h-10 bg-purple-950/60 hover:bg-red-500/80 border-2 border-white/40 hover:border-white rounded-sm shadow-lg flex items-center justify-center transition-colors group"
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
      </svg>
    </button>
  );
};

export default LogoutButton;
