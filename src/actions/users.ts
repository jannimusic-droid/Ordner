"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/session";
import type { Role } from "@prisma/client";

export async function createUserAccount(formData: FormData) {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("Nur Administratoren können Nutzer anlegen.");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "EMPLOYEE") as Role;
  const departmentId = String(formData.get("departmentId") ?? "") || null;

  if (!name || !email || password.length < 6) {
    throw new Error("Name, E-Mail und ein Passwort mit mindestens 6 Zeichen sind erforderlich.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role, departmentId } });

  revalidatePath("/admin");
  revalidatePath("/people");
}

export async function updateUserAccount(
  id: string,
  patch: { role?: Role; departmentId?: string | null; active?: boolean }
) {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("Nur Administratoren können Nutzer bearbeiten.");

  await prisma.user.update({ where: { id }, data: patch });

  revalidatePath("/admin");
  revalidatePath("/people");
}
