"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/session";

export async function createDepartment(formData: FormData) {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("Nur Administratoren können Abteilungen anlegen.");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const leadId = String(formData.get("leadId") ?? "") || null;

  if (!name) throw new Error("Name ist erforderlich.");

  await prisma.department.create({ data: { name, description, leadId } });
  revalidatePath("/departments");
}

export async function updateDepartment(id: string, formData: FormData) {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("Nur Administratoren können Abteilungen bearbeiten.");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const leadId = String(formData.get("leadId") ?? "") || null;

  await prisma.department.update({ where: { id }, data: { name, description, leadId } });
  revalidatePath("/departments");
  revalidatePath(`/departments/${id}`);
}
