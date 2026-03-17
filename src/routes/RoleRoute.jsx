import { Navigate, useLocation } from "react-router-dom";
import { canAccessRoute } from "../lib/permissions";

export default function RoleRoute({ children }) {
  const location = useLocation();

  return canAccessRoute(location.pathname) ? children : <Navigate replace to="/dashboard" />;
}
