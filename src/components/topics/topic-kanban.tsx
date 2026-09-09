import type { TopicListItem } from "@/lib/queries";
import { TOPIC_STATUSES, TOPIC_STATUS_LABELS } from "@/lib/constants";
import { PriorityBadge } from "@/components/common/priority-badge";
import { PersonGroup } from "@/components/common/person";
import { NextStep } from "@/components/common/next-step";
import { DueDate } from "@/components/common/due-date";
import Link from "next/link";

export function TopicKanban({ topics }: { topics: TopicListItem[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {TOPIC_STATUSES.filter((s) => s !== "ARCHIVED").map((status) => {
        const items = topics.filter((t) => t.status === status);
        return (
          <div key={status} className="flex w-72 shrink-0 flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium">{TOPIC_STATUS_LABELS[status]}</h3>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{topic.title}</span>
                    <PriorityBadge priority={topic.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground">{topic.department.name}</p>
                  <NextStep text={topic.nextStep} />
                  <div className="flex items-center justify-between">
                    <DueDate date={topic.dueDate} />
                    <PersonGroup owner={topic.owner} participants={topic.participants.map((p) => p.user)} />
                  </div>
                </Link>
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                  Keine Themen
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
