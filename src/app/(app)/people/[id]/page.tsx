import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { taskListInclude, topicListInclude, type TaskListItem, type TopicListItem } from "@/lib/queries";
import { sortByUrgency } from "@/lib/urgency";
import { OPEN_TASK_STATUSES } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, avatarColor } from "@/lib/people";
import { ROLE_LABELS } from "@/lib/constants";
import { Section, EmptyState } from "@/components/common/section";
import { TaskRow } from "@/components/common/task-row";
import { TopicRow } from "@/components/common/topic-row";
import { UserCheck, Users, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const person = await prisma.user.findUnique({
    where: { id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!person) notFound();

  const [ownedTasks, participantTaskLinks, ownedTopics] = await Promise.all([
    prisma.task.findMany({ where: { ownerId: id }, include: taskListInclude }),
    prisma.taskParticipant.findMany({ where: { userId: id }, include: { task: { include: taskListInclude } } }),
    prisma.topic.findMany({ where: { ownerId: id }, include: topicListInclude, orderBy: { updatedAt: "desc" } }),
  ]);

  const participantTasks = participantTaskLinks
    .map((l) => l.task)
    .filter((t) => t.ownerId !== id) as TaskListItem[];

  const openOwned = sortByUrgency((ownedTasks as TaskListItem[]).filter((t) => OPEN_TASK_STATUSES.includes(t.status)));
  const openParticipant = sortByUrgency(participantTasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status)));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/people" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Zurück zu Personen
      </Link>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
        <Avatar className="size-14">
          <AvatarFallback className={avatarColor(person.name)}>{initials(person.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{person.name}</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-3.5" />
            {person.email}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {person.department?.name ?? "Keine Abteilung"} · {ROLE_LABELS[person.role]}
          </p>
        </div>
      </div>

      <Section title="Verantwortlich" icon={<UserCheck className="size-4" />} count={openOwned.length}>
        {openOwned.length === 0 ? (
          <EmptyState text="Keine offenen Aufgaben in Verantwortung." />
        ) : (
          openOwned.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </Section>

      <Section title="Beteiligt" icon={<Users className="size-4" />} count={openParticipant.length}>
        {openParticipant.length === 0 ? (
          <EmptyState text="Aktuell an keiner offenen Aufgabe beteiligt." />
        ) : (
          openParticipant.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </Section>

      <Section title="Eigene Themen" icon={<Layers className="size-4" />} count={ownedTopics.length}>
        {ownedTopics.length === 0 ? (
          <EmptyState text="Aktuell kein Thema in Verantwortung." />
        ) : (
          (ownedTopics as TopicListItem[]).map((topic) => <TopicRow key={topic.id} topic={topic} />)
        )}
      </Section>
    </div>
  );
}
