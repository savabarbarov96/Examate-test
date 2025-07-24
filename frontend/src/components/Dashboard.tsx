import { logout } from "@/utils/auth/helpers";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setStatus } = useAuth();

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
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
