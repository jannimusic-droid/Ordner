import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { OPEN_TASK_STATUSES, OPEN_TOPIC_STATUSES } from "@/lib/constants";
import { isOverdue, isDueToday, isDueSoon } from "@/lib/dates";

export const taskListInclude = {
  owner: { select: { id: true, name: true } },
  participants: { include: { user: { select: { id: true, name: true } } } },
  topic: {
    select: {
      id: true,
      title: true,
      department: { select: { id: true, name: true } },
    },
  },
} as const;

export const topicListInclude = {
  owner: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  participants: { include: { user: { select: { id: true, name: true } } } },
  tasks: { select: { id: true, status: true } },
} as const;

export type TaskListItem = Prisma.TaskGetPayload<{ include: typeof taskListInclude }>;
export type TopicListItem = Prisma.TopicGetPayload<{ include: typeof topicListInclude }>;

export async function getAllTasksForUser() {
  return prisma.task.findMany({
    include: taskListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAllTopics() {
  return prisma.topic.findMany({
    include: topicListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

function involvesUser(item: { ownerId: string; participants: { userId: string }[] }, userId: string) {
  return item.ownerId === userId || item.participants.some((p) => p.userId === userId);
}

export async function getDashboardData(userId: string) {
  const [allTasks, allTopics] = await Promise.all([getAllTasksForUser(), getAllTopics()]);

  const myTasks = allTasks.filter((t) => involvesUser(t, userId));
  const myTopics = allTopics.filter((t) => involvesUser(t, userId));

  const openMyTasks = myTasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));

  const dueToday = openMyTasks.filter((t) => isDueToday(t.dueDate));
  const overdue = openMyTasks.filter((t) => isOverdue(t.dueDate));
  const highPriority = openMyTasks.filter((t) => t.priority === "CRITICAL" || t.priority === "HIGH");
  const upcoming = openMyTasks.filter((t) => isDueSoon(t.dueDate, 7));
  const waiting = openMyTasks.filter((t) => t.status === "WAITING");
  const blocked = openMyTasks.filter((t) => t.status === "BLOCKED");

  const topicsNeedingAttention = myTopics.filter(
    (t) =>
      OPEN_TOPIC_STATUSES.includes(t.status) &&
      (isOverdue(t.dueDate) || isDueToday(t.dueDate) || t.status === "BLOCKED" || !t.nextStep)
  );

  const criticalTopics = myTopics.filter(
    (t) =>
      OPEN_TOPIC_STATUSES.includes(t.status) &&
      (t.priority === "CRITICAL" || t.status === "BLOCKED" || isOverdue(t.dueDate))
  );

  const ownedOpenTopics = myTopics.filter(
    (t) => t.ownerId === userId && OPEN_TOPIC_STATUSES.includes(t.status)
  );

  const ownedOpenTasks = myTasks.filter(
    (t) => t.ownerId === userId && OPEN_TASK_STATUSES.includes(t.status)
  );
  const ownedOverdueTasks = ownedOpenTasks.filter((t) => isOverdue(t.dueDate));
  const ownedBlockedTasks = ownedOpenTasks.filter((t) => t.status === "BLOCKED");

  return {
    dueToday,
    overdue,
    highPriority,
    upcoming,
    waiting,
    blocked,
    topicsNeedingAttention,
    criticalTopics,
    stats: {
      openTasks: ownedOpenTasks.length,
      overdueTasks: ownedOverdueTasks.length,
      blockedTasks: ownedBlockedTasks.length,
      ownedTopics: ownedOpenTopics.length,
    },
  };
}
