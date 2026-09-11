import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { writeupsApi } from "@/lib/api";
import type { Writeup } from "@/types";

function label(s: string) {
  return s
    .split("-")
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Writeups() {
  usePageMeta("Writeups", "Research notes, methods, and post-mortems.");
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    writeupsApi
      .list({ published: true })
      .then((data) => setWriteups(Array.isArray(data) ? data : []))
      .catch(() => setWriteups([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const w of writeups) set.add(w.category);
    return ["all", ...Array.from(set)];
  }, [writeups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return writeups.filter((w) => {
      const matchCat = category === "all" || w.category === category;
      const matchQuery =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.excerpt.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [writeups, query, category]);

  const readTime = (w: Writeup) => {
    const words = w.excerpt?.split(/\s+/).length ?? 0;
    return Math.max(1, Math.round(words / 180));
  };

  return (
    <div>
      <section className="border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-sm font-semibold text-volt">&gt; cat ~/writeups</p>
          <h1 className="display-xl mt-4">Writeups</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Full technical publications - methodology, payloads, and lessons learned.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-2 border-ink bg-paper-bright p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search writeups, tags, keywords..."
              className="w-full rounded-sm border-2 border-ink/20 bg-paper py-2.5 pl-10 pr-4 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`tag-chip cursor-pointer transition-colors ${
                  category === c ? "tag-chip-volt border-volt/60" : "hover:border-ink/40"
                }`}
              >
                {label(c)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center font-mono text-sm text-ink-faint">parsing research notes...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-ink-faint">no writeups match the query</p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {filtered.map((w, i) => (
              <Reveal key={w.id} delay={(i % 2) * 0.05}>
                <Link
                  to={`/writeups/${w.slug}`}
                  className="group flex flex-col gap-4 border-2 border-ink/15 p-6 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:border-ink hover:bg-paper-bright hover:shadow-hard sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag-chip tag-chip-volt">{label(w.category)}</span>
                      <span className="tag-chip">{w.difficulty}</span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink group-hover:text-volt">{w.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{w.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {w.tags.slice(0, 4).map((t) => (
                        <span key={t} className="font-mono text-[11px] text-ink-faint">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <span className="font-mono text-xs text-ink-faint">
                      {w.publishedAt ? w.publishedAt.slice(0, 10) : w.createdAt.slice(0, 10)}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">{readTime(w)} min read</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-volt">
                      read <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}