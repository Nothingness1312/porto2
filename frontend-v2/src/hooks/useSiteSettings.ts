import { useEffect, useState, useCallback } from "react";
import { settingsApi } from "@/lib/api";

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.list();
      const map: Record<string, string> = {};
      for (const s of Array.isArray(data) ? data : []) {
        map[s.key] = typeof s.value === "string" ? s.value : String(s.value ?? "");
      }
      setSettings(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, refetch: fetchSettings };
}