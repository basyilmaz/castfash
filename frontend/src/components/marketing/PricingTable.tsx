import React from "react";

export type Plan = {
  name: string;
  priceLabel: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
};
export type PricingTableProps = {
  plans: Plan[];
};

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-2xl border p-6 ${
            plan.highlighted ? "border-primary bg-surfaceAlt/30 shadow-xl" : "border-border bg-card shadow-sm"
          }`}
        >
          <p className="text-sm uppercase tracking-wide text-textSecondary">{plan.name}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{plan.priceLabel}</p>
          {plan.description && <p className="mt-2 text-sm text-textMuted">{plan.description}</p>}
          <ul className="mt-4 space-y-2 text-sm text-textMuted">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition">
            Başla
          </button>
        </div>
      ))}
    </div>
  );
}
