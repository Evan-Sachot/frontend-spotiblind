import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken } from "../utils/auth.util";

export const ProtectedRoute = () => {
  const user = getUserFromToken();

  if (!user) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
