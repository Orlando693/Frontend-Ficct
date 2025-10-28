import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { getRole, isAuthenticated } from "./session";

type Props = {
  roles?: string[]; // ej. ["CPD","Decanato"]
};

export default function RequireAuth({ roles, children }: PropsWithChildren<Props>) {
  // Permitir bypass en desarrollo si lo necesitas
  const bypass = (import.meta as any)?.env?.VITE_BYPASS_AUTH === "true";
  const location = useLocation();

  if (bypass) return <>{children}</>;

  if (!isAuthenticated()) {
    // redirige al login y recuerda a dónde quería ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const r = (getRole() || "").toString();
    if (!roles.includes(r)) {
      // si no tiene el rol, mándalo al inicio (o 403)
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
