import { useAuth } from "@/contexts/AuthProvider";
import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "checking" || status === "idle") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
