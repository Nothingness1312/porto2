import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, List } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { writeupsApi } from "@/lib/api";
import type { Writeup } from "@/types";

function label(s: string) {
  return s
    .split("-")
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join(" ");
}

function extractHeadings(md: string): { id: string; text: string; level: number }[] {
  const lines = md.split("\n");
  const out: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const text = m[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    out.push({ id, text, level: m[1].length });
  }
  return out;
}

export default function WriteupDetail() {
  const { slug = "" } = useParams();
  usePageMeta("Writeup", "Research publication.");
  const [writeup, setWriteup] = useState<Writeup | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setWriteup(null);
    setNotFound(false);
    writeupsApi
      .get(slug)
      .then((data) => setWriteup(data))
      .catch(() => setNotFound(true));
  }, [slug]);

  const headings = writeup ? extractHeadings(writeup.content) : [];
  const words = writeup ? writeup.content.split(/\s+/).length : 0;
  const mins = Math.max(1, Math.round(words / 180));

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-blaze">404 - note not found</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">This writeup doesn't exist.</h1>
        <Link to="/writeups" className="btn-hard mt-8">
          <ArrowLeft size={16} /> back to writeups
        </Link>
      </div>
    );
  }

  if (!writeup) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-ink-faint">loading note<span className="animate-blink">_</span></p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
      {/* ToC sidebar */}
      {headings.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-24 border-2 border-ink/15 bg-paper-bright p-4">
            <p className="flex items-center gap-2 font-mono text-xs font-bold text-ink">
              <List size={14} /> on this page
            </p>
            <nav className="mt-4 space-y-2">
              {headings.map((h, i) => (
                <a
                  key={i}
                  href={`#${h.id}`}
                  className={`block font-mono text-xs leading-relaxed text-ink-soft hover:text-volt ${
                    h.level === 3 ? "pl-3" : "font-semibold text-ink"
                  }`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}

      <article className="min-w-0">
        <Link to="/writeups" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint hover:text-volt">
          <ArrowLeft size={14} /> /writeups
        </Link>

        <header className="mt-6 border-b-2 border-ink pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag-chip tag-chip-volt">{label(writeup.category)}</span>
            <span className="tag-chip">{writeup.difficulty}</span>
            {!writeup.published && <span className="font-mono text-xs text-alert">[draft]</span>}
          </div>
          <h1 className="display-xl mt-4">{writeup.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{writeup.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-faint">
            <span>published: {writeup.publishedAt ? writeup.publishedAt.slice(0, 10) : writeup.createdAt.slice(0, 10)}</span>
            <span>{mins} min read</span>
            <span>~{words} words</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {writeup.tags.map((t) => (
              <span key={t} className="tag-chip">#{t}</span>
            ))}
          </div>
        </header>

        {/* Mobile ToC */}
        {headings.length > 0 && (
          <details className="mt-5 border-2 border-ink/15 bg-paper-bright p-4 lg:hidden">
            <summary className="cursor-pointer font-mono text-xs font-bold text-ink">
              on this page ({headings.length})
            </summary>
            <nav className="mt-3 space-y-1.5">
              {headings.map((h, i) => (
                <a key={i} href={`#${h.id}`} className={`block font-mono text-xs text-ink-soft hover:text-volt ${h.level === 3 ? "pl-3" : "font-semibold"}`}>
                  {h.text}
                </a>
              ))}
            </nav>
          </details>
        )}

        <div className="markdown-body mt-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h2: ({ children }) => <h2 id={String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}>{children}</h2>,
              h3: ({ children }) => <h3 id={String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}>{children}</h3>,
            }}
          >
            {writeup.content}
          </ReactMarkdown>
        </div>

        <div className="mt-12 border-t-2 border-dashed border-ink/15 pt-6">
          <Link to="/writeups" className="font-mono text-sm text-volt hover:underline">
            ← all writeups
          </Link>
        </div>
      </article>
    </div>
  );
}