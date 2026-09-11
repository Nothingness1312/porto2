import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Pencil, Trash2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { projectsApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, AdminEmpty, ConfirmDelete } from "./_shared";
import type { Project } from "@/types";

function label(s: string) {
  return s
    .split("-")
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminProjects() {
  usePageMeta("Admin Projects");
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Project | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    projectsApi
      .list({ published: "all" })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!pending) return;
    try {
      await projectsApi.remove(pending.id);
      setPending(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "delete failed");
      setPending(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        annotation="// content.cases"
        actions={
          <Link to="/admin/projects/new" className="btn-hard-primary text-sm">
            <FilePlus2 size={15} /> new project
          </Link>
        }
      />

      {error && (
        <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>
      )}

      {loading ? (
        <AdminSpinner />
      ) : items.length === 0 ? (
        <AdminEmpty message="no projects yet - create the first case file" />
      ) : (
        <div className="overflow-x-auto border-2 border-ink/15 bg-paper-bright">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b-2 border-ink bg-paper-dark font-mono text-xs text-ink-soft">
                <th className="px-4 py-3">title</th>
                <th className="px-4 py-3">category</th>
                <th className="px-4 py-3">difficulty</th>
                <th className="px-4 py-3">status</th>
                <th className="px-4 py-3">updated</th>
                <th className="px-4 py-3 text-right">actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-ink/10">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-paper-dark/40">
                  <td className="max-w-[280px] px-4 py-3">
                    <Link to={`/projects/${p.slug}`} className="font-semibold text-ink hover:text-volt">
                      {p.title}
                    </Link>
                    <p className="truncate font-mono text-[11px] text-ink-faint">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tag-chip tag-chip-volt">{label(p.category)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{p.difficulty}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`tag-chip ${p.published ? "border-ok/40 bg-ok/10 text-ok" : "border-ink/20 text-ink-faint"}`}>
                        {p.published ? "published" : "draft"}
                      </span>
                      {p.featured && <span className="tag-chip border-blaze/40 bg-blaze/10 text-blaze">featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{p.updatedAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/projects/${p.id}/edit`}
                        className="rounded-sm border border-ink/20 p-1.5 text-ink-soft hover:border-volt hover:text-volt"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => setPending(p)}
                        className="rounded-sm border border-ink/20 p-1.5 text-ink-soft hover:border-alert hover:text-alert"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending && (
        <ConfirmDelete
          label={`Delete "${pending.title}"? This removes the case file and its history.`}
          onConfirm={remove}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}