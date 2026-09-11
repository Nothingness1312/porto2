interface Props {
  annotation: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({ annotation, title, description, align = "left" }: Props) {
  const textClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-10 ${textClass}`}>
      <span className="section-annotation inline-flex items-center gap-3 font-mono text-sm font-semibold text-volt">
        <span className="block h-[2px] w-10 bg-volt" />
        {annotation}
      </span>
      <h2 className={`display-heading mt-4 ${align === "center" ? "mx-auto" : ""}`}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-[680px] text-lg leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
    </div>
  );
}