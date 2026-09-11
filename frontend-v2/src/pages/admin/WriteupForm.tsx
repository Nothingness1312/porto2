import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { writeupsApi } from "@/lib/api";
import { AdminPageHeader } from "./_shared";
import type { Writeup } from "@/types";

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  category: "reverse-engineering",
  difficulty: "medium",
  tags: [] as string[],
  published: false,
  publishedAt: null as string | null,
};

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function WriteupForm() {
  usePageMeta("Writeup Form");
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ ...EMPTY });
  const [tagStr, setTagStr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    writeupsApi
      .list({ published: "all" })
      .then((data) => {
        const found = (Array.isArray(data) ? data : []).find((w: Writeup) => w.id === id);
        if (found) {
          setForm({
            title: found.title,
            excerpt: found.excerpt,
            content: found.content,
            category: found.category,
            difficulty: found.difficulty,
            tags: found.tags,
            published: found.published,
            publishedAt: found.publishedAt ?? null,
          });
          setTagStr(found.tags.join(", "));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      tags: splitList(tagStr),
      published: publish,
    };
    try {
      if (isEdit && id) {
        await writeupsApi.update(id, payload);
      } else {
        await writeupsApi.create(payload as never);
      }
      nav("/admin/writeups");
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
      setBusy(false);
    }
  };

  if (loading) return <p className="py-16 text-center font-mono text-sm text-ink-faint">loading note<span className="animate-blink">_</span></p>;

  const inputCls =
    "w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none";
  const labelCls = "mb-1.5 block font-mono text-xs text-ink-soft";

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? "Edit writeup" : "New writeup"}
        annotation={`// ${isEdit ? "edit" : "create"}.note`}
        actions={<Link to="/admin/writeups" className="btn-hard text-sm">cancel</Link>}
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      <form onSubmit={(e) => submit(e, form.published)} className="mx-auto max-w-3xl space-y-5">
        <div>
          <label className={labelCls}>title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Writeup title" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>category *</label>
            <input required value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="reverse-engineering / pwn / forensics" />
          </div>
          <div>
            <label className={labelCls}>difficulty *</label>
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={inputCls}>
              {["beginner", "easy", "medium", "hard", "expert"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>excerpt *</label>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            className={inputCls}
            placeholder="2-3 sentence summary for the listing page"
          />
        </div>

        <div>
          <label className={labelCls}>tags (comma separated)</label>
          <input value={tagStr} onChange={(e) => setTagStr(e.target.value)} className={inputCls} placeholder="frida, ssl-pinning, android" />
        </div>

        <div>
          <label className={labelCls}>content (markdown) * - h2/h3 become the table of contents</label>
          <textarea
            required
            rows={18}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className={`${inputCls} font-mono text-[13px] leading-relaxed`}
            placeholder={"## Recon\n\n... method ...\n\n## Exploitation\n\n... payloads ..."}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 font-mono text-sm text-ink-soft">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-volt" />
          published
        </label>

        <div className="flex flex-wrap gap-3 border-t-2 border-dashed border-ink/15 pt-6">
          <button type="button" onClick={(e) => submit(e, form.published)} disabled={busy} className="btn-hard-primary disabled:opacity-60">
            {busy ? "saving..." : isEdit ? "save changes" : "create draft"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={(e) => submit(e, true)}
              disabled={busy}
              className="rounded-md border-2 border-ink bg-ok px-5 py-2.5 font-semibold text-white hover:bg-ok/90 disabled:opacity-60"
            >
              save & publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
}