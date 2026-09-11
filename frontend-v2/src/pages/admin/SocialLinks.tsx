import { useEffect, useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { socialsApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, ConfirmDelete } from "./_shared";
import type { SocialLink } from "@/types";

interface Row extends SocialLink {
  _editing: boolean;
}

const EMPTY = { platform: "", url: "", username: "", icon: "", sortOrder: 0 };

export default function AdminSocials() {
  usePageMeta("Admin Social Links");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    socialsApi
      .list()
      .then((data) =>
        setRows((Array.isArray(data) ? data : []).map((x) => ({ ...x, _editing: false })).sort((a, b) => a.sortOrder - b.sortOrder || a.platform.localeCompare(b.platform)))
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (id: string, data: Partial<SocialLink>) =>
    socialsApi
      .update(id, data)
      .then(() => {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data, _editing: false } : r)));
      })
      .catch((err: Error) => setError(err.message));

  const create = async () => {
    if (!draft.platform.trim() || !draft.url.trim()) return;
    try {
      await socialsApi.create({ ...draft, icon: draft.icon, sortOrder: draft.sortOrder || rows.length });
      setIsNewOpen(false);
      setDraft({ ...EMPTY });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      await socialsApi.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "delete failed");
      setPendingDelete(null);
    }
  };

  const inputCls =
    "w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3 py-1.5 font-mono text-xs text-ink focus:border-volt focus:outline-none";

  if (loading) return <AdminSpinner />;

  return (
    <div>
      <AdminPageHeader
        title="Social Links"
        annotation="// channels.public"
        actions={
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="btn-hard text-sm">
            view on site <ExternalLink size={13} />
          </a>
        }
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      {isNewOpen && (
        <div className="mb-8 border-2 border-ink bg-paper-bright p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="platform (github / linkedin ...)" value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} className={inputCls} />
            <input placeholder="url *" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className={inputCls} />
            <input placeholder="username" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className={inputCls} />
            <input placeholder="icon name" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className={inputCls} />
          </div>
          <button onClick={create} className="btn-hard mt-4 text-sm">save link</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {rows.length === 0 && !loading && <p className="w-full py-10 text-center font-mono text-sm text-ink-faint">no social links configured</p>}
        {rows.map((r) =>
          r._editing ? (
            <div key={r.id} id={`social-${r.id}`} className="flex flex-wrap items-center gap-2 border-2 border-ink bg-paper-bright p-3">
              <input defaultValue={r.platform} data-k="platform" className={`${inputCls} w-32`} />
              <input defaultValue={r.url} data-k="url" className={`${inputCls} w-56`} />
              <input defaultValue={r.username} data-k="username" className={`${inputCls} w-32`} />
              <button
                onClick={() => {
                  const box = document.getElementById(`social-${r.id}`)!;
                  const read = (k: string) => (box.querySelector<HTMLInputElement>(`[data-k="${k}"]`)?.value ?? "").trim();
                  patch(r.id, { platform: read("platform"), url: read("url"), username: read("username") });
                }}
                className="rounded-sm border-2 border-ink bg-ok px-3 py-1 text-xs font-semibold text-white"
              >
                save
              </button>
              <button onClick={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: false } : x)))} className="rounded-sm border border-ink/20 px-3 py-1 text-xs text-ink-soft">
                cancel
              </button>
            </div>
          ) : (
            <div key={r.id} id={`social-${r.id}`} className="flex items-center gap-3 border-2 border-ink/15 bg-paper-bright px-4 py-3">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="group">
                <span className="font-semibold text-ink group-hover:text-volt">{r.platform}</span>
                <span className="ml-2 font-mono text-xs text-ink-faint">@{r.username || r.url.replace(/^https?:\/\//, "")}</span>
              </a>
              <button onClick={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: true } : x)))} className="rounded-sm border border-ink/20 px-2.5 py-1 text-xs text-ink-soft hover:border-volt hover:text-volt">
                edit
              </button>
              <button onClick={() => setPendingDelete(r)} className="rounded-sm border border-ink/20 px-2.5 py-1 text-xs text-ink-soft hover:border-alert hover:text-alert">
                delete
              </button>
            </div>
          )
        )}
      </div>

      <div className="mt-8">
        <button onClick={() => setIsNewOpen((v) => !v)} className="btn-hard text-sm">
          {isNewOpen ? "cancel" : "+ add link"}
        </button>
      </div>

      {pendingDelete && (
        <ConfirmDelete label={`Delete "${pendingDelete.platform}" from channels?`} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}