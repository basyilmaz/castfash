import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const AppInput = forwardRef<HTMLInputElement, Props>(function AppInput(
  { label, hint, error, className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm text-textMuted">{label}</span>}
      <input
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-white outline-none transition focus:border-primaryDark focus:ring-2 focus:ring-primaryDark/30",
          error && "border-rose-500/60 focus:ring-rose-500/30",
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-textSecondary">{hint}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
});
