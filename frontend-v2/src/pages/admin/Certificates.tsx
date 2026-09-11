import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { certificatesApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, ConfirmDelete } from "./_shared";
import type { Certificate } from "@/types";

interface Row extends Certificate {
  _editing: boolean;
}

const EMPTY = {
  title: "",
  issuer: "",
  description: "",
  imageUrl: "",
  url: "",
  date: "",
  sortOrder: 0,
};

export default function AdminCertificates() {
  usePageMeta("Admin Certificates");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    certificatesApi
      .list()
      .then((data) =>
        setRows(
          (Array.isArray(data) ? data : [])
            .map((x) => ({ ...x, _editing: false }))
            .sort((a, b) => b.sortOrder - a.sortOrder || b.date.localeCompare(a.date))
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
    if (!draft.title.trim() || !draft.issuer.trim()) return;
    try {
      await certificatesApi.create({
        title: draft.title.trim(),
        issuer: draft.issuer.trim(),
        description: draft.description.trim(),
        imageUrl: draft.imageUrl.trim() || null,
        url: draft.url.trim() || null,
        date: draft.date || new Date().toISOString().slice(0, 10),
        sortOrder: draft.sortOrder || rows.length + 1,
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
      await certificatesApi.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "delete failed");
      setPendingDelete(null);
    }
  };

  const patch = (id: string, data: Partial<Certificate>, then?: () => void) =>
    certificatesApi
      .update(id, data)
      .then(() => {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data, _editing: false } : r)));
        then?.();
      })
      .catch((err: Error) => setError(err.message));

  const inputCls =
    "w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3 py-1.5 font-mono text-xs text-ink focus:border-volt focus:outline-none";

  if (loading) return <AdminSpinner />;

  const formRow = (label: string, node: React.ReactNode) => (
    <div>
      <span className="mb-1 block font-mono text-[10px] text-ink-faint">{label}</span>
      {node}
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Certificates"
        annotation="// credentials"
        actions={
          <button onClick={() => setIsNewOpen((v) => !v)} className="btn-hard-primary text-sm">
            <Plus size={14} /> {isNewOpen ? "cancel" : "add certificate"}
          </button>
        }
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      {isNewOpen && (
        <div className="mb-8 border-2 border-ink bg-paper-bright p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {formRow("title *", <input value={draft.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="CEH - Certified Ethical Hacker" />)}
            {formRow("issuer *", <input value={draft.issuer} onChange={(e) => set("issuer", e.target.value)} className={inputCls} placeholder="EC-Council" />)}
            {formRow("date (YYYY-MM-DD)", <input value={draft.date} onChange={(e) => set("date", e.target.value)} className={inputCls} placeholder="2024-05-10" />)}
            {formRow("sort (0 = top)", <input type="number" value={draft.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={inputCls} placeholder="1" />)}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {formRow("image url", <input value={draft.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={inputCls} placeholder="https://.../certificate.png" />)}
            {formRow("credential url", <input value={draft.url} onChange={(e) => set("url", e.target.value)} className={inputCls} placeholder="https://.../verify/abc123" />)}
          </div>
          <div className="mt-4">
            <textarea rows={3} placeholder="description" value={draft.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
          </div>
          <button onClick={create} className="btn-hard mt-4 text-sm">save certificate</button>
        </div>
      )}

      <div className="space-y-1">
        {rows.length === 0 && !loading && (
          <p className="py-10 text-center font-mono text-sm text-ink-faint">no certificates yet</p>
        )}
        {rows.map((r) => (
          <div key={r.id} id={`cert-${r.id}`} className="group flex items-start gap-3 border-2 border-ink/10 bg-paper-bright p-4 hover:border-ink/25">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden border-2 border-ink/15 bg-paper-dark">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-xs font-bold text-ink-faint">NOIMG</span>
              )}
            </div>

            {r._editing ? (
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input defaultValue={r.title} data-k="title" className={inputCls} placeholder="title" />
                <input defaultValue={r.issuer} data-k="issuer" className={inputCls} placeholder="issuer" />
                <input defaultValue={r.date.slice(0, 10)} data-k="date" className={inputCls} placeholder="date (YYYY-MM-DD)" />
                <input type="number" defaultValue={r.sortOrder} data-k="sortOrder" className={inputCls} placeholder="sort" />
                <input defaultValue={r.imageUrl ?? ""} data-k="imageUrl" className={inputCls} placeholder="image url" />
                <input defaultValue={r.url ?? ""} data-k="url" className={inputCls} placeholder="credential url" />
                <textarea rows={2} defaultValue={r.description} data-k="description" className={`${inputCls} sm:col-span-2`} placeholder="description" />
                <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`cert-${r.id}`)!.parentElement!;
                      const read = (k: string): string | number => {
                        const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-k="${k}"]`)!;
                        return k === "sortOrder" ? Number(input.value) : input.value;
                      };
                      patch(r.id, {
                        title: String(read("title")).trim(),
                        issuer: String(read("issuer")).trim(),
                        date: String(read("date")),
                        sortOrder: Number(read("sortOrder")),
                        imageUrl: String(read("imageUrl")).trim() || null,
                        url: String(read("url")).trim() || null,
                        description: String(read("description")).trim(),
                      });
                    }}
                    className="rounded-sm border-2 border-ink bg-ok px-3 py-1 text-xs font-semibold text-white"
                  >
                    save
                  </button>
                  <button
                    onClick={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: false } : x)))}
                    className="rounded-sm border border-ink/20 px-3 py-1 text-xs text-ink-soft"
                  >
                    cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-semibold text-ink">{r.title}</span>
                      <span className="text-blaze"> @ {r.issuer}</span>
                    </div>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {r.date ? r.date.slice(0, 10) : "no date"}
                      {r.url && <span className="ml-2 tag-chip tag-chip-volt">linked</span>}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{r.description}</p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-ink-faint">sort: {r.sortOrder}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: true } : x)))} className="rounded-sm border border-ink/20 px-3 py-1.5 text-xs text-ink-soft hover:border-volt hover:text-volt" aria-label={`Edit ${r.title}`}>
                    edit
                  </button>
                  <button onClick={() => setPendingDelete(r)} className="rounded-sm border border-ink/20 p-1.5 text-ink-soft hover:border-alert hover:text-alert" aria-label={`Delete ${r.title}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2m1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {pendingDelete && (
        <ConfirmDelete label={`Delete certificate "${pendingDelete.title} @ ${pendingDelete.issuer}"?`} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}