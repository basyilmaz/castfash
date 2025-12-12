import React from "react";

export type FeatureItem = {
  icon?: React.ReactNode;
  title: string;
  description: string;
};
export type FeatureGridProps = {
  items: FeatureItem[];
};

export function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition"
        >
          {item.icon && <div className="mb-3 text-primary">{item.icon}</div>}
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm text-textMuted">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
