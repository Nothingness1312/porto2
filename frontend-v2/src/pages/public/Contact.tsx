import { useEffect, useState } from "react";
import { ExternalLink, Mail, Copy, Check, Send, Loader2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { messagesApi, socialsApi } from "@/lib/api";
import type { SocialLink } from "@/types";

export default function Contact() {
  usePageMeta("Contact", "Get in touch - collaboration, research, or questions.");
  const { settings } = useSiteSettings();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    socialsApi
      .list()
      .then((data) => setSocials(Array.isArray(data) ? data : []))
      .catch(() => setSocials([]));
  }, []);

  const email = settings.contact_email || "security@kkarinzzz.dev";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await messagesApi.create(form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="border-b-2 border-ink bg-paper bg-grid-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-sm font-semibold text-volt">&gt; nc kkarinzzz.dev 443</p>
          <h1 className="display-xl mt-4">Contact</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Open to security roles, CTF teams, research collaborations, and responsible disclosure.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_400px] lg:px-8">
        {/* Form */}
        <Reveal>
          <SectionHeader annotation="// transmit" title="Send a message" />
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block font-mono text-xs text-ink-soft">handle</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="your name / alias"
                  className="w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block font-mono text-xs text-ink-soft">reply to</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block font-mono text-xs text-ink-soft">message</label>
              <textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="what's on your mind? (keep it encrypted if it's sensitive)"
                className="w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-hard-primary disabled:opacity-50">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sending ? "transmitting..." : "send message"}
            </button>
            {error && <p className="font-mono text-xs text-alert">[!] {error}</p>}
            {sent && (
              <p className="font-mono text-xs text-ok">
                [ok] message delivered - expect a reply on your inbox within 48h.
              </p>
            )}
          </form>
        </Reveal>

        {/* Direct channels */}
        <div className="space-y-5">
          <Reveal delay={0.05}>
            <div className="card-editorial p-6">
              <p className="font-mono text-xs text-ink-faint">// direct</p>
              <div className="mt-4 flex items-center gap-3 border-2 border-dashed border-ink/20 p-3">
                <Mail size={18} className="shrink-0 text-volt" />
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{email}</span>
                <button
                  onClick={copyEmail}
                  className="shrink-0 rounded-sm border border-ink/20 p-1.5 text-ink-soft hover:border-volt hover:text-volt"
                  aria-label="Copy email"
                >
                  {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                PGP fingerprint available on request. For vulnerability reports: include a minimal repro, impact, and proposed timeline.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-editorial p-6">
              <p className="font-mono text-xs text-ink-faint">// channels</p>
              <ul className="mt-4 space-y-3">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 border-b-2 border-dashed border-ink/10 pb-3 font-mono text-sm text-ink hover:text-volt"
                    >
                      <span>{s.platform}</span>
                      <span className="flex items-center gap-2 text-xs text-ink-faint">
                        @{s.username || s.url.replace(/^https?:\/\//, "")} <ExternalLink size={12} />
                      </span>
                    </a>
                  </li>
                ))}
                {socials.length === 0 && (
                  <li className="font-mono text-xs text-ink-faint">no channels configured</li>
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="border-2 border-ink bg-night p-6 text-snow">
              <p className="font-mono text-xs text-citron">response time</p>
              <p className="mt-2 font-display text-2xl font-bold">{"< 48h"}</p>
              <p className="mt-2 text-sm text-snow/70">
                verified reports get priority - non-reproducible claims are politely ignored.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}