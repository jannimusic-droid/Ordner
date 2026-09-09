import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { canEditTask } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TaskStatusSelect,
  TaskPrioritySelect,
  TaskOwnerSelect,
  TaskDueDateInput,
  TaskNextStepInput,
} from "@/components/tasks/task-inline-fields";
import { TaskParticipantsEditor } from "@/components/tasks/task-participants-editor";
import { CommentThread } from "@/components/common/comment-thread";
import { ActivityList } from "@/components/common/activity-list";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const [task, people] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        topic: { select: { id: true, title: true, departmentId: true, department: { select: { name: true } } } },
        owner: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
        comments: { include: { author: { select: { id: true, name: true } } } },
        activities: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!task) notFound();

  const canEdit = canEditTask(
    user,
    { ownerId: task.ownerId, topic: { departmentId: task.topic.departmentId } },
    task.participants.map((p) => p.userId)
  );

  return (
    <div className="flex flex-col gap-5">
      <Link href="/tasks" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Zurück zu Aufgaben
      </Link>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{task.title}</h1>
            <Link
              href={`/topics/${task.topic.id}`}
              className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Layers className="size-3.5" />
              {task.topic.department.name} · {task.topic.title}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TaskPrioritySelect taskId={task.id} value={task.priority} canEdit={canEdit} />
            <TaskStatusSelect taskId={task.id} value={task.status} canEdit={canEdit} />
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
          {task.description || "Keine Beschreibung hinterlegt."}
        </p>

        <Separator className="my-5" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Hauptverantwortlicher">
            <TaskOwnerSelect taskId={task.id} value={task.ownerId} people={people} canEdit={canEdit} />
          </Field>
          <Field label="Beteiligte">
            <TaskParticipantsEditor
              taskId={task.id}
              people={people}
              ownerId={task.ownerId}
              defaultValue={task.participants.map((p) => p.userId)}
              canEdit={canEdit}
            />
          </Field>
          <Field label="Fälligkeit">
            <TaskDueDateInput
              taskId={task.id}
              value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : null}
              canEdit={canEdit}
            />
          </Field>
          <Field label="Startdatum">
            <p className="text-sm">{formatDate(task.startDate)}</p>
          </Field>
          <Field label="Geschätzter Aufwand">
            <p className="text-sm">{task.estimatedEffort || "—"}</p>
          </Field>
          <Field label="Erstellt am">
            <p className="text-sm">{formatDate(task.createdAt)}</p>
          </Field>
          <Field label="Letzte Aktualisierung">
            <p className="text-sm">{formatDateTime(task.updatedAt)}</p>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Nächster Schritt">
            <TaskNextStepInput taskId={task.id} value={task.nextStep} canEdit={canEdit} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <h3 className="mb-3 text-sm font-medium">Statusverlauf / Kommentare</h3>
            <CommentThread entity="task" entityId={task.id} comments={task.comments} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <h3 className="mb-3 text-sm font-medium">Aktivitätshistorie</h3>
            <ActivityList items={task.activities} />
          </CardContent>
        </Card>
      </div>
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
