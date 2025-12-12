import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Plan = {
  name: string;
  note: string;
  cta?: string;
};

export function PricingSection({ plans }: { plans: Plan[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 space-y-8">
      <SectionHeader
        eyebrow="Planlar"
        title="Castfash paketleri"
        description="Starter’dan Studio Pro’ya, ihtiyacınıza göre kredi bazlı paketler."
        align="center"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-textSecondary">{plan.name}</p>
            <p className="mt-2 text-base text-white font-semibold">{plan.note}</p>
            <p className="mt-4 text-sm text-textMuted">Fiyat: Yakında</p>
            {plan.cta && (
              <a
                href="/auth/register"
                className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition"
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
