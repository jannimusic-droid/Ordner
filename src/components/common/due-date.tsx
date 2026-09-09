import { cn } from "@/lib/utils";
import { formatDate, isOverdue, isDueToday, isDueSoon, dueLabel } from "@/lib/dates";
import { CalendarClock } from "lucide-react";

export function DueDate({ date, className }: { date: Date | string | null; className?: string }) {
  if (!date) {
    return <span className={cn("text-xs text-muted-foreground", className)}>Kein Termin</span>;
  }

  const overdue = isOverdue(date);
  const today = isDueToday(date);
  const soon = isDueSoon(date);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        overdue && "text-red-700 dark:text-red-400",
        today && "text-orange-700 dark:text-orange-400",
        !overdue && !today && soon && "text-amber-700 dark:text-amber-400",
        !overdue && !today && !soon && "text-muted-foreground",
        className
      )}
    >
      <CalendarClock className="size-3.5" />
      {formatDate(date)}
      <span className="font-normal opacity-80">({dueLabel(date)})</span>
    </span>
  );
}
