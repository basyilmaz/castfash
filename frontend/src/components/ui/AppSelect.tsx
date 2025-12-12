import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const AppSelect = forwardRef<HTMLSelectElement, Props>(function AppSelect(
  { label, hint, error, className, children, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm text-textMuted">{label}</span>}
      <select
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-white outline-none transition",
          "focus:border-primaryDark focus:ring-2 focus:ring-primaryDark/30",
          "appearance-none cursor-pointer",
          "[&>option]:bg-[#1A1A1E] [&>option]:text-white [&>option]:py-2",
          "[&>option:checked]:bg-purple-600 [&>option:checked]:text-white",
          "style-select-arrow",
          error && "border-rose-500/60 focus:ring-rose-500/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && <span className="text-xs text-textSecondary">{hint}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
      <style jsx>{`
        .style-select-arrow {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a855f7' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }
      `}</style>
    </label>
  );
});
