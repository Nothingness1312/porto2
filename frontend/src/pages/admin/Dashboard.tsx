import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FolderGit2, FileText, Wrench, Trophy, Award, Share2, Activity, Mail } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { dashboardApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner } from "./_shared";
import type { DashboardStats } from "@/types";

export default function Dashboard() {
  usePageMeta("Admin Dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

const cards: { label: string; value: number | undefined; icon: React.ReactNode; to: string; accent: string }[] = [
    { label: "projects", value: stats?.projects, icon: <FolderGit2 size={20} />, to: "/admin/projects", accent: "text-volt" },
    { label: "writeups", value: stats?.writeups, icon: <FileText size={20} />, to: "/admin/writeups", accent: "text-blaze" },
    { label: "skills", value: stats?.skills, icon: <Wrench size={20} />, to: "/admin/skills", accent: "text-volt-cyan" },
    { label: "messages", value: stats?.messages, icon: <Mail size={20} />, to: "/admin/messages", accent: "text-ok" },
    { label: "unread messages", value: stats?.unreadMessages, icon: <Mail size={20} />, to: "/admin/messages", accent: "text-alert" },
    { label: "certificates", value: stats?.certificates, icon: <Award size={20} />, to: "/admin/certificates", accent: "text-ok" },
    { label: "achievements", value: stats?.achievements, icon: <Trophy size={20} />, to: "/admin/achievements", accent: "text-citron" },
    { label: "social links", value: stats?.socialLinks, icon: <Share2 size={20} />, to: "/admin/socials", accent: "text-blaze" },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-mono text-sm text-alert">[!] failed to load dashboard</p>
        <p className="mt-2 font-mono text-xs text-ink-faint">{error}</p>
        <button onClick={load} className="btn-hard mt-6 text-sm">retry</button>
      </div>
    );
  }

  if (!stats) return <AdminSpinner label="collecting metrics" />;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        annotation="// overview - live counts"
        actions={
          <Link to="/" className="btn-hard text-sm">
            view site
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="card-editorial group p-5 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-volt"
          >
            <div className="flex items-center justify-between">
              <span className={`${c.accent}`}>{c.icon}</span>
              <span className="font-mono text-[10px] text-ink-faint">/admin/{c.label.split(" ")[0]}</span>
            </div>
            <p className="mt-4 font-display text-4xl font-extrabold text-ink">{c.value ?? 0}</p>
            <p className="mt-1 font-mono text-xs text-ink-faint">{c.label}</p>
          </Link>
        ))}
        <div className="rounded-lg border-2 border-ink bg-night p-5 text-snow">
          <span className="text-volt-cyan"><Activity size={20} /></span>
          <p className="mt-4 font-display text-4xl font-extrabold">{stats.recentActivity.length}</p>
          <p className="mt-1 font-mono text-xs text-snow/60">recent events</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold text-ink">
          <Activity size={16} className="text-volt" /> recent activity log
        </h2>
        {stats.recentActivity.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-ink/20 p-10 text-center font-mono text-sm text-ink-faint">
            no activity yet - go create something
          </div>
        ) : (
          <ul className="divide-y-2 divide-dashed divide-ink/10 border-2 border-ink/15 bg-paper-bright">
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="w-24 shrink-0 font-mono text-[11px] text-ink-faint">
                  {a.createdAt.slice(0, 16).replace("T", " ")}
                </span>
                <span className="tag-chip">{a.action}</span>
                <span className="font-mono text-xs text-ink-soft">{a.entity}</span>
                {a.entityId && <span className="font-mono text-[10px] text-ink-faint">#{a.entityId.slice(0, 8)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}