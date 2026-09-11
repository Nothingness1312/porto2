import { useEffect, useState, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { achievementsApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, ConfirmDelete } from "./_shared";
import type { Achievement } from "@/types";

interface Row extends Achievement {
  _editing: boolean;
}

const EMPTY = { title: "", description: "", date: "", organization: "", type: "ctf", link: "", image: "", isPlaceholder: true };

export default function AdminAchievements() {
  usePageMeta("Admin Achievements");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    achievementsApi
      .list()
      .then((data) =>
        setRows(
          (Array.isArray(data) ? data : [])
            .map((x) => ({ ...x, _editing: false }))
            .sort((a, b) => b.date.localeCompare(a.date))
        )
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const create = async () => {
    if (!draft.title.trim()) return;
    try {
      await achievementsApi.create({
        title: draft.title.trim(),
        organization: draft.organization.trim(),
        type: draft.type.trim() || "ctf",
        date: draft.date || new Date().toISOString().slice(0, 10),
        link: draft.link.trim() || null,
        image: draft.image.trim() || null,
        description: draft.description.trim(),
        isPlaceholder: draft.isPlaceholder,
      });
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
      await achievementsApi.remove(pendingDelete.id);
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
        title="Achievements"
        annotation="// track_record"
        actions={
          <button onClick={() => setIsNewOpen((v) => !v)} className="btn-hard-primary text-sm">
            {isNewOpen ? "cancel" : "+ add achievement"}
          </button>
        }
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      <div className="mb-6 flex items-center gap-3 border-2 border-citron/40 bg-citron/5 p-4">
        <p className="font-mono text-xs leading-relaxed text-ink-soft">
          <span className="font-bold text-citron">[!]</span> Seal example achievements with "placeholder" - replace with your real results before going live.
        </p>
      </div>

      {isNewOpen && (
        <div className="mb-8 border-2 border-ink bg-paper-bright p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="title *" value={draft.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
            <input placeholder="organization" value={draft.organization} onChange={(e) => set("organization", e.target.value)} className={inputCls} />
            <input placeholder="type (ctf / cert / cve ...)" value={draft.type} onChange={(e) => set("type", e.target.value)} className={inputCls} />
            <input placeholder="date (YYYY-MM-DD)" value={draft.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input placeholder="proof link (optional)" value={draft.link} onChange={(e) => set("link", e.target.value)} className={inputCls} />
            <input placeholder="image url (optional)" value={draft.image} onChange={(e) => set("image", e.target.value)} className={inputCls} />
          </div>
          <div className="mt-4">
            <textarea rows={2} placeholder="description" value={draft.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
          </div>
          <label className="mt-4 flex items-center gap-2 font-mono text-xs text-ink-soft">
            <input type="checkbox" checked={draft.isPlaceholder} onChange={(e) => set("isPlaceholder", e.target.checked)} className="h-4 w-4 accent-citron" />
            this is a placeholder (demo content)
          </label>
          <button onClick={create} className="btn-hard mt-4 text-sm">save achievement</button>
        </div>
      )}

      <div className="space-y-3">
        {rows.length === 0 && !loading && (
          <p className="py-10 text-center font-mono text-sm text-ink-faint">no achievements yet</p>
        )}
        {rows.map((r) => (
          <div key={r.id} className={`flex flex-wrap items-center gap-3 border-2 p-4 ${r.isPlaceholder ? "border-dashed border-ink/20" : "border-ink/15 bg-paper-bright"}`}>
            <span className="tag-chip tag-chip-volt w-24 shrink-0">{r.type}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {r.title}
                {r.isPlaceholder && <span className="ml-2 tag-chip border-citron/40 bg-citron/10 text-citron">placeholder</span>}
              </p>
              <p className="truncate text-xs text-ink-faint">
                {r.organization} · {r.date.slice(0, 7)}
                {r.link && <span className="ml-2 text-volt">proof ↗</span>}
              </p>
            </div>
            <button onClick={() => setPendingDelete(r)} className="rounded-sm border border-ink/20 p-1.5 text-ink-soft hover:border-alert hover:text-alert" aria-label={`Delete ${r.title}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2m1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6" /></svg>
            </button>
          </div>
        ))}
      </div>

      {pendingDelete && (
        <ConfirmDelete label={`Delete "${pendingDelete.title}"?`} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}