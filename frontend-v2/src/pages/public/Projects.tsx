import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Search } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";

function label(s: string) {
  return s
    .split("-")
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Projects() {
  usePageMeta("Projects", "Case studies and research projects.");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    projectsApi
      .list({ published: true })
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) set.add(p.category);
    return ["all", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [projects, query, category]);

  return (
    <div>
      <section className="border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-sm font-semibold text-volt">&gt; ls ~/projects</p>
          <h1 className="display-xl mt-4">Projects</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Documented case studies - what was attacked, how it was broken, and how it was fixed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 border-2 border-ink bg-paper-bright p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search projects, tools, keywords..."
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

        {/* Results */}
        {loading ? (
          <p className="py-16 text-center font-mono text-sm text-ink-faint">scanning case files...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-ink-faint">no projects match the query</p>
            <p className="mt-2 font-mono text-xs text-ink-faint/70">try another category or clear the search</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 2) * 0.06}>
                <Link
                  to={`/projects/${p.slug}`}
                  className="card-editorial group flex h-full flex-col p-6 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-volt"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="tag-chip tag-chip-volt">{label(p.category)}</span>
                    {p.featured && <span className="font-mono text-xs text-blaze">[featured]</span>}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold text-ink group-hover:text-volt">{p.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{p.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.technologies.slice(0, 4).map((t) => (
                      <span key={t} className="tag-chip">{t}</span>
                    ))}
                    {p.technologies.length > 4 && (
                      <span className="tag-chip">+{p.technologies.length - 4}</span>
                    )}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t-2 border-dashed border-ink/15 pt-4 font-mono text-xs">
                    <span className="text-ink-faint">{p.date?.slice(0, 7) ?? p.createdAt.slice(0, 7)}</span>
                    <span className="flex items-center gap-3">
                      {p.githubUrl && (
                        <span className="flex items-center gap-1 text-ink-soft">
                          <GitBranch size={12} /> repo
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-volt">
                        details <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-10 border-t-2 border-dashed border-ink/15 pt-6 font-mono text-xs text-ink-faint">
          total: {filtered.length} of {projects.length} cases in archive
        </p>
      </section>
    </div>
  );
}