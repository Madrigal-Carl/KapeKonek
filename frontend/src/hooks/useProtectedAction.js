import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function useProtectedAction() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const protectedAction = ({
    role,
    onSuccess,
    redirect = "/login",
    unauthorizedMessage = "You are not authorized to perform this action.",
  }) => {
    // not logged in
    if (!user) {
      navigate(redirect);
      return;
    }

    // wrong role
    if (role) {
      const allowedRoles = Array.isArray(role) ? role : [role];
      if (!allowedRoles.includes(user.role)) {
        return;
      }
    }

    // success
    onSuccess?.();
  };

  return protectedAction;
}