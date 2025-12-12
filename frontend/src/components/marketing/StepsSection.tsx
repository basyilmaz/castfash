import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export type StepItem = {
  title: string;
  description: string;
};

export function StepsSection({
  steps,
  eyebrow = "Süreç",
  title = "Nasıl çalışır?",
  description = "Castfash ile birkaç adımda katalog çekimi yapar gibi AI görseller üretin.",
}: {
  steps: StepItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 space-y-8">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="center" />
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-white">
                {idx + 1}
              </span>
              <p className="text-white font-semibold">{step.title}</p>
            </div>
            <p className="mt-3 text-sm text-textMuted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
