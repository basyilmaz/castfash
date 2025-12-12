import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppCard({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg",
        "transition-all duration-200",
        "hover:border-primary/30 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
