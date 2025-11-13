import { useEffect, useState } from "react";
import { fetchActiveSessions, logout } from "@/utils/auth/helpers";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import { io } from "socket.io-client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setStatus } = useAuth();
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    const extractActiveSessions = async () => {
      try {
        const { activeSessions } = await fetchActiveSessions();
        setActiveSessions(activeSessions);
      } catch (err) {
        console.error("Failed to fetch active sessions:", err);
      }
    };

    extractActiveSessions();

    const socket = io(import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081");

    socket.on("activeSessionsUpdate", (data: { activeSessions: number }) => {
      setActiveSessions(data.activeSessions);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setStatus("unauthenticated");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="w-full max-w-sm md:max-w-3xl flex flex-col items-center justify-center gap-4">
      <p>You are logged in</p>

      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
        Active Sessions: {activeSessions}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
