"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markNotificationRead } from "@/actions/notifications";
import { formatDateTime } from "@/lib/dates";
import { NOTIFICATION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  UserCheck,
  Users,
  Activity,
  MessageSquare,
  CalendarClock,
  AlertOctagon,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";

const ICONS: Record<NotificationType, typeof UserCheck> = {
  TASK_ASSIGNED: UserCheck,
  TASK_PARTICIPANT: Users,
  TOPIC_ASSIGNED: UserCheck,
  TOPIC_PARTICIPANT: Users,
  STATUS_CHANGED: Activity,
  NEW_COMMENT: MessageSquare,
  DUE_SOON: CalendarClock,
  OVERDUE: AlertOctagon,
};

type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date | string;
  taskId: string | null;
  topicId: string | null;
};

export function NotificationRow({ notification }: { notification: NotificationItem }) {
  const [, startTransition] = useTransition();
  const Icon = ICONS[notification.type];
  const href = notification.taskId
    ? `/tasks/${notification.taskId}`
    : notification.topicId
      ? `/topics/${notification.topicId}`
      : "#";

  return (
    <Link
      href={href}
      onClick={() => {
        if (!notification.read) startTransition(() => markNotificationRead(notification.id));
      }}
      className={cn(
        "flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm hover:border-primary/40",
        !notification.read && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(!notification.read && "font-medium")}>{notification.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {NOTIFICATION_LABELS[notification.type]} · {formatDateTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
    </Link>
  );
}
