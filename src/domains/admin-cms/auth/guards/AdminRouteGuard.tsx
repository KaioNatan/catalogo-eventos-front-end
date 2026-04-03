import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth";

export function AdminRouteGuard(): ReactElement {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
