import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllTasksForUser } from "@/lib/queries";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  PRIORITY_LABELS,
  PRIORITIES,
  PRIORITY_ORDER,
} from "@/lib/constants";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortHeader } from "@/components/common/sort-header";
import { SelectFilter } from "@/components/common/select-filter";
import { TextFilter } from "@/components/common/text-filter";
import { TaskStatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { DueDate } from "@/components/common/due-date";
import { NextStep } from "@/components/common/next-step";
import { PersonGroup } from "@/components/common/person";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const [tasks, departments] = await Promise.all([
    getAllTasksForUser(),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  let filtered = tasks;
  if (sp.department) filtered = filtered.filter((t) => t.topic.department.id === sp.department);
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Aufgaben</h1>
        <p className="text-sm text-muted-foreground">Alle Aufgaben über alle Themen und Abteilungen hinweg.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TextFilter placeholder="Aufgaben durchsuchen…" />
        <SelectFilter
          param="department"
          label="Abteilung"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />
        <SelectFilter
          param="status"
          label="Status"
          options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }))}
        />
        <SelectFilter
          param="priority"
          label="Priorität"
          options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="title" label="Aufgabe" />
              <TableCell className="text-xs font-medium text-muted-foreground">Thema</TableCell>
              <TableCell className="text-xs font-medium text-muted-foreground">Abteilung</TableCell>
              <TableCell className="text-xs font-medium text-muted-foreground">Verantwortlicher / Beteiligte</TableCell>
              <SortHeader field="priority" label="Priorität" />
              <SortHeader field="status" label="Status" />
              <SortHeader field="dueDate" label="Fällig am" />
              <TableCell className="text-xs font-medium text-muted-foreground">Nächster Schritt</TableCell>
              <TableCell className="text-xs font-medium text-muted-foreground">Letzte Aktualisierung</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="max-w-56 whitespace-normal">
                  <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                </TableCell>
                <TableCell className="max-w-40 truncate text-muted-foreground">
                  <Link href={`/topics/${task.topic.id}`} className="hover:underline">
                    {task.topic.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{task.topic.department.name}</TableCell>
                <TableCell>
                  <PersonGroup owner={task.owner} participants={task.participants.map((p) => p.user)} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <DueDate date={task.dueDate} />
                </TableCell>
                <TableCell className="max-w-56 whitespace-normal">
                  <NextStep text={task.nextStep} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(task.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Keine Aufgaben gefunden.</p>
        )}
      </div>
    </div>
  );
}
