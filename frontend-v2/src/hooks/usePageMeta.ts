import { useEffect } from "react";

function setMeta(selector: string, attr: "property" | "name", key: string, value: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`${selector}[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", value);
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const full = title.includes("-") ? title : `${title} - KKARINZZZ`;
    document.title = full;

    if (description) {
      setMeta("meta", "name", "description", description);
      setMeta("meta", "property", "og:title", full);
      setMeta("meta", "property", "og:description", description);
      setMeta("meta", "name", "twitter:title", full);
      setMeta("meta", "name", "twitter:description", description);
    }
  }, [title, description]);
}