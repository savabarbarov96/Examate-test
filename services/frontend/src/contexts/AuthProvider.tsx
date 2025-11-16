import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import authApi from "@/utils/auth/api";
import { subscribeToAuthEvents } from "@/utils/auth/sessionEvents";

type AuthStatus = "idle" | "authenticated" | "unauthenticated" | "checking";

interface AuthContextType {
  user: any | null;
  status: AuthStatus;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used in AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");

  useEffect(() => {
    const verifySession = async () => {
      setStatus("checking");
      try {
        const res = await authApi.get("/api/auth/me");
        setUser(res.data);
        setStatus("authenticated");
      } catch (err: any) {
        // The authApi interceptor will handle 401 errors and token refresh
        // If we reach here, either the refresh failed or it's a different error
        console.error("[AuthProvider] Session verification failed:", err.response?.data?.message || err.message);

        setUser(null);
        setStatus("unauthenticated");

        // If it's a 403 (locked/unverified account), log the specific reason
        if (err.response?.status === 403) {
          console.warn("[AuthProvider] Account access restricted:", err.response.data);
        }
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents((event) => {
      if (event.type === "SESSION_EXPIRED") {
        setUser(null);
        setStatus("unauthenticated");
        toast.warning(event.message || "Your session expired. Please sign in again.");
      }
    });

    return unsubscribe;
  }, [setStatus, setUser]);

  return (
    <AuthContext.Provider value={{ user, status, setStatus, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
