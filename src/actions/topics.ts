"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { logActivity, notify } from "@/lib/activity";
import { canEditTopic, canCreateTopicIn } from "@/lib/permissions";
import { PRIORITY_LABELS, TOPIC_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import type { Priority, TopicStatus } from "@prisma/client";

export async function createTopic(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "");
  const ownerId = String(formData.get("ownerId") ?? "");
  const priority = String(formData.get("priority") ?? "MEDIUM") as Priority;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const nextStep = String(formData.get("nextStep") ?? "").trim() || null;
  const crossDepartment = formData.get("crossDepartment") === "on";
  const participantIds = formData.getAll("participantIds").map(String).filter((id) => id !== ownerId);

  if (!title || !departmentId || !ownerId) {
    throw new Error("Titel, Abteilung und Verantwortlicher sind erforderlich.");
  }
  if (!canCreateTopicIn(user, departmentId)) {
    throw new Error("Keine Berechtigung, in dieser Abteilung ein Thema anzulegen.");
  }

  const topic = await prisma.topic.create({
    data: {
      title,
      description,
      departmentId,
      ownerId,
      priority,
      status: "NEW",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      nextStep,
      crossDepartment,
      participants: { create: participantIds.map((userId) => ({ userId })) },
    },
  });

  await logActivity({
    entityType: "TOPIC",
    action: "CREATED",
    description: `Thema „${title}“ erstellt`,
    userId: user.id,
    topicId: topic.id,
  });

  if (ownerId !== user.id) {
    await notify({
      userId: ownerId,
      type: "TOPIC_ASSIGNED",
      message: `Dir wurde das Thema „${title}“ als Verantwortlicher zugewiesen.`,
      topicId: topic.id,
    });
  }
  for (const pid of participantIds) {
    await notify({
      userId: pid,
      type: "TOPIC_PARTICIPANT",
      message: `Du wurdest am Thema „${title}“ beteiligt.`,
      topicId: topic.id,
    });
  }

  revalidatePath("/topics");
  revalidatePath("/dashboard");
  return topic.id;
}

export async function updateTopic(
  topicId: string,
  patch: Partial<{
    title: string;
    description: string;
    departmentId: string;
    ownerId: string;
    priority: Priority;
    status: TopicStatus;
    dueDate: string | null;
    nextStep: string | null;
    crossDepartment: boolean;
  }>
) {
  const user = await requireUser();
  const topic = await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  if (!canEditTopic(user, topic)) {
    throw new Error("Keine Berechtigung, dieses Thema zu bearbeiten.");
  }

  const activities: Parameters<typeof logActivity>[0][] = [];

  if (patch.ownerId && patch.ownerId !== topic.ownerId) {
    activities.push({
      entityType: "TOPIC",
      action: "OWNER_CHANGED",
      description: `Verantwortlicher geändert`,
      userId: user.id,
      topicId,
    });
    if (patch.ownerId !== user.id) {
      await notify({
        userId: patch.ownerId,
        type: "TOPIC_ASSIGNED",
        message: `Dir wurde das Thema „${topic.title}“ als Verantwortlicher zugewiesen.`,
        topicId,
      });
    }
  }
  if (patch.priority && patch.priority !== topic.priority) {
    activities.push({
      entityType: "TOPIC",
      action: "PRIORITY_CHANGED",
      description: `Priorität geändert auf ${PRIORITY_LABELS[patch.priority]}`,
      userId: user.id,
      topicId,
    });
  }
  if (patch.status && patch.status !== topic.status) {
    activities.push({
      entityType: "TOPIC",
      action: patch.status === "DONE" ? "COMPLETED" : patch.status === "ARCHIVED" ? "ARCHIVED" : "STATUS_CHANGED",
      description: `Status geändert auf ${TOPIC_STATUS_LABELS[patch.status]}`,
      userId: user.id,
      topicId,
    });
  }
  if (patch.dueDate !== undefined && patch.dueDate !== (topic.dueDate?.toISOString().slice(0, 10) ?? null)) {
    activities.push({
      entityType: "TOPIC",
      action: "DUE_DATE_CHANGED",
      description: `Fälligkeit geändert auf ${patch.dueDate ? formatDate(patch.dueDate) : "kein Termin"}`,
      userId: user.id,
      topicId,
    });
  }
  if (patch.nextStep !== undefined && patch.nextStep !== topic.nextStep) {
    activities.push({
      entityType: "TOPIC",
      action: "NEXT_STEP_CHANGED",
      description: `Nächster Schritt aktualisiert`,
      userId: user.id,
      topicId,
    });
  }

  await prisma.topic.update({
    where: { id: topicId },
    data: {
      title: patch.title,
      description: patch.description,
      departmentId: patch.departmentId,
      ownerId: patch.ownerId,
      priority: patch.priority,
      status: patch.status,
      dueDate: patch.dueDate !== undefined ? (patch.dueDate ? new Date(patch.dueDate) : null) : undefined,
      nextStep: patch.nextStep,
      crossDepartment: patch.crossDepartment,
    },
  });

  for (const a of activities) await logActivity(a);

  revalidatePath(`/topics/${topicId}`);
  revalidatePath("/topics");
  revalidatePath("/dashboard");
}

export async function setTopicParticipants(topicId: string, userIds: string[]) {
  const user = await requireUser();
  const topic = await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });
  if (!canEditTopic(user, topic)) throw new Error("Keine Berechtigung.");

  const filtered = Array.from(new Set(userIds.filter((id) => id !== topic.ownerId)));
  const existing = await prisma.topicParticipant.findMany({ where: { topicId } });
  const existingIds = existing.map((p) => p.userId);

  const toAdd = filtered.filter((id) => !existingIds.includes(id));
  const toRemove = existingIds.filter((id) => !filtered.includes(id));

  if (toAdd.length) {
    await prisma.topicParticipant.createMany({ data: toAdd.map((userId) => ({ topicId, userId })) });
    await logActivity({
      entityType: "TOPIC",
      action: "PARTICIPANT_ADDED",
      description: `${toAdd.length} Beteiligte(r) hinzugefügt`,
      userId: user.id,
      topicId,
    });
    for (const uid of toAdd) {
      await notify({
        userId: uid,
        type: "TOPIC_PARTICIPANT",
        message: `Du wurdest am Thema „${topic.title}“ beteiligt.`,
        topicId,
      });
    }
  }
  if (toRemove.length) {
    await prisma.topicParticipant.deleteMany({ where: { topicId, userId: { in: toRemove } } });
    await logActivity({
      entityType: "TOPIC",
      action: "PARTICIPANT_REMOVED",
      description: `${toRemove.length} Beteiligte(r) entfernt`,
      userId: user.id,
      topicId,
    });
  }

  revalidatePath(`/topics/${topicId}`);
}

export async function addTopicComment(topicId: string, text: string) {
  const user = await requireUser();
  const trimmed = text.trim();
  if (!trimmed) return;

  const topic = await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  await prisma.comment.create({ data: { text: trimmed, authorId: user.id, topicId } });
  await logActivity({
    entityType: "TOPIC",
    action: "COMMENT_ADDED",
    description: "Kommentar hinzugefügt",
    userId: user.id,
    topicId,
  });

  const recipients = new Set<string>([topic.ownerId]);
  const participants = await prisma.topicParticipant.findMany({ where: { topicId } });
  participants.forEach((p) => recipients.add(p.userId));
  recipients.delete(user.id);
  for (const uid of recipients) {
    await notify({
      userId: uid,
      type: "NEW_COMMENT",
      message: `Neuer Kommentar zu „${topic.title}“ von ${user.name}.`,
      topicId,
    });
  }

  revalidatePath(`/topics/${topicId}`);
}
