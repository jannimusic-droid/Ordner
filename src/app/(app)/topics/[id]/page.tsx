import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { canEditTopic } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/dates";
import { OPEN_TASK_STATUSES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TopicStatusSelect,
  TopicPrioritySelect,
  TopicOwnerSelect,
  TopicDueDateInput,
  TopicNextStepInput,
} from "@/components/topics/topic-inline-fields";
import { TopicParticipantsEditor } from "@/components/topics/topic-participants-editor";
import { CommentThread } from "@/components/common/comment-thread";
import { ActivityList } from "@/components/common/activity-list";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskStatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { DueDate } from "@/components/common/due-date";
import { PersonGroup } from "@/components/common/person";
import { NextStep } from "@/components/common/next-step";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const [topic, people] = await Promise.all([
    prisma.topic.findUnique({
      where: { id },
      include: {
        department: true,
        owner: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
        tasks: {
          include: {
            owner: { select: { id: true, name: true } },
            participants: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: "asc" },
        },
        comments: { include: { author: { select: { id: true, name: true } } } },
        activities: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!topic) notFound();

  const canEdit = canEditTopic(user, topic);
  const openTasks = topic.tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/topics" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Zurück zu Themen
      </Link>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{topic.title}</h1>
              {topic.crossDepartment && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Abteilungsübergreifend
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{topic.department.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TopicPrioritySelect topicId={topic.id} value={topic.priority} canEdit={canEdit} />
            <TopicStatusSelect topicId={topic.id} value={topic.status} canEdit={canEdit} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Hauptverantwortlicher">
            <TopicOwnerSelect topicId={topic.id} value={topic.ownerId} people={people} canEdit={canEdit} />
          </Field>
          <Field label="Beteiligte">
            <TopicParticipantsEditor
              topicId={topic.id}
              people={people}
              ownerId={topic.ownerId}
              defaultValue={topic.participants.map((p) => p.userId)}
              canEdit={canEdit}
            />
          </Field>
          <Field label="Fälligkeit">
            <TopicDueDateInput
              topicId={topic.id}
              value={topic.dueDate ? new Date(topic.dueDate).toISOString().slice(0, 10) : null}
              canEdit={canEdit}
            />
          </Field>
          <Field label="Startdatum">
            <p className="text-sm">{formatDate(topic.startDate)}</p>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Nächster Schritt">
            <TopicNextStepInput topicId={topic.id} value={topic.nextStep} canEdit={canEdit} />
          </Field>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben ({openTasks.length})</TabsTrigger>
          <TabsTrigger value="activity">Aktivität / Status</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="info">Informationen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-2 text-sm font-medium">Beschreibung</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {topic.description || "Keine Beschreibung hinterlegt."}
              </p>
              <Separator className="my-5" />
              <h3 className="mb-3 text-sm font-medium">Offene Aufgaben ({openTasks.length})</h3>
              <div className="flex flex-col gap-2">
                {openTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">Keine offenen Aufgaben in diesem Thema.</p>
                )}
                {openTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:border-primary/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">{task.title}</span>
                    <PriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                    <DueDate date={task.dueDate} className="hidden lg:inline-flex" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Alle Aufgaben in diesem Thema</h3>
                <NewTaskDialog topicId={topic.id} people={people} defaultOwnerId={topic.ownerId} />
              </div>
              <div className="flex flex-col gap-2">
                {topic.tasks.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Noch keine Aufgaben — lege die erste Aufgabe für dieses Thema an.
                  </p>
                )}
                {topic.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex flex-col gap-2 rounded-md border px-3 py-2.5 text-sm hover:border-primary/40 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{task.title}</p>
                      <NextStep text={task.nextStep} className="mt-0.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      <DueDate date={task.dueDate} />
                      <PersonGroup owner={task.owner} participants={task.participants.map((p) => p.user)} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-5">
                <h3 className="mb-3 text-sm font-medium">Statusverlauf / Kommentare</h3>
                <CommentThread entity="topic" entityId={topic.id} comments={topic.comments} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <h3 className="mb-3 text-sm font-medium">Aktivitätshistorie</h3>
                <ActivityList items={topic.activities} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="pt-5">
              <p className="py-8 text-center text-sm text-muted-foreground">
                Dateiablage ist für dieses Thema noch nicht angebunden.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
              <Field label="Abteilung">
                <p className="text-sm">{topic.department.name}</p>
              </Field>
              <Field label="Abteilungsübergreifend">
                <p className="text-sm">{topic.crossDepartment ? "Ja" : "Nein"}</p>
              </Field>
              <Field label="Erstellt am">
                <p className="text-sm">{formatDateTime(topic.createdAt)}</p>
              </Field>
              <Field label="Letzte Aktualisierung">
                <p className="text-sm">{formatDateTime(topic.updatedAt)}</p>
              </Field>
              <Field label="Themen-ID">
                <p className="font-mono text-xs text-muted-foreground">{topic.id}</p>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
