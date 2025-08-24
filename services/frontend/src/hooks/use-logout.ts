// hooks/useLogout.ts
import axios from "axios";
import { useNavigate } from "react-router";

export function useLogout() {
  const navigate = useNavigate();

  return async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      localStorage.clear();

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
}
