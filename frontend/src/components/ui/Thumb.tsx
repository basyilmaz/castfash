import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24"
};

export function Thumb({ src, alt, size = "md" }: { src?: string | null; alt?: string; size?: Size }) {
  const dimension = sizeMap[size];

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800/80 to-slate-900/80 text-slate-500 flex items-center justify-center text-xs uppercase tracking-wide",
          dimension
        )}
      >
        N/A
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? "thumbnail"}
      className={cn(
        "rounded-xl object-cover border border-slate-800 bg-slate-900/50 shadow-inner shadow-slate-950/40",
        dimension
      )}
    />
  );
}
