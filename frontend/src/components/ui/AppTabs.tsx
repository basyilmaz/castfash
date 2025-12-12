import { ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

export function AppTabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const safeDefault = useMemo(() => defaultTab ?? tabs[0]?.key, [defaultTab, tabs]);
  const [active, setActive] = useState<string | undefined>(safeDefault);

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/70 p-1 shadow-inner shadow-slate-900">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "px-4 py-2 text-sm rounded-full transition",
              activeTab?.key === tab.key
                ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/40"
                : "text-slate-300 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4">
        {activeTab?.content}
      </div>
    </div>
  );
}
