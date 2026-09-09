import type { Priority, TopicStatus, TaskStatus, Role, NotificationType } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Führungskraft",
  EMPLOYEE: "Mitarbeiter",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  CRITICAL: "Kritisch",
  HIGH: "Hoch",
  MEDIUM: "Mittel",
  LOW: "Niedrig",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

// Tailwind classes for badges — kept centralized so priority/status colors are consistent everywhere.
export const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-500/30",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-500/30",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-500/30",
  LOW: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/30",
};

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  NEW: "Neu",
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  WAITING: "Wartet auf Rückmeldung",
  BLOCKED: "Blockiert",
  DONE: "Erledigt",
  ARCHIVED: "Archiviert",
};

export const TOPIC_STATUS_STYLES: Record<TopicStatus, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-500/30",
  OPEN: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-500/30",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-500/30",
  WAITING: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-500/30",
  BLOCKED: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-500/30",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-500/30",
  ARCHIVED: "bg-slate-100 text-slate-500 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-500/30",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  WAITING: "Wartet auf Rückmeldung",
  BLOCKED: "Blockiert",
  DONE: "Erledigt",
};

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-500/30",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-500/30",
  WAITING: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-500/30",
  BLOCKED: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-500/30",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-500/30",
};

export const TOPIC_STATUSES: TopicStatus[] = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "BLOCKED",
  "DONE",
  "ARCHIVED",
];

export const TASK_STATUSES: TaskStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "BLOCKED",
  "DONE",
];

export const OPEN_TASK_STATUSES: TaskStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "BLOCKED"];
export const OPEN_TOPIC_STATUSES: TopicStatus[] = ["NEW", "OPEN", "IN_PROGRESS", "WAITING", "BLOCKED"];

export const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: "Als Verantwortlicher zugewiesen (Aufgabe)",
  TASK_PARTICIPANT: "Als Beteiligter hinzugefügt (Aufgabe)",
  TOPIC_ASSIGNED: "Als Verantwortlicher zugewiesen (Thema)",
  TOPIC_PARTICIPANT: "Als Beteiligter hinzugefügt (Thema)",
  STATUS_CHANGED: "Status geändert",
  NEW_COMMENT: "Neuer Kommentar",
  DUE_SOON: "Fälligkeit rückt näher",
  OVERDUE: "Fälligkeit überschritten",
};
