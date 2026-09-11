import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { AdminNav, BackToSite } from "./_shared";

export default function AdminLayout() {
  const nav = useNavigate();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then(() => setOk(true))
      .catch(() => nav("/admin/login", { replace: true }));
  }, [nav]);

  if (ok !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night">
        <p className="font-mono text-sm text-snow/60">
          checking session<span className="animate-blink">_</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink bg-night px-4 py-3 text-snow">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="font-mono text-sm font-bold">
            <span className="text-volt-cyan">lab.</span>control-panel
          </p>
          <BackToSite />
        </div>
      </header>

      <AdminNav />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}