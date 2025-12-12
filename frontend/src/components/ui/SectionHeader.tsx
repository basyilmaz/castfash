import React from "react";
import clsx from "clsx";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  align?: "left" | "center";
  className?: string;
  actions?: React.ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  subtitle,
  align = "left",
  className,
  actions,
}: SectionHeaderProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  const desc = description || subtitle;

  return (
    <div className={clsx("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className={clsx("flex flex-col gap-2", alignment)}>
        {eyebrow && <span className="text-xs uppercase tracking-[0.35em] text-textSecondary">{eyebrow}</span>}
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
        {desc && <p className="text-base text-textMuted max-w-2xl">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
