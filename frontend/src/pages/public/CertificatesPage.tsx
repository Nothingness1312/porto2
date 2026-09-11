import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Share2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { certificatesApi } from "@/lib/api";
import type { Certificate } from "@/types";

export default function CertificatesPage() {
  usePageMeta("Certificates", "Certifications, credentials, and completed training.");
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesApi
      .list()
      .then((data) =>
        setItems(
          (Array.isArray(data) ? data : []).sort((a, b) =>
            b.sortOrder - a.sortOrder || b.date.localeCompare(a.date)
          )
        )
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const share = async (c: Certificate) => {
    const payload = {
      title: `${c.title} - ${c.issuer}`,
      url: c.url || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(c.url || window.location.href);
      }
    } catch {
      // user dismissed share / clipboard unavailable
    }
  };

  const displayDate = (d: string) => d.slice(0, 4);

  return (
    <div>
      <section className="border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-sm font-semibold text-volt">&gt; openssl x509 -noout -text</p>
          <h1 className="display-xl mt-4">Certificates</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Certified, credentialed, and field-tested - verifiable via the issuing authority.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          annotation="// credentials"
          title="Credentials"
          description="Each card links to the original certificate. Click to verify, or share."
        />

        {loading ? (
          <p className="py-16 text-center font-mono text-sm text-ink-faint">loading credentials...</p>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-ink-faint">no certificates listed - vault empty</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.06}>
                <div
                  className={`card-editorial group flex h-full flex-col p-0 transition-transform hover:-translate-x-1 hover:-translate-y-1 ${
                    c.url ? "cursor-pointer hover:shadow-hard-volt" : "hover:shadow-hard"
                  }`}
                  role={c.url ? "link" : undefined}
                  tabIndex={c.url ? 0 : undefined}
                  onClick={() => c.url && window.open(c.url, "_blank", "noopener,noreferrer")}
                  onKeyDown={(e) => {
                    if (c.url && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      window.open(c.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  <div className="flex h-40 items-center justify-center overflow-hidden border-b-2 border-ink bg-paper-dark">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={`${c.title} certificate`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-display text-5xl font-extrabold text-ink-faint">
                        {(c.title[0] ?? "C").toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl font-bold leading-tight text-ink">
                          {c.title}
                        </h2>
                        <p className="mt-1 font-mono text-sm text-blaze">{c.issuer}</p>
                      </div>
                      <span className="shrink-0 rounded-sm border border-ink/20 bg-paper-dark px-2.5 py-1 font-mono text-xs text-ink-soft">
                        {c.date ? displayDate(c.date) : "-"}
                      </span>
                    </div>

                    {c.description && (
                      <p className="text-sm leading-relaxed text-ink-soft">{c.description}</p>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-2">
                      {c.url ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-volt">
                          verify credential <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-ink-faint">no public link</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          share(c);
                        }}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-ink/20 bg-paper-bright px-2.5 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-volt hover:text-volt"
                        aria-label={`Share ${c.title}`}
                      >
                        <Share2 size={12} /> share
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-wrap gap-4">
          <Link to="/projects" className="btn-hard">
            see the work <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-hard-primary">
            contact me
          </Link>
        </div>
      </section>
    </div>
  );
}