import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getAllTopics } from "@/lib/queries";
import { TOPIC_STATUS_LABELS, TOPIC_STATUSES, PRIORITY_LABELS, PRIORITIES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortHeader } from "@/components/common/sort-header";
import { SelectFilter } from "@/components/common/select-filter";
import { TextFilter } from "@/components/common/text-filter";
import { ViewToggle } from "@/components/common/view-toggle";
import { TopicStatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { DueDate } from "@/components/common/due-date";
import { NextStep } from "@/components/common/next-step";
import { PersonGroup } from "@/components/common/person";
import { NewTopicDialog } from "@/components/topics/new-topic-dialog";
import { TopicKanban } from "@/components/topics/topic-kanban";
import { OPEN_TASK_STATUSES, PRIORITY_ORDER } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const [topics, departments, people] = await Promise.all([
    getAllTopics(),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  let filtered = topics;
  if (sp.department) filtered = filtered.filter((t) => t.departmentId === sp.department);
  if (sp.status) filtered = filtered.filter((t) => t.status === sp.status);
  if (sp.priority) filtered = filtered.filter((t) => t.priority === sp.priority);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }

  const sort = sp.sort ?? "updatedAt";
  const dir = sp.dir === "desc" ? -1 : 1;
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "priority":
        return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "dueDate":
        return (
          ((a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
            (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)) *
          dir
        );
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    }
  });

  const view = sp.view === "kanban" ? "kanban" : "table";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Themen</h1>
          <p className="text-sm text-muted-foreground">Alle laufenden Themen im Unternehmen im Überblick.</p>
        </div>
        <NewTopicDialog departments={departments} people={people} defaultDepartmentId={user.departmentId ?? undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TextFilter placeholder="Themen durchsuchen…" />
        <SelectFilter
          param="department"
          label="Abteilung"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />
        <SelectFilter
          param="status"
          label="Status"
          options={TOPIC_STATUSES.map((s) => ({ value: s, label: TOPIC_STATUS_LABELS[s] }))}
        />
        <SelectFilter
          param="priority"
          label="Priorität"
          options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
        />
        <div className="flex-1" />
        <ViewToggle />
      </div>

      {view === "kanban" ? (
        <TopicKanban topics={filtered} />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="title" label="Thema" />
                <TableCell className="text-xs font-medium text-muted-foreground">Abteilung</TableCell>
                <TableCell className="text-xs font-medium text-muted-foreground">Verantwortlicher</TableCell>
                <SortHeader field="priority" label="Priorität" />
                <SortHeader field="status" label="Status" />
                <TableCell className="text-xs font-medium text-muted-foreground">Nächster Schritt</TableCell>
                <SortHeader field="dueDate" label="Fälligkeit" />
                <TableCell className="text-xs font-medium text-muted-foreground">Offene Aufgaben</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((topic) => {
                const openTasks = topic.tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status)).length;
                return (
                  <TableRow key={topic.id} className="cursor-pointer">
                    <TableCell className="max-w-64">
                      <Link href={`/topics/${topic.id}`} className="font-medium hover:underline">
                        {topic.title}
                      </Link>
                      {topic.crossDepartment && (
                        <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[0.6rem] text-muted-foreground">
                          Abt.-übergreifend
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{topic.department.name}</TableCell>
                    <TableCell>
                      <PersonGroup owner={topic.owner} participants={topic.participants.map((p) => p.user)} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={topic.priority} />
                    </TableCell>
                    <TableCell>
                      <TopicStatusBadge status={topic.status} />
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal">
                      <NextStep text={topic.nextStep} />
                    </TableCell>
                    <TableCell>
                      <DueDate date={topic.dueDate} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{openTasks}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Keine Themen gefunden.</p>
          )}
        </div>
      )}
    </div>
  );
}
