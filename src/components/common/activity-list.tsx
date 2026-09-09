import { formatDateTime } from "@/lib/dates";
import {
  PlusCircle,
  UserRound,
  Flag,
  Activity,
  CalendarClock,
  ArrowRightCircle,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Archive,
  Pencil,
  UsersRound,
} from "lucide-react";
import type { ActivityAction } from "@prisma/client";

const ICONS: Record<ActivityAction, typeof PlusCircle> = {
  CREATED: PlusCircle,
  OWNER_CHANGED: UserRound,
  PARTICIPANT_ADDED: UsersRound,
  PARTICIPANT_REMOVED: UsersRound,
  PRIORITY_CHANGED: Flag,
  STATUS_CHANGED: Activity,
  DUE_DATE_CHANGED: CalendarClock,
  NEXT_STEP_CHANGED: ArrowRightCircle,
  COMMENT_ADDED: MessageSquare,
  COMPLETED: CheckCircle2,
  REOPENED: RotateCcw,
  ARCHIVED: Archive,
  UPDATED: Pencil,
};

type ActivityItem = {
  id: string;
  action: ActivityAction;
  description: string;
  createdAt: Date | string;
  user: { name: string };
};

export function ActivityList({ items }: { items: ActivityItem[] }) {
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sorted.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Noch keine Aktivität.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {sorted.map((item) => {
        const Icon = ICONS[item.action] ?? Activity;
        return (
          <li key={item.id} className="flex items-start gap-2.5 text-sm">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-3.5" />
            </div>
            <div>
              <p>
                <span className="font-medium">{item.user.name}</span>{" "}
                <span className="text-muted-foreground">{item.description}</span>
              </p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
