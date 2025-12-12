import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "accent" | "destructive" | "ghost";

export function AppBadge({
  variant = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    default: "bg-surface border border-border text-textMuted",
    primary: "bg-primary/20 text-primary border border-primary/30",
    secondary: "bg-accentOrange/20 text-accentOrange border border-accentOrange/30",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    destructive: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-accentBlue/20 text-accentBlue border border-accentBlue/30",
    accent: "bg-accentPeach/20 text-accentPeach border border-accentPeach/30",
    ghost: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
