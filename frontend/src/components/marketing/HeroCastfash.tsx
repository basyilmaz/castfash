import React from "react";

export type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageUrl?: string;
  backgroundUrl?: string;
};

export function HeroCastfash({
  eyebrow = "Castfash • AI moda stüdyosu",
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  imageUrl,
  backgroundUrl,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-surface text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primaryDark/15 to-accentBlue/20" />
      {backgroundUrl && (
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-textSecondary">{eyebrow}</p>
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">{title}</h1>
          <p className="text-lg text-textMuted">{subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-surface shadow-md hover:-translate-y-0.5 transition"
              >
                {primaryCta.label}
              </a>
            )}
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
        {imageUrl && (
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <img src={imageUrl} alt="Castfash görseli" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
