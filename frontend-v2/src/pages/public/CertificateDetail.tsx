import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Share2, BadgeCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { certificatesApi } from "@/lib/api";
import type { Certificate } from "@/types";

export default function CertificateDetail() {
  const { id = "" } = useParams();
  usePageMeta("Certificate", "Credential detail.");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setCert(null);
    setNotFound(false);
    certificatesApi
      .get(id)
      .then((data) => setCert(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-blaze">404 - credential not found</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">This certificate doesn't exist.</h1>
        <p className="mt-3 text-ink-soft">The credential may have been removed or the link is wrong.</p>
        <Link to="/certificates" className="btn-hard mt-8">
          <ArrowLeft size={16} /> back to certificates
        </Link>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-ink-faint">loading credential<span className="animate-blink">_</span></p>
      </div>
    );
  }

  const share = async () => {
    const payload = {
      title: `${cert.title} - ${cert.issuer}`,
      url: cert.url || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(cert.url || window.location.href);
      }
    } catch {
      // user dismissed share / clipboard unavailable
    }
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <Link to="/certificates" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint hover:text-volt">
        <ArrowLeft size={14} /> /certificates
      </Link>

      {/* Header */}
      <header className="mt-6 border-b-2 border-ink pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="tag-chip tag-chip-volt">
            <BadgeCheck size={12} className="mr-1 inline" /> verified
          </span>
          {cert.url && (
            <span className="font-mono text-xs text-ink-soft">credential on file</span>
          )}
        </div>
        <h1 className="display-xl mt-4">{cert.title}</h1>
        <p className="mt-2 font-mono text-sm text-blaze">{cert.issuer}</p>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{cert.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-faint">
          <span>issued: {cert.date ? cert.date.slice(0, 10) : "-"}</span>
        </div>
      </header>

      {/* Certificate image */}
      <div className="mt-8 overflow-hidden border-2 border-ink bg-paper-dark shadow-hard">
        {cert.imageUrl ? (
          <img
            src={cert.imageUrl}
            alt={`${cert.title} certificate`}
            className="mx-auto h-auto w-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <span className="font-display text-7xl font-extrabold text-ink-faint">
              {(cert.title[0] ?? "C").toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {cert.url ? (
          <a
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-hard-primary inline-flex items-center gap-2"
          >
            verify credential <ExternalLink size={16} />
          </a>
        ) : (
          <span className="font-mono text-xs text-ink-faint">no public verification link</span>
        )}
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-paper-bright px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-volt hover:text-volt"
        >
          <Share2 size={14} /> share
        </button>
        <Link to="/certificates" className="btn-hard">
          all certificates
        </Link>
      </div>
    </article>
  );
}