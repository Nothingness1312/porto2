import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { projectsApi } from "@/lib/api";
import { AdminPageHeader } from "./_shared";
import type { Project } from "@/types";

const EMPTY = {
  title: "",
  description: "",
  content: "",
  category: "research",
  difficulty: "medium",
  technologies: [] as string[],
  tools: [] as string[],
  githubUrl: "",
  demoUrl: "",
  coverImage: "",
  date: new Date().toISOString().slice(0, 10),
  featured: false,
  published: false,
};

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProjectForm() {
  usePageMeta("Project Form");
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ ...EMPTY });
  const [techStr, setTechStr] = useState("");
  const [toolsStr, setToolsStr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    projectsApi
      .list({ published: "all" })
      .then((data) => {
        const found = (Array.isArray(data) ? data : []).find((p: Project) => p.id === id);
        if (found) {
          setForm({
            title: found.title,
            description: found.description,
            content: found.content,
            category: found.category,
            difficulty: found.difficulty,
            technologies: found.technologies,
            tools: found.tools ?? [],
            githubUrl: found.githubUrl ?? "",
            demoUrl: found.demoUrl ?? "",
            coverImage: found.coverImage ?? "",
            date: found.date ?? "",
            featured: found.featured,
            published: found.published,
          });
          setTechStr(found.technologies.join(", "));
          setToolsStr((found.tools ?? []).join(", "));
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
      technologies: splitList(techStr),
      tools: splitList(toolsStr),
      githubUrl: form.githubUrl.trim() || null,
      demoUrl: form.demoUrl.trim() || null,
      coverImage: form.coverImage.trim() || null,
      published: publish,
    };
    try {
      if (isEdit && id) {
        await projectsApi.update(id, payload);
      } else {
        await projectsApi.create(payload as never);
      }
      nav("/admin/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
      setBusy(false);
    }
  };

  if (loading) return <p className="py-16 text-center font-mono text-sm text-ink-faint">loading case file<span className="animate-blink">_</span></p>;

  const inputCls =
    "w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none";
  const labelCls = "mb-1.5 block font-mono text-xs text-ink-soft";

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? "Edit project" : "New project"}
        annotation={`// ${isEdit ? "edit" : "create"}.case`}
        actions={<Link to="/admin/projects" className="btn-hard text-sm">cancel</Link>}
      />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      <form onSubmit={(e) => submit(e, form.published)} className="mx-auto max-w-3xl space-y-5">
        <div>
          <label className={labelCls}>title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Project title" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>category *</label>
            <input required value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="web / forensics / re / pwn" />
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
          <label className={labelCls}>description *</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
            placeholder="One-paragraph summary shown on cards and lists"
          />
        </div>

        <div>
          <label className={labelCls}>date (YYYY-MM-DD)</label>
          <input value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>technologies (comma separated)</label>
            <input value={techStr} onChange={(e) => setTechStr(e.target.value)} className={inputCls} placeholder="React, Node, IDA Pro" />
          </div>
          <div>
            <label className={labelCls}>tools (comma separated)</label>
            <input value={toolsStr} onChange={(e) => setToolsStr(e.target.value)} className={inputCls} placeholder="Burp, Ghidra, Wireshark" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>github url</label>
            <input value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} className={inputCls} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className={labelCls}>demo url</label>
            <input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className={labelCls}>content (markdown) *</label>
          <textarea
            required
            rows={16}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className={`${inputCls} font-mono text-[13px] leading-relaxed`}
            placeholder={"# Overview\n\n... write the case study ..."}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 font-mono text-sm text-ink-soft">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-volt" />
            featured
          </label>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-sm text-ink-soft">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-volt" />
            published
          </label>
        </div>

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