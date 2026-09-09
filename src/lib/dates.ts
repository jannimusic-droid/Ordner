import { format, isToday, isPast, isFuture, differenceInCalendarDays } from "date-fns";
import { de } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return format(new Date(date), "dd.MM.yyyy", { locale: de });
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: de });
}

export function isOverdue(dueDate: Date | string | null | undefined) {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  return isPast(d) && !isToday(d);
}

export function isDueToday(dueDate: Date | string | null | undefined) {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}

export function isDueSoon(dueDate: Date | string | null | undefined, withinDays = 7) {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  if (isPast(d) || isToday(d)) return false;
  if (!isFuture(d)) return false;
  return differenceInCalendarDays(d, new Date()) <= withinDays;
}

export function daysUntil(dueDate: Date | string | null | undefined) {
  if (!dueDate) return null;
  return differenceInCalendarDays(new Date(dueDate), new Date());
}

export function dueLabel(dueDate: Date | string | null | undefined) {
  if (!dueDate) return null;
  const days = daysUntil(dueDate);
  if (days === null) return null;
  if (days === 0) return "heute fällig";
  if (days === 1) return "morgen fällig";
  if (days < 0) return `${Math.abs(days)} Tag${Math.abs(days) === 1 ? "" : "e"} überfällig`;
  return `in ${days} Tagen fällig`;
}
