import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export function isAdmin(role: string) {
  return role === "ADMIN";
}

export function isManager(role: string) {
  return role === "MANAGER" || role === "ADMIN";
}
