import React, { useState } from "react";

export type FaqItem = { question: string; answer: string };
export type FaqAccordionProps = { items: FaqItem[] };

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="rounded-xl border border-border bg-card">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left text-white"
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span>{item.question}</span>
              <span className="text-primary">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <p className="px-4 pb-4 text-sm text-textMuted">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
