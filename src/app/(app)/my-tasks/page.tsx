import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getAllTasksForUser } from "@/lib/queries";
import { isOverdue, isDueToday, isDueSoon } from "@/lib/dates";
import { sortByUrgency } from "@/lib/urgency";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  PRIORITY_LABELS,
  PRIORITIES,
} from "@/lib/constants";
import { Section, EmptyState } from "@/components/common/section";
import { TaskRow } from "@/components/common/task-row";
import { SelectFilter } from "@/components/common/select-filter";
import { TextFilter } from "@/components/common/text-filter";
import { ToggleFilter } from "@/components/common/toggle-filter";
import { UserCheck, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const DUE_OPTIONS = [
  { value: "overdue", label: "Überfällig" },
  { value: "today", label: "Heute fällig" },
  { value: "soon", label: "Nächste 7 Tage" },
];

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const [allTasks, departments, topics] = await Promise.all([
    getAllTasksForUser(),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.topic.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  let myTasks = allTasks.filter(
    (t) => t.ownerId === user.id || t.participants.some((p) => p.userId === user.id)
  );

  if (!sp.showDone) myTasks = myTasks.filter((t) => t.status !== "DONE");
  if (sp.status) myTasks = myTasks.filter((t) => t.status === sp.status);
  if (sp.priority) myTasks = myTasks.filter((t) => t.priority === sp.priority);
  if (sp.department) myTasks = myTasks.filter((t) => t.topic.department.id === sp.department);
  if (sp.topic) myTasks = myTasks.filter((t) => t.topicId === sp.topic);
  if (sp.due === "overdue") myTasks = myTasks.filter((t) => isOverdue(t.dueDate));
  if (sp.due === "today") myTasks = myTasks.filter((t) => isDueToday(t.dueDate));
  if (sp.due === "soon") myTasks = myTasks.filter((t) => isDueSoon(t.dueDate, 7));
  if (sp.q) {
    const q = sp.q.toLowerCase();
    myTasks = myTasks.filter((t) => t.title.toLowerCase().includes(q));
  }

  const onlyOwner = sp.onlyOwner === "1";
  const onlyParticipant = sp.onlyParticipant === "1";

  const ownerTasks = sortByUrgency(myTasks.filter((t) => t.ownerId === user.id));
  const participantTasks = sortByUrgency(
    myTasks.filter((t) => t.ownerId !== user.id && t.participants.some((p) => p.userId === user.id))
  );

  const showOwnerSection = !onlyParticipant || onlyOwner;
  const showParticipantSection = !onlyOwner || onlyParticipant;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Meine Aufgaben</h1>
        <p className="text-sm text-muted-foreground">
          Alle Aufgaben, bei denen du verantwortlich oder beteiligt bist.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TextFilter placeholder="Meine Aufgaben durchsuchen…" />
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
        <SelectFilter
          param="department"
          label="Abteilung"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />
        <SelectFilter
          param="topic"
          label="Thema"
          options={topics.map((t) => ({ value: t.id, label: t.title }))}
          width="w-48"
        />
        <SelectFilter param="due" label="Fälligkeit" options={DUE_OPTIONS} />
        <div className="mx-1 h-5 w-px bg-border" />
        <ToggleFilter id="onlyOwner" param="onlyOwner" label="Nur verantwortlich" />
        <ToggleFilter id="onlyParticipant" param="onlyParticipant" label="Nur beteiligt" />
        <ToggleFilter id="showDone" param="showDone" label="Erledigte anzeigen" />
      </div>

      {showOwnerSection && (
        <Section
          title="Verantwortlich"
          description="Du bist Hauptverantwortlicher dieser Aufgaben"
          icon={<UserCheck className="size-4" />}
          count={ownerTasks.length}
        >
          {ownerTasks.length === 0 ? (
            <EmptyState text="Aktuell keine Aufgaben in deiner Verantwortung." />
          ) : (
            ownerTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </Section>
      )}

      {showParticipantSection && (
        <Section
          title="Beteiligt"
          description="Du bist an diesen Aufgaben beteiligt, aber nicht verantwortlich"
          icon={<Users className="size-4" />}
          count={participantTasks.length}
        >
          {participantTasks.length === 0 ? (
            <EmptyState text="Aktuell keine Aufgaben, an denen du beteiligt bist." />
          ) : (
            participantTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </Section>
      )}
    </div>
  );
}
