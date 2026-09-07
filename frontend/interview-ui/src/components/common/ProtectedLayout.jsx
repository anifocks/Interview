import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "./Layout.jsx";

export function ProtectedLayout({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const home = user.role === "INTERVIEWER" ? "/interviewer/dashboard" : "/candidate/dashboard";
    return <Navigate to={home} replace />;
  }

  return <Layout>{children}</Layout>;
}