import { useEffect, useState, useCallback } from "react";
import { Mail, MailOpen, Trash2, ExternalLink } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { messagesApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner, ConfirmDelete } from "./_shared";
import type { Message } from "@/types";

export default function AdminMessages() {
  usePageMeta("Admin Messages");
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    messagesApi
      .list()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (m: Message) => {
    try {
      await messagesApi.setRead(m.id, !m.read);
      setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, read: !m.read } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "update failed");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      await messagesApi.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "delete failed");
      setPendingDelete(null);
    }
  };

  const unread = rows.filter((r) => !r.read).length;

  if (loading) return <AdminSpinner />;

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        annotation={`// inbox - ${unread} unread`}
        actions={
          <span className="rounded-sm border border-ink/20 px-3 py-1.5 font-mono text-xs text-ink-soft">
            {rows.length} total
          </span>
        }
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      {rows.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-ink/20 p-12 text-center">
          <Mail size={28} className="mx-auto text-ink-faint" />
          <p className="mt-3 font-mono text-sm text-ink-faint">no messages yet - contact form submissions land here.</p>
        </div>
      ) : (
        <ul className="divide-y-2 divide-dashed divide-ink/10 border-2 border-ink/15 bg-paper-bright">
          {rows.map((m) => (
            <li key={m.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${m.read ? "opacity-70" : ""}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {!m.read && <span className="tag-chip bg-volt/10 text-volt">new</span>}
                  <span className="font-display text-base font-bold text-ink">{m.name}</span>
                  <a href={`mailto:${m.email}`} className="font-mono text-xs text-volt hover:underline">
                    {m.email} <ExternalLink size={11} className="inline" />
                  </a>
                  <span className="font-mono text-[11px] text-ink-faint">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{m.message}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleRead(m)}
                  className="rounded-sm border border-ink/20 px-2.5 py-1 text-xs text-ink-soft hover:border-volt hover:text-volt"
                >
                  {m.read ? <><MailOpen size={12} className="inline" /> unread</> : <><Mail size={12} className="inline" /> read</>}
                </button>
                <button
                  onClick={() => setPendingDelete(m)}
                  className="rounded-sm border border-ink/20 px-2.5 py-1 text-xs text-ink-soft hover:border-alert hover:text-alert"
                >
                  <Trash2 size={12} className="inline" /> delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDelete label={`Delete message from "${pendingDelete.name}"?`} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}