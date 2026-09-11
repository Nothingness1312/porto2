import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, ExternalLink } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { achievementsApi } from "@/lib/api";
import type { Achievement } from "@/types";

export default function About() {
  usePageMeta("About", "Who is behind the alias - background and achievements.");
  const { settings } = useSiteSettings();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    achievementsApi
      .list()
      .then((a) => setAchievements((Array.isArray(a) ? a : []).sort((x, y) => y.date.localeCompare(x.date))))
      .catch(() => {});
  }, []);

  const real = achievements.filter((a) => !a.isPlaceholder);
  const placeholders = achievements.filter((a) => a.isPlaceholder);

  const quickFacts = [
    { label: "language", value: settings.about_language || "Python / C / JS" },
    { label: "os", value: settings.about_os || "Arch / Kali" },
    { label: "editor", value: settings.about_editor || "Neovim" },
    { label: "tea", value: settings.about_tea || "critical" },
  ];

  return (
    <div>
      {/* Header */}
      <section className="border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-sm font-semibold text-volt">&gt; whoami -detail</p>
          <h1 className="display-xl mt-4">
            KKARINZZZ <span className="text-volt">#</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            {settings.about_intro || "Cybersecurity researcher, reverse engineer, and CTF player."}
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <SectionHeader annotation="// bio" title="Background" />
            <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                {settings.about_bio_1 ||
                  "I break software for a living and for fun. My focus is understanding how systems fail - then writing up exactly how, so the next person doesn't have to learn it the hard way."}
              </p>
              <p>
                {settings.about_bio_2 ||
                  "From binary exploitation to web app recon, every project here is documented with the same discipline: reproduce, isolate, exploit, fix, write it up."}
              </p>
              <p>
                {settings.about_bio_3 ||
                  "I spend most nights in CTF rooms, reversing firmware, and hunting bugs in things other people assume are safe."}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "focus", value: settings.about_focus || "reverse eng." },
                { label: "status", value: settings.about_status || "open to work" },
                { label: "timezone", value: settings.about_timezone || "UTC+7 (WIB)" },
              ].map((s) => (
                <div key={s.label} className="border-2 border-ink/15 p-4">
                  <p className="font-mono text-xs text-ink-faint">{s.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick facts sidebar */}
          <aside className="space-y-4">
            <div className="card-editorial p-5">
              <p className="font-mono text-xs text-ink-faint">// quick_facts</p>
              <ul className="mt-4 space-y-3 font-mono text-sm">
                {quickFacts.map((f) => (
                  <li key={f.label} className="flex justify-between gap-4">
                    <span className="text-ink-faint">{f.label}</span>
                    <span className="text-ink">{f.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-dashed border-blaze/50 bg-blaze/5 p-5">
              <p className="font-mono text-xs font-semibold text-blaze">[!] disclosure policy</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Responsible disclosure first. PoCs are privately shared with vendors before any timeline.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Achievements */}
      <section className="border-y-2 border-ink bg-paper-bright">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            annotation="// track_record"
            title="Achievements"
            description="Competition results and milestones."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {real.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <div className="group relative h-full border-2 border-ink bg-paper p-5 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-citron">
                  <span className="tag-chip tag-chip-volt">{a.type}</span>
                  <h3 className="mt-3 flex items-start gap-2 font-display text-xl font-bold text-ink">
                    <Award size={18} className="mt-1 shrink-0 text-citron" />
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.description}</p>
                  <p className="mt-4 font-mono text-xs text-ink-faint">
                    {a.organization} · {a.date.slice(0, 7)}
                  </p>
                  {a.link && (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-volt hover:underline"
                    >
                      proof <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {placeholders.length > 0 && (
            <div className="mt-10">
              <p className="font-mono text-sm text-ink-faint">// placeholder - replace with real results</p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {placeholders.map((a) => (
                  <div key={a.id} className="border-2 border-dashed border-ink/20 p-4 opacity-70">
                    <span className="tag-chip">{a.type}</span>
                    <p className="mt-2 font-mono text-sm text-ink">{a.title}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-faint">{a.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mt-12">
          <Link to="/contact" className="btn-hard">
            work with me
          </Link>
        </div>
      </section>
    </div>
  );
}