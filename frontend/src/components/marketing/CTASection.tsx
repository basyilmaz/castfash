import React from "react";

export type CTASectionProps = {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageUrl?: string;
};

export function CTASection({ title, subtitle, primaryCta, secondaryCta, imageUrl }: CTASectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-surfaceAlt/40 px-6 py-10 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 text-center items-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-textMuted max-w-3xl">{subtitle}</p>}
        </div>
        {imageUrl && (
          <div className="w-full overflow-hidden rounded-2xl border border-border bg-card">
            <img src={imageUrl} alt={title} className="w-full h-auto object-cover" />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href={primaryCta.href}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-surface shadow-md hover:-translate-y-0.5 transition"
          >
            {primaryCta.label}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="rounded-full border border-white/30 px-5 py-3 text-sm text-white hover:border-white/60 transition"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
