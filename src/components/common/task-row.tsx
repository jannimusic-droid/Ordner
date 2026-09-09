import Link from "next/link";
import type { TaskListItem } from "@/lib/queries";
import { TaskStatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { DueDate } from "@/components/common/due-date";
import { PersonGroup } from "@/components/common/person";

export function TaskRow({ task, showTopic = true }: { task: TaskListItem; showTopic?: boolean }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm hover:border-primary/40 hover:shadow-sm transition-shadow"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{task.title}</span>
        </div>
        {showTopic && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {task.topic.department.name} · {task.topic.title}
          </p>
        )}
      </div>
      <PriorityBadge priority={task.priority} className="hidden sm:inline-flex" />
      <TaskStatusBadge status={task.status} className="hidden md:inline-flex" />
      <DueDate date={task.dueDate} className="hidden w-36 shrink-0 lg:inline-flex" />
      <PersonGroup owner={task.owner} participants={task.participants.map((p) => p.user)} />
    </Link>
  );
}
