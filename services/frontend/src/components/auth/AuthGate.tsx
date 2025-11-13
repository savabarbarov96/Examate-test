import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== "authenticated") return;

    const isAuthPage = ["/", "/forgot-password", "/change-password"].includes(
      location.pathname
    );

    isAuthPage ?? navigate("/dashboard", { replace: true });
  }, [status, location.pathname, navigate]);

  if (status === "checking" || status === "idle") {
    console.log(" hello from checking in auth gate");

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
