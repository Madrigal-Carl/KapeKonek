import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { getRoleRedirect } from "@/utils/getRoleRedirect";

export default function AuthRedirectRoute() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Redirect manager/dti users away from the public homepage
  if (isAuthenticated && [ROLES.MANAGER, ROLES.DTI].includes(role)) {
    return <Navigate to={getRoleRedirect(role)} replace />;
  }

  // Allow guests, buyers, farmers, and kaluppa to proceed
  return <Outlet />;
}
