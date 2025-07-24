import { useAuth } from "@/contexts/AuthProvider";
import { JSX } from "react";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth();

  if (status === "checking" || status === "idle") return null;

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}
