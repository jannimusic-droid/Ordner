import { cn } from "@/lib/utils";
import { ArrowRight, CircleAlert } from "lucide-react";

export function NextStep({ text, className }: { text: string | null; className?: string }) {
  if (!text) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400",
          className
        )}
      >
        <CircleAlert className="size-3.5" />
        Kein nächster Schritt definiert
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-start gap-1.5 text-xs text-foreground", className)}>
      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span className="line-clamp-2">{text}</span>
    </span>
  );
}
