import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  trend?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, trend, icon, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-950/80 p-4 shadow-lg shadow-slate-950/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-300">{label}</p>
          <p className="text-3xl font-semibold text-white mt-1 tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-slate-800/80 text-white flex items-center justify-center shadow-inner shadow-slate-900">
            {icon}
          </div>
        )}
      </div>
      {trend && <div className="mt-3 text-xs text-emerald-200">{trend}</div>}
    </div>
  );
}
