import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import api from "@/utils/api";

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
        const res = await api.get("/api/auth/me", { withCredentials: true });
        setUser(res.data);
        setStatus("authenticated");
      } catch(err) {
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    verifySession();
  }, []);

  useLayoutEffect(() => {
  const interceptor = api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest._retry && !originalRequest.url.includes("/auth/refresh")) {
        originalRequest._retry = true;

        if (error.response?.status === 401) {
          try {
            await api.get("/api/auth/refresh", { withCredentials: true });
            return api(originalRequest);
          } catch {
            setUser(null);
            setStatus("unauthenticated");
            return Promise.reject(error);
          }
        }

        if (error.response?.status === 403) {
          console.warn("User is locked or unverified:", error.response.data);
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return () => api.interceptors.response.eject(interceptor);
}, []);


  return (
    <AuthContext.Provider value={{ user, status, setStatus, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
