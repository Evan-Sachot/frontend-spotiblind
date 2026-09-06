import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { Login } from "./pages/Login";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/game" element={<Game />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
