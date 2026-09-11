import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function AdminPageHeader({ title, annotation, actions }: { title: string; annotation: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-dashed border-ink/20 pb-5">
      <div>
        <p className="font-mono text-xs text-volt">{annotation}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function AdminSpinner({ label = "loading..." }: { label?: string }) {
  return (
    <p className="py-16 text-center font-mono text-sm text-ink-faint">
      {label}
      <span className="animate-blink">_</span>
    </p>
  );
}

export function AdminEmpty({ message, onReset }: { message: string; onReset?: () => void }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-ink/20 p-10 text-center">
      <p className="font-mono text-sm text-ink-faint">{message}</p>
      {onReset && (
        <button onClick={onReset} className="mt-4 btn-hard text-sm">undo filters</button>
      )}
    </div>
  );
}

export function ConfirmDelete({
  onConfirm,
  onCancel,
  label,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg border-2 border-ink bg-paper-bright p-6 shadow-hard">
        <p className="font-mono text-sm font-bold text-alert">[!] confirm delete</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{label}</p>
        <p className="mt-1 font-mono text-xs text-ink-faint">This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-hard text-sm">cancel</button>
          <button onClick={onConfirm} className="rounded-md border-2 border-alert bg-alert px-4 py-2 text-sm font-semibold text-white hover:bg-alert/90">
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

export const NAV = [
  { to: "/admin/dashboard", label: "dashboard" },
  { to: "/admin/messages", label: "messages" },
  { to: "/admin/projects", label: "projects" },
  { to: "/admin/writeups", label: "writeups" },
  { to: "/admin/skills", label: "skills" },
  { to: "/admin/certificates", label: "certificates" },
  { to: "/admin/achievements", label: "achievements" },
  { to: "/admin/socials", label: "socials" },
  { to: "/admin/settings", label: "settings" },
];

export function AdminNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b-2 border-ink bg-paper-bright px-4 py-2">
      {NAV.map((item) => {
        const active = pathname === item.to || (item.to !== "/admin/dashboard" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`shrink-0 rounded-sm px-3 py-1.5 font-mono text-xs transition-colors ${
              active ? "bg-night text-snow" : "text-ink-soft hover:bg-paper-dark"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BackToSite() {
  return (
    <Link to="/" className="rounded-sm px-3 py-1.5 font-mono text-xs text-ink-soft hover:bg-paper-dark hover:text-volt">
      ← back to site
    </Link>
  );
}