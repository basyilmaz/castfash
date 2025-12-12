import { ReactNode } from "react";
import { AppButton } from "./AppButton";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-sky-500/30 text-white shadow-md shadow-indigo-500/30">
        {icon ?? <span className="text-lg">✨</span>}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-slate-300 max-w-md">{description}</p>}
      {action ? action : (actionLabel && onAction && <AppButton onClick={onAction}>{actionLabel}</AppButton>)}
    </div>
  );
}
