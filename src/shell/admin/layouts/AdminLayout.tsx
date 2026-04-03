import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { AdminForbiddenBanner } from "@/shell/admin/components/AdminForbiddenBanner";
import { AdminHeader } from "@/shell/admin/header/AdminHeader";
import { AdminSidebar } from "@/shell/admin/sidebar/AdminSidebar";
import { useAdminAreaSeo } from "@/shell/admin/hooks/useAdminAreaSeo";

export function AdminLayout(): ReactElement {
  useAdminAreaSeo();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminForbiddenBanner />
      <AdminHeader />

      <div className="flex min-h-[calc(100vh-81px)] flex-col md:flex-row">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
