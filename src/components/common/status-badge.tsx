import { cn } from "@/lib/utils";
import {
  TOPIC_STATUS_LABELS,
  TOPIC_STATUS_STYLES,
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
} from "@/lib/constants";
import type { TopicStatus, TaskStatus } from "@prisma/client";

export function TopicStatusBadge({ status, className }: { status: TopicStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        TOPIC_STATUS_STYLES[status],
        className
      )}
    >
      {TOPIC_STATUS_LABELS[status]}
    </span>
  );
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        TASK_STATUS_STYLES[status],
        className
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
