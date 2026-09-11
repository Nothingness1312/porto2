import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FolderGit2, FileText } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageMeta } from "@/hooks/usePageMeta";
import { projectsApi, writeupsApi, skillsApi } from "@/lib/api";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";
import type { Project, Writeup, Skill } from "@/types";

function slugToLabel(s: string) {
  return s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

export default function Home() {
  usePageMeta("KKARINZZZ - Cybersecurity Researcher", "Breaking systems apart to understand how they work.");
  const { settings } = useSiteSettings();

  const [projects, setProjects] = useState<Project[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectsApi.list({ published: true, featured: true }),
      writeupsApi.list({ published: true }),
      skillsApi.list(),
    ])
      .then(([p, w, s]) => {
        setProjects(Array.isArray(p) ? p.slice(0, 3) : []);
        setWriteups((Array.isArray(w) ? w : []).slice(0, 3));
        setSkills(Array.isArray(s) ? s : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const groupedSkills = useMemo(() => {
    const m = new Map<string, Skill[]>();
    for (const s of skills) {
      if (!m.has(s.category)) m.set(s.category, []);
      m.get(s.category)!.push(s);
    }
    return Array.from(m.entries()).slice(0, 4);
  }, [skills]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="bg-hatch absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
          {/* Left - content */}
          <div className="flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-sm font-semibold text-volt"
            >
              &gt; whoami
            </motion.p>

            <h1 className="display-xl mt-4">
              {"KKARINZZZ".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <p className="mt-5 font-mono text-sm text-blaze sm:text-base">
                {settings.site_subtitle || "Cybersecurity Researcher"}
              </p>
              <p className="mt-1 font-mono text-xs text-ink-faint sm:text-sm">
                {settings.site_tagline || "CTF Player - Reverse Engineer - Security Enthusiast"}
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                {settings.hero_description || "Breaking systems apart to understand how they work."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MagneticButton onClick={() => (window.location.href = "/projects")}>
                  browse projects <ArrowRight size={16} />
                </MagneticButton>
                <Link to="/writeups" className="btn-hard">
                  read writeups
                </Link>
              </div>
            </motion.div>

            {/* status bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-dashed border-ink/15 pt-4 font-mono text-[11px] text-ink-faint"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> lab.status: operational
              </span>
              <span>last_scan: {today}</span>
              <span>open_to: {settings.open_to_collaboration === "true" ? "collaboration" : "selective"}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PROJECTS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          annotation="// case.files - featured"
          title="Featured research"
          description="Projects pulled straight from the lab. Each one is a documented investigation."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <Link
                to={`/projects/${p.slug}`}
                className={`card-editorial group block p-6 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-volt ${
                  i === 0 ? "md:col-span-2 md:p-8" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="tag-chip tag-chip-volt">{slugToLabel(p.category)}</span>
                  <span className="font-mono text-sm text-ink-faint">case: 0{i + 1}</span>
                </div>
                <h3 className={`mt-4 font-display font-extrabold tracking-tight text-ink group-hover:text-volt ${i === 0 ? "text-3xl" : "text-2xl"}`}>
                  {p.title}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{p.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.technologies.slice(0, 5).map((t) => (
                    <span key={t} className="tag-chip">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 font-mono text-xs text-volt">
                  view case study <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
          {projects.length === 0 && !loading && (
            <div className="col-span-2 rounded-lg border-2 border-dashed border-ink/20 p-10 text-center font-mono text-sm text-ink-faint">
              no featured projects - the lab is quiet
            </div>
          )}
        </div>
        <div className="mt-8 text-left">
          <Link to="/projects" className="btn-hard">
            all projects <FolderGit2 size={16} />
          </Link>
        </div>
      </section>

      {/* ================= STATS STRIP (night contrast) ================= */}
      <section className="border-y-2 border-ink bg-night bg-grid-night py-14 text-snow">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "projects", value: projects.length, fallback: 6 },
            { label: "writeups", value: writeups.length, fallback: 3 },
            { label: "skills", value: skills.length, fallback: 20 },
            { label: "tools in the lab", value: 12, fallback: 12, suffix: "+" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="border-l-2 border-snow/15 pl-4">
                <p className="font-display text-4xl font-extrabold text-snow sm:text-5xl">
                  <AnimatedCounter value={s.value || s.fallback} suffix={s.suffix} />
                </p>
                <p className="mt-1 font-mono text-xs text-snow/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SKILLS PREVIEW ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          annotation="// toolkit"
          title="Security toolkit"
          description="The instruments on the bench - grouped by discipline."
        />
        <div className="grid gap-10 md:grid-cols-2">
          {groupedSkills.map(([cat, items], gi) => (
            <Reveal key={cat} delay={gi * 0.06}>
              <div className="border-2 border-ink/15 p-5 transition-colors hover:border-volt">
                <p className="font-mono text-sm font-bold text-volt">{slugToLabel(cat)}</p>
                <ul className="mt-4 space-y-3">
                  {items.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-sm text-ink">{s.name}</span>
                        <span className="font-mono text-[10px] text-ink-faint">{s.proficiency}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-paper-dark">
                        <div
                          className="h-full rounded-sm bg-gradient-to-r from-volt to-volt-cyan"
                          style={{ width: `${s.proficiency}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= LATEST WRITEUPS ================= */}
      <section className="border-t-2 border-ink bg-paper-bright">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            annotation="// research.log"
            title="Latest writeups"
            description="Technical publications - methods, payloads, and post-mortems."
          />
          <ul className="divide-y-2 divide-dashed divide-ink/15 border-y-2 border-ink/15">
            {writeups.map((w) => {
              const words = w.excerpt?.split(/\s+/).length ?? 0;
              const mins = Math.max(1, Math.round(words / 180));
              return (
                <li key={w.id}>
                  <Link
                    to={`/writeups/${w.slug}`}
                    className="group flex flex-col gap-2 py-5 transition-colors hover:bg-paper-dark/60 sm:flex-row sm:items-center sm:gap-6"
                  >
                    <span className="w-28 shrink-0 font-mono text-xs text-ink-faint">
                      {w.publishedAt ? w.publishedAt.slice(0, 10) : w.createdAt.slice(0, 10)}
                    </span>
                    <span className="tag-chip shrink-0">{slugToLabel(w.category)}</span>
                    <span className="flex-1 font-semibold text-ink group-hover:text-volt">{w.title}</span>
                    <span className="flex items-center gap-3 font-mono text-[11px] text-ink-faint">
                      <span>{w.difficulty}</span>
                      <span>{mins} min read</span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {writeups.length === 0 && !loading && (
              <li className="py-8 text-center font-mono text-sm text-ink-faint">no writeups published yet</li>
            )}
          </ul>
          <div className="mt-8">
            <Link to="/writeups" className="btn-hard">
              all writeups <FileText size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}