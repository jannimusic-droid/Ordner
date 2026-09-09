import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OPEN_TASK_STATUSES } from "@/lib/constants";
import { isOverdue } from "@/lib/dates";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials, avatarColor } from "@/lib/people";
import { ROLE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      department: { select: { name: true } },
      ownedTasks: { select: { id: true, status: true, dueDate: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Personen</h1>
        <p className="text-sm text-muted-foreground">Alle Mitarbeitenden mit ihrer aktuellen Auslastung.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => {
          const openTasks = u.ownedTasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
          const overdue = openTasks.filter((t) => isOverdue(t.dueDate));
          return (
            <Link
              key={u.id}
              href={`/people/${u.id}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm"
            >
              <Avatar className="size-10">
                <AvatarFallback className={avatarColor(u.name)}>{initials(u.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.department?.name ?? "Keine Abteilung"} · {ROLE_LABELS[u.role]}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge variant="secondary">{openTasks.length} offen</Badge>
                  {overdue.length > 0 && <Badge variant="destructive">{overdue.length} überfällig</Badge>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
