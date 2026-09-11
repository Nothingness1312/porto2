import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function FaviconSync() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const url = settings.favicon_url?.trim();
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [settings.favicon_url]);

  return null;
}