import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, ExternalLink, GitBranch, AlertTriangle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";

function label(s: string) {
  return s
    .split("-")
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  usePageMeta("Project", "Case study detail.");
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProject(null);
    setNotFound(false);
    projectsApi
      .get(slug)
      .then((data) => setProject(data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-blaze">404 - case file not found</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">This project doesn't exist.</h1>
        <p className="mt-3 text-ink-soft">The case may have been removed or the slug is wrong.</p>
        <Link to="/projects" className="btn-hard mt-8">
          <ArrowLeft size={16} /> back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-ink-faint">loading case file<span className="animate-blink">_</span></p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint hover:text-volt">
        <ArrowLeft size={14} /> /projects
      </Link>

      {/* Header */}
      <header className="mt-6 border-b-2 border-ink pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="tag-chip tag-chip-volt">{label(project.category)}</span>
          <span className="tag-chip">{project.difficulty}</span>
          {project.featured && <span className="font-mono text-xs text-blaze">[featured]</span>}
          {!project.published && <span className="font-mono text-xs text-alert">[draft]</span>}
        </div>
        <h1 className="display-xl mt-4">{project.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{project.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-faint">
          <span>filed: {project.date || project.createdAt.slice(0, 10)}</span>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-volt hover:underline">
              <GitBranch size={13} /> source
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-volt hover:underline">
              <ExternalLink size={13} /> demo
            </a>
          )}
        </div>

        {/* Toolbox */}
        <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-dashed border-ink/15 pt-5">
          {project.technologies.map((t) => (
            <span key={t} className="tag-chip">{t}</span>
          ))}
          {project.tools?.map((t) => (
            <span key={t} className="tag-chip border-citron/40 bg-citron/10 text-ink">{t}</span>
          ))}
        </div>
      </header>

      {/* Disclaimer for placeholder research */}
      <div className="mt-6 flex items-start gap-3 border-2 border-citron/40 bg-citron/5 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-citron" />
        <p className="text-sm leading-relaxed text-ink-soft">
          Technical write-up only. No third-party systems were harmed - all research was performed in isolated lab environments.
        </p>
      </div>

      {/* Content */}
      <div className="markdown-body mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {project.content}
        </ReactMarkdown>
      </div>

      {/* Next */}
      <div className="mt-12 border-t-2 border-dashed border-ink/15 pt-6 text-left">
        <Link to="/writeups" className="font-mono text-sm text-volt hover:underline">
          continue reading: writeups →
        </Link>
      </div>
    </article>
  );
}