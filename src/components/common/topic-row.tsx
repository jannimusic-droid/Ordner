import Link from "next/link";
import type { TopicListItem } from "@/lib/queries";
import { TopicStatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { DueDate } from "@/components/common/due-date";
import { PersonGroup } from "@/components/common/person";
import { NextStep } from "@/components/common/next-step";
import { OPEN_TASK_STATUSES } from "@/lib/constants";

export function TopicRow({ topic }: { topic: TopicListItem }) {
  const openTasks = topic.tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status)).length;

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm hover:border-primary/40 hover:shadow-sm transition-shadow"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{topic.title}</span>
          {topic.crossDepartment && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
              Abteilungsübergreifend
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{topic.department.name}</p>
        <NextStep text={topic.nextStep} className="mt-1" />
      </div>
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
        {openTasks} offene Aufgabe{openTasks === 1 ? "" : "n"}
      </span>
      <PriorityBadge priority={topic.priority} className="hidden sm:inline-flex" />
      <TopicStatusBadge status={topic.status} className="hidden md:inline-flex" />
      <DueDate date={topic.dueDate} className="hidden w-36 shrink-0 lg:inline-flex" />
      <PersonGroup owner={topic.owner} participants={topic.participants.map((p) => p.user)} />
    </Link>
  );
}
