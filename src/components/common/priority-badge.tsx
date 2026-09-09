import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "@/lib/constants";
import type { Priority } from "@prisma/client";
import { AlertTriangle } from "lucide-react";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        PRIORITY_STYLES[priority],
        className
      )}
    >
      {priority === "CRITICAL" && <AlertTriangle className="size-3" />}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
