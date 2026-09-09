import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: string;
  departmentId: string | null;
};

/** Admins manage everything. Führungskräfte manage within their own department. */
export function canManageDepartment(user: SessionUser, departmentId: string) {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER") return user.departmentId === departmentId;
  return false;
}

/** Anyone can create a topic; Mitarbeiter creates within their own department only. */
export function canCreateTopicIn(user: SessionUser, departmentId: string) {
  if (user.role === "ADMIN" || user.role === "MANAGER") return true;
  return user.departmentId === departmentId;
}

export function canEditTopic(
  user: SessionUser,
  topic: { departmentId: string; ownerId: string }
) {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER" && user.departmentId === topic.departmentId) return true;
  return user.id === topic.ownerId;
}

export function canEditTask(
  user: SessionUser,
  task: { ownerId: string; topic: { departmentId: string } },
  participantIds: string[] = []
) {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER" && user.departmentId === task.topic.departmentId) return true;
  return user.id === task.ownerId || participantIds.includes(user.id);
}

export function canManageUsers(role: string) {
  return role === "ADMIN";
}

export function roleAtLeast(role: string, min: Role) {
  const order: Role[] = ["EMPLOYEE", "MANAGER", "ADMIN"];
  return order.indexOf(role as Role) >= order.indexOf(min);
}
