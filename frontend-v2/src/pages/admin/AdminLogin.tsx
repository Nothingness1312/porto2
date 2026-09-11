import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalSquare } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { authApi, ApiError } from "@/lib/api";

export default function AdminLogin() {
  usePageMeta("Admin Login");
  const nav = useNavigate();
  const { loading, signedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && signedIn) {
      nav("/admin/dashboard", { replace: true });
    }
  }, [loading, signedIn, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authApi.login(email, password);
      nav("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("access denied - bad credentials");
      } else {
        setError(err instanceof Error ? err.message : "login failed");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading || signedIn) return null;

  return (
    <div className="bg-grid-night flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <TerminalSquare size={36} className="mx-auto text-volt-cyan" />
          <p className="mt-3 font-mono text-sm text-snow/60">restricted area - authorized personnel only</p>
        </div>

        <form onSubmit={submit} className="rounded-lg border-2 border-paper-bright/20 bg-paper p-6 shadow-hard">
          <p className="font-mono text-xs text-ink-faint">$ ssh admin@lab</p>

          <label htmlFor="uname" className="mb-1.5 mt-4 block font-mono text-xs text-ink-soft">email</label>
          <input
            id="uname"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
            placeholder="admin@example.com"
          />

          <label htmlFor="pwd" className="mb-1.5 mt-4 block font-mono text-xs text-ink-soft">password</label>
          <input
            id="pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
            placeholder="••••••••"
          />

          {error && (
            <p className="mt-4 rounded-sm border border-alert/40 bg-alert/5 px-3 py-2 font-mono text-xs text-alert">{error}</p>
          )}

          <button type="submit" disabled={busy} className="btn-hard-primary mt-6 w-full justify-center disabled:opacity-60">
            {busy ? "authenticating..." : "login →"}
          </button>

          <p className="mt-4 text-center font-mono text-[10px] text-ink-faint">
            auth: supabase - admin account has app_metadata.role = "admin"
          </p>
        </form>
      </div>
    </div>
  );
}