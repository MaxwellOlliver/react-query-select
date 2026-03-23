import { useState, useEffect } from "react";

export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export const tocSectionIds = [
  "examples",
  "demo-basic",
  "demo-multi",
  "demo-clearable",
  "demo-custom",
  "demo-disabled",
  "demo-no-search",
  "keyboard-navigation",
  "api-reference",
  "style-slots",
];

export function TocLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`text-[13px] transition-colors leading-tight ${active ? "text-foreground" : "text-foreground-muted hover:text-foreground"}`}
    >
      {label}
    </a>
  );
}

export function TocSection({
  href,
  label,
  sub,
  activeId,
}: {
  href: string;
  label: string;
  sub: [string, string][];
  activeId: string;
}) {
  const sectionId = href.replace("#", "");
  const subIds = sub.map(([h]) => h.replace("#", ""));
  const isSectionActive = activeId === sectionId || subIds.includes(activeId);

  return (
    <div className="flex flex-col gap-2.5">
      <TocLink href={href} label={label} active={isSectionActive} />
      <div className="flex flex-col gap-2.5 pl-3 border-l border-border">
        {sub.map(([subHref, subLabel]) => (
          <TocLink
            key={subHref}
            href={subHref}
            label={subLabel}
            active={activeId === subHref.replace("#", "")}
          />
        ))}
      </div>
    </div>
  );
}
