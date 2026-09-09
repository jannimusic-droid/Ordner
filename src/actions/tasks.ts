"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { logActivity, notify } from "@/lib/activity";
import { canEditTask } from "@/lib/permissions";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import type { Priority, TaskStatus } from "@prisma/client";

export async function createTask(topicId: string, formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ownerId = String(formData.get("ownerId") ?? "");
  const priority = String(formData.get("priority") ?? "MEDIUM") as Priority;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const nextStep = String(formData.get("nextStep") ?? "").trim() || null;
  const estimatedEffort = String(formData.get("estimatedEffort") ?? "").trim() || null;
  const participantIds = formData.getAll("participantIds").map(String).filter((id) => id !== ownerId);

  if (!title || !ownerId) throw new Error("Titel und Verantwortlicher sind erforderlich.");

  const topic = await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      topicId,
      ownerId,
      priority,
      status: "OPEN",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      nextStep,
      estimatedEffort,
      participants: { create: participantIds.map((userId) => ({ userId })) },
    },
  });

  await logActivity({
    entityType: "TASK",
    action: "CREATED",
    description: `Aufgabe „${title}“ erstellt`,
    userId: user.id,
    taskId: task.id,
  });

  if (ownerId !== user.id) {
    await notify({
      userId: ownerId,
      type: "TASK_ASSIGNED",
      message: `Dir wurde die Aufgabe „${title}“ (${topic.title}) zugewiesen.`,
      taskId: task.id,
      topicId,
    });
  }
  for (const pid of participantIds) {
    await notify({
      userId: pid,
      type: "TASK_PARTICIPANT",
      message: `Du wurdest an der Aufgabe „${title}“ (${topic.title}) beteiligt.`,
      taskId: task.id,
      topicId,
    });
  }

  revalidatePath(`/topics/${topicId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task.id;
}

async function assertCanEditTask(taskId: string) {
  const user = await requireUser();
  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    include: { topic: { select: { departmentId: true } }, participants: true },
  });
  if (!canEditTask(user, task, task.participants.map((p) => p.userId))) {
    throw new Error("Keine Berechtigung, diese Aufgabe zu bearbeiten.");
  }
  return { user, task };
}

export async function updateTask(
  taskId: string,
  patch: Partial<{
    title: string;
    description: string;
    ownerId: string;
    priority: Priority;
    status: TaskStatus;
    dueDate: string | null;
    nextStep: string | null;
    estimatedEffort: string | null;
  }>
) {
  const { user, task } = await assertCanEditTask(taskId);

  const activities: Parameters<typeof logActivity>[0][] = [];

  if (patch.ownerId && patch.ownerId !== task.ownerId) {
    activities.push({
      entityType: "TASK",
      action: "OWNER_CHANGED",
      description: "Verantwortlicher geändert",
      userId: user.id,
      taskId,
    });
    if (patch.ownerId !== user.id) {
      await notify({
        userId: patch.ownerId,
        type: "TASK_ASSIGNED",
        message: `Dir wurde die Aufgabe „${task.title}“ zugewiesen.`,
        taskId,
      });
    }
  }
  if (patch.priority && patch.priority !== task.priority) {
    activities.push({
      entityType: "TASK",
      action: "PRIORITY_CHANGED",
      description: `Priorität geändert auf ${PRIORITY_LABELS[patch.priority]}`,
      userId: user.id,
      taskId,
    });
  }
  if (patch.status && patch.status !== task.status) {
    activities.push({
      entityType: "TASK",
      action: patch.status === "DONE" ? "COMPLETED" : "STATUS_CHANGED",
      description: `Status geändert auf ${TASK_STATUS_LABELS[patch.status]}`,
      userId: user.id,
      taskId,
    });
    const recipients = new Set<string>([task.ownerId]);
    task.participants.forEach((p) => recipients.add(p.userId));
    recipients.delete(user.id);
    for (const uid of recipients) {
      await notify({
        userId: uid,
        type: "STATUS_CHANGED",
        message: `Status von „${task.title}“ geändert auf ${TASK_STATUS_LABELS[patch.status]}.`,
        taskId,
      });
    }
  }
  if (patch.dueDate !== undefined && patch.dueDate !== (task.dueDate?.toISOString().slice(0, 10) ?? null)) {
    activities.push({
      entityType: "TASK",
      action: "DUE_DATE_CHANGED",
      description: `Fälligkeit geändert auf ${patch.dueDate ? formatDate(patch.dueDate) : "kein Termin"}`,
      userId: user.id,
      taskId,
    });
  }
  if (patch.nextStep !== undefined && patch.nextStep !== task.nextStep) {
    activities.push({
      entityType: "TASK",
      action: "NEXT_STEP_CHANGED",
      description: "Nächster Schritt aktualisiert",
      userId: user.id,
      taskId,
    });
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: patch.title,
      description: patch.description,
      ownerId: patch.ownerId,
      priority: patch.priority,
      status: patch.status,
      dueDate: patch.dueDate !== undefined ? (patch.dueDate ? new Date(patch.dueDate) : null) : undefined,
      nextStep: patch.nextStep,
      estimatedEffort: patch.estimatedEffort,
    },
  });

  for (const a of activities) await logActivity(a);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/topics/${task.topicId}`);
  revalidatePath("/tasks");
  revalidatePath("/my-tasks");
  revalidatePath("/dashboard");
}

export async function setTaskParticipants(taskId: string, userIds: string[]) {
  const { user, task } = await assertCanEditTask(taskId);

  const filtered = Array.from(new Set(userIds.filter((id) => id !== task.ownerId)));
  const existingIds = task.participants.map((p) => p.userId);

  const toAdd = filtered.filter((id) => !existingIds.includes(id));
  const toRemove = existingIds.filter((id) => !filtered.includes(id));

  if (toAdd.length) {
    await prisma.taskParticipant.createMany({ data: toAdd.map((userId) => ({ taskId, userId })) });
    await logActivity({
      entityType: "TASK",
      action: "PARTICIPANT_ADDED",
      description: `${toAdd.length} Beteiligte(r) hinzugefügt`,
      userId: user.id,
      taskId,
    });
    for (const uid of toAdd) {
      await notify({
        userId: uid,
        type: "TASK_PARTICIPANT",
        message: `Du wurdest an der Aufgabe „${task.title}“ beteiligt.`,
        taskId,
      });
    }
  }
  if (toRemove.length) {
    await prisma.taskParticipant.deleteMany({ where: { taskId, userId: { in: toRemove } } });
    await logActivity({
      entityType: "TASK",
      action: "PARTICIPANT_REMOVED",
      description: `${toRemove.length} Beteiligte(r) entfernt`,
      userId: user.id,
      taskId,
    });
  }

  revalidatePath(`/tasks/${taskId}`);
}

export async function addTaskComment(taskId: string, text: string) {
  const user = await requireUser();
  const trimmed = text.trim();
  if (!trimmed) return;

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId }, include: { participants: true } });

  await prisma.comment.create({ data: { text: trimmed, authorId: user.id, taskId } });
  await logActivity({
    entityType: "TASK",
    action: "COMMENT_ADDED",
    description: "Kommentar hinzugefügt",
    userId: user.id,
    taskId,
  });

  const recipients = new Set<string>([task.ownerId]);
  task.participants.forEach((p) => recipients.add(p.userId));
  recipients.delete(user.id);
  for (const uid of recipients) {
    await notify({
      userId: uid,
      type: "NEW_COMMENT",
      message: `Neuer Kommentar zu „${task.title}“ von ${user.name}.`,
      taskId,
    });
  }

  revalidatePath(`/tasks/${taskId}`);
}
