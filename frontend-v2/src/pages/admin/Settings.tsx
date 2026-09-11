import { useEffect, useState, useCallback } from "react";
import { Save } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { settingsApi } from "@/lib/api";
import { AdminPageHeader, AdminSpinner } from "./_shared";
import type { SiteSetting } from "@/types";

interface Row extends SiteSetting {
  _dirty?: boolean;
}

const FIELD_GROUPS: { label: string; keys: string[] }[] = [
  { label: "hero", keys: ["site_subtitle", "site_tagline", "hero_description"] },
  { label: "about", keys: ["about_intro", "about_bio_1", "about_bio_2", "about_bio_3", "about_focus", "about_status", "about_timezone"] },
  { label: "quick facts", keys: ["about_language", "about_os", "about_editor", "about_tea"] },
  { label: "branding", keys: ["favicon_url"] },
  { label: "contact / general", keys: ["contact_email", "open_to_collaboration"] },
];

export default function AdminSettings() {
  usePageMeta("Admin Settings");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    settingsApi
      .list()
      .then((data) => {
        const declared = FIELD_GROUPS.flatMap((g) => g.keys);
        const existing = new Set((Array.isArray(data) ? data : []).map((r) => r.key));
        const placeholders: Row[] = declared
          .filter((k) => !existing.has(k))
          .map((k) => ({ id: "", key: k, value: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _dirty: false }));
        setRows([...(Array.isArray(data) ? data : []), ...placeholders]);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const get = (key: string) => rows.find((r) => r.key === key);
  const setValue = (key: string, value: unknown) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, value, _dirty: true } : r)));

  const save = async (key: string) => {
    const row = get(key);
    if (!row) return;
    setSavingKey(key);
    setSavedFlash(null);
    try {
      await settingsApi.upsert(key, row.value);
      setRows((rs) => rs.map((r) => (r.key === key ? { ...r, _dirty: false } : r)));
      setSavedFlash(key);
      setTimeout(() => setSavedFlash(null), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
    } finally {
      setSavingKey(null);
    }
  };

  const inputCls =
    "w-full rounded-sm border-2 border-ink/20 bg-paper-bright px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-volt focus:outline-none";

  if (loading) return <AdminSpinner label="loading settings" />;

  const allKeys = FIELD_GROUPS.flatMap((g) => g.keys);
  const extraKeys = rows.filter((r) => !allKeys.includes(r.key));

  return (
    <div>
      <AdminPageHeader title="Settings" annotation="// site.config" />

      {error && <p className="mb-6 rounded-sm border border-alert/40 bg-alert/5 px-4 py-2 font-mono text-xs text-alert">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className="border-2 border-ink/15 bg-paper-bright p-5">
            <p className="mb-4 font-mono text-xs font-bold text-volt">// {group.label}</p>
            <div className="space-y-4">
              {group.keys.map((key) => {
                const row = get(key);
                if (!row) return null;
                const value = typeof row.value === "string" ? row.value : JSON.stringify(row.value ?? "");
                const isLong = (value?.length ?? 0) > 90;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-mono text-xs text-ink-soft">{key}</label>
                      <div className="flex items-center gap-2">
                        {savedFlash === key && <span className="font-mono text-[10px] text-ok">saved ✓</span>}
                        {row._dirty && <span className="font-mono text-[10px] text-citron">unsaved</span>}
                      </div>
                    </div>
                    {isLong ? (
                      <textarea rows={3} value={value} onChange={(e) => setValue(key, e.target.value)} className={inputCls} />
                    ) : (
                      <input value={value} onChange={(e) => setValue(key, e.target.value)} className={inputCls} />
                    )}
                    <button
                      onClick={() => save(key)}
                      disabled={savingKey === key || !row._dirty}
                      className="btn-hard mt-2 text-xs disabled:opacity-50"
                    >
                      <Save size={12} /> {savingKey === key ? "saving..." : "save"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Extra keys stored in DB but not in the UI form */}
        {extraKeys.length > 0 && (
          <div className="border-2 border-dashed border-ink/20 bg-paper-dark/40 p-5">
            <p className="mb-3 font-mono text-xs text-ink-faint">// other stored keys (editable)</p>
            {extraKeys.map((row) => {
              const value = typeof row.value === "string" ? row.value : JSON.stringify(row.value ?? "");
              return (
                <div key={row.key} className="mb-3 flex items-center gap-2">
                  <span className="w-44 shrink-0 truncate font-mono text-xs text-ink-faint">{row.key}</span>
                  <input value={value} onChange={(e) => setValue(row.key, e.target.value)} className={`${inputCls} flex-1`} />
                  <button onClick={() => save(row.key)} disabled={savingKey === row.key || !row._dirty} className="btn-hard text-xs disabled:opacity-50">
                    <Save size={12} /> save
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-lg border-2 border-citron/40 bg-citron/5 p-5">
        <p className="font-mono text-xs font-bold text-citron">[!] security note</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Admin credentials come from <code className="font-mono">ADMIN_USERNAME</code> / <code className="font-mono">ADMIN_PASSWORD</code> env
          vars — the seed rejects missing or weak values. Keep <code className="font-mono">JWT_SECRET</code> random and private; rotate it to invalidate all sessions.
        </p>
      </div>
    </div>
  );
}