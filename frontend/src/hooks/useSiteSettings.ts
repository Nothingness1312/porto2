import { useEffect, useState, useCallback } from "react";

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/site-settings`);
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const s of data) map[s.key] = typeof s.value === "string" ? s.value : String(s.value ?? "");
      setSettings(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, error, refetch: fetchSettings };
}