import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/session";
import { OPEN_TOPIC_STATUSES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, avatarColor } from "@/lib/people";
import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { Users, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const user = await requireUser();

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      lead: { select: { id: true, name: true } },
      members: { select: { id: true } },
      topics: { select: { id: true, status: true } },
    },
  });

  const people = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Abteilungen</h1>
          <p className="text-sm text-muted-foreground">Alle Abteilungen des Unternehmens.</p>
        </div>
        {isAdmin(user.role) && <DepartmentFormDialog people={people} />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const openTopics = dept.topics.filter((t) => OPEN_TOPIC_STATUSES.includes(t.status)).length;
          return (
            <Link key={dept.id} href={`/departments/${dept.id}`}>
              <Card className="h-full transition-shadow hover:shadow-sm hover:border-primary/40">
                <CardContent className="flex flex-col gap-3 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{dept.name}</h3>
                    <Layers className="size-4 text-muted-foreground" />
                  </div>
                  {dept.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{dept.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {dept.members.length} Mitglied{dept.members.length === 1 ? "" : "er"}
                    </span>
                    <span>
                      {openTopics} offene{openTopics === 1 ? "s" : ""} Thema{openTopics === 1 ? "" : "en"}
                    </span>
                  </div>
                  {dept.lead && (
                    <div className="flex items-center gap-2 border-t pt-3">
                      <Avatar className="size-6">
                        <AvatarFallback className={avatarColor(dept.lead.name)}>{initials(dept.lead.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Leitung: {dept.lead.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
