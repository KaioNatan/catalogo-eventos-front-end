import { SiteFooter } from "@/shell/public/footer/SiteFooter";
import { TopNav } from "@/shell/public/navigation/TopNav";
import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";

export function PublicLayout(): ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
