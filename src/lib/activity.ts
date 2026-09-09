import { prisma } from "@/lib/prisma";
import type { ActivityAction, EntityType } from "@prisma/client";

export async function logActivity(params: {
  entityType: EntityType;
  action: ActivityAction;
  description: string;
  userId: string;
  topicId?: string;
  taskId?: string;
}) {
  await prisma.activityLogEntry.create({
    data: {
      entityType: params.entityType,
      action: params.action,
      description: params.description,
      userId: params.userId,
      topicId: params.topicId,
      taskId: params.taskId,
    },
  });
}

export async function notify(params: {
  userId: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_PARTICIPANT"
    | "TOPIC_ASSIGNED"
    | "TOPIC_PARTICIPANT"
    | "STATUS_CHANGED"
    | "NEW_COMMENT"
    | "DUE_SOON"
    | "OVERDUE";
  message: string;
  topicId?: string;
  taskId?: string;
}) {
  // Nie sich selbst benachrichtigen — z. B. wenn man den eigenen Status ändert.
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      topicId: params.topicId,
      taskId: params.taskId,
    },
  });
}
