import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/session";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, avatarColor } from "@/lib/people";
import { NewUserDialog } from "@/components/admin/new-user-dialog";
import { UserRowControls } from "@/components/admin/user-row-controls";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/dashboard");

  const [users, departments] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Administration</h1>
          <p className="text-sm text-muted-foreground">Nutzerverwaltung und Rollen.</p>
        </div>
        <NewUserDialog departments={departments} />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="text-xs font-medium text-muted-foreground">Nutzer</TableCell>
              <TableCell className="text-xs font-medium text-muted-foreground">Rolle / Abteilung / Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className={avatarColor(u.name)}>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <UserRowControls
                    userId={u.id}
                    role={u.role}
                    departmentId={u.departmentId}
                    active={u.active}
                    departments={departments}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Rollen: Administrator (voller Zugriff), Führungskraft (verwaltet Themen/Aufgaben der eigenen Abteilung),
        Mitarbeiter (bearbeitet eigene Aufgaben, kommentiert, aktualisiert Status).
      </p>
    </div>
  );
}
