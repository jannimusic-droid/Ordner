import { isOverdue, isDueToday, isDueSoon } from "@/lib/dates";
import type { Priority } from "@prisma/client";

type Urgent = {
  status: string;
  priority: Priority;
  dueDate: Date | string | null;
  nextStep: string | null;
};

/**
 * "Heute"-Logik (Abschnitt 9): überfällig > heute fällig > kritische Priorität >
 * blockiert > fehlender nächster Schritt > bald fällig. Niedrigerer Wert = dringender.
 */
export function urgencyRank(item: Urgent): number {
  if (isOverdue(item.dueDate)) return 0;
  if (isDueToday(item.dueDate)) return 1;
  if (item.priority === "CRITICAL") return 2;
  if (item.status === "BLOCKED") return 3;
  if (!item.nextStep) return 4;
  if (isDueSoon(item.dueDate)) return 5;
  if (item.priority === "HIGH") return 6;
  return 7;
}

export function sortByUrgency<T extends Urgent>(items: T[]): T[] {
  return [...items].sort((a, b) => urgencyRank(a) - urgencyRank(b));
}
