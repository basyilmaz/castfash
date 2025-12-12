import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
};

export function AppModal({ open, title, description, children, actions, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-slate-950/50 p-6">
        {title && <h3 className="text-xl font-semibold text-slate-50">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-300">{description}</p>}
        {children && <div className={cn("mt-4 space-y-3")}>{children}</div>}
        {actions && <div className="mt-6 flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
}
