import { useEffect, useState, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { skillsApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, ConfirmDelete } from "./_shared";
import type { Skill } from "@/types";

interface Row extends Skill {
  _editing: boolean;
}

const EMPTY = { name: "", category: "research", description: "", proficiency: 60, icon: "", sortOrder: 0 };

export default function AdminSkills() {
  usePageMeta("Admin Skills");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    skillsApi
      .list()
      .then((data) =>
        setRows(
          (Array.isArray(data) ? data : [])
            .map((s) => ({ ...s, _editing: false }))
            .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        )
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (id: string, data: Partial<Skill>, then?: () => void) =>
    skillsApi
      .update(id, data)
      .then(() => {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data, _editing: false } : r)));
        then?.();
      })
      .catch((err: Error) => setError(err.message));

  const create = async () => {
    if (!draft.name.trim()) return;
    try {
      await skillsApi.create({ ...draft, icon: draft.icon || null, sortOrder: draft.sortOrder || rows.length });
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
      await skillsApi.remove(pendingDelete.id);
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
        title="Skills"
        annotation="// toolkit.bench"
        actions={
          <button onClick={() => setIsNewOpen((v) => !v)} className="btn-hard-primary text-sm">
            {isNewOpen ? "cancel" : "+ add skill"}
          </button>
        }
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      {isNewOpen && (
        <div className="mb-8 border-2 border-ink bg-paper-bright p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input placeholder="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            <input placeholder="category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inputCls} />
            <input type="number" placeholder="proficiency 0-100" min={0} max={100} value={draft.proficiency} onChange={(e) => setDraft({ ...draft, proficiency: Number(e.target.value) })} className={inputCls} />
            <input placeholder="icon (optional)" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className={inputCls} />
            <input type="number" placeholder="sort order" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} className={inputCls} />
          </div>
          <div className="mt-3">
            <textarea placeholder="description" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputCls} />
          </div>
          <button onClick={create} className="btn-hard mt-4 text-sm">save skill</button>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 border-2 border-ink/15 bg-paper-bright p-4 sm:flex-row sm:items-center">
            {r._editing ? (
              <>
                <input defaultValue={r.name} data-k="name" className={`${inputCls} sm:w-40`} />
                <input defaultValue={r.category} data-k="category" className={`${inputCls} sm:w-40`} />
                <input type="number" min={0} max={100} defaultValue={r.proficiency} data-k="proficiency" className={`${inputCls} sm:w-24`} />
                <input type="number" defaultValue={r.sortOrder} data-k="sortOrder" className={`${inputCls} sm:w-24`} />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`skill-${r.id}`)!.parentElement!;
                      const read = (k: string): string | number => {
                        const input = el.querySelector<HTMLInputElement>(`[data-k="${k}"]`)!;
                        return k === "proficiency" || k === "sortOrder" ? Number(input.value) : input.value;
                      };
                      patch(r.id, { name: String(read("name")), category: String(read("category")), proficiency: Number(read("proficiency")), sortOrder: Number(read("sortOrder")) });
                    }}
                    className="rounded-sm border-2 border-ink bg-ok px-3 py-1 text-xs font-semibold text-white"
                  >
                    save
                  </button>
                  <button onClick={() => patch(r.id, {}, () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: false } : x))))} className="rounded-sm border border-ink/20 px-3 py-1 text-xs text-ink-soft">
                    cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="font-mono text-sm font-semibold text-ink sm:w-44">{r.name}</span>
                <span className="tag-chip">{r.category}</span>
                <div className="hidden h-1.5 w-32 overflow-hidden rounded-sm bg-paper-dark lg:block">
                  <div className="h-full bg-gradient-to-r from-volt to-volt-cyan" style={{ width: `${r.proficiency}%` }} />
                </div>
                <span className="font-mono text-[11px] text-ink-faint sm:w-12">{r.proficiency}%</span>
                <p className="flex-1 truncate text-xs text-ink-faint">{r.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, _editing: true } : x)))} className="rounded-sm border border-ink/20 px-3 py-1 text-xs text-ink-soft hover:border-volt hover:text-volt">
                    edit
                  </button>
                  <button onClick={() => setPendingDelete(r)} className="rounded-sm border border-ink/20 px-3 py-1 text-xs text-ink-soft hover:border-alert hover:text-alert">
                    delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {pendingDelete && (
        <ConfirmDelete label={`Delete skill "${pendingDelete.name}"?`} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}