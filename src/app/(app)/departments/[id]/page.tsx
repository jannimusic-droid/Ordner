import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/session";
import { topicListInclude, type TopicListItem } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, avatarColor } from "@/lib/people";
import { ROLE_LABELS } from "@/lib/constants";
import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { TopicRow } from "@/components/common/topic-row";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const [department, people, topics] = await Promise.all([
    prisma.department.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, name: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.topic.findMany({
      where: { departmentId: id },
      include: topicListInclude,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!department) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/departments" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Zurück zu Abteilungen
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <h1 className="text-xl font-semibold">{department.name}</h1>
          {department.description && <p className="mt-1 text-sm text-muted-foreground">{department.description}</p>}
          {department.lead && (
            <p className="mt-2 text-sm text-muted-foreground">Leitung: {department.lead.name}</p>
          )}
        </div>
        {isAdmin(user.role) && <DepartmentFormDialog department={department} people={people} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium">Themen dieser Abteilung ({topics.length})</h2>
          <div className="flex flex-col gap-2">
            {topics.length === 0 && (
              <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                Noch keine Themen in dieser Abteilung.
              </p>
            )}
            {(topics as TopicListItem[]).map((topic) => (
              <TopicRow key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium">Mitglieder ({department.members.length})</h2>
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              {department.members.map((m) => (
                <Link key={m.id} href={`/people/${m.id}`} className="flex items-center gap-2.5 hover:opacity-80">
                  <Avatar className="size-8">
                    <AvatarFallback className={avatarColor(m.name)}>{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="secondary">{ROLE_LABELS[m.role]}</Badge>
                </Link>
              ))}
              {department.members.length === 0 && (
                <p className="text-sm text-muted-foreground">Keine Mitglieder zugeordnet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
