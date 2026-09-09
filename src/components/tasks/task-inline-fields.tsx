"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateTask } from "@/actions/tasks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TASK_STATUS_LABELS, TASK_STATUSES, PRIORITY_LABELS, PRIORITIES } from "@/lib/constants";
import { PeopleSelect } from "@/components/common/people-select";
import type { TaskStatus, Priority } from "@prisma/client";

type Person = { id: string; name: string };

function useUpdate(taskId: string) {
  const [pending, startTransition] = useTransition();
  function run(patch: Parameters<typeof updateTask>[1]) {
    startTransition(() => {
      updateTask(taskId, patch).catch((e) => toast.error(e instanceof Error ? e.message : "Fehler beim Speichern"));
    });
  }
  return { run, pending };
}

export function TaskStatusSelect({ taskId, value, canEdit }: { taskId: string; value: TaskStatus; canEdit: boolean }) {
  const { run, pending } = useUpdate(taskId);
  return (
    <Select value={value} onValueChange={(v) => run({ status: v as TaskStatus })} disabled={!canEdit || pending}>
      <SelectTrigger size="sm" className="w-auto min-w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TaskPrioritySelect({ taskId, value, canEdit }: { taskId: string; value: Priority; canEdit: boolean }) {
  const { run, pending } = useUpdate(taskId);
  return (
    <Select value={value} onValueChange={(v) => run({ priority: v as Priority })} disabled={!canEdit || pending}>
      <SelectTrigger size="sm" className="w-auto min-w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((p) => (
          <SelectItem key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TaskOwnerSelect({
  taskId,
  value,
  people,
  canEdit,
}: {
  taskId: string;
  value: string;
  people: Person[];
  canEdit: boolean;
}) {
  const { run } = useUpdate(taskId);
  if (!canEdit) {
    return <span className="text-sm">{people.find((p) => p.id === value)?.name}</span>;
  }
  return (
    <div className="w-48">
      <PeopleSelect people={people} value={value} onValueChange={(v) => run({ ownerId: v })} />
    </div>
  );
}

export function TaskDueDateInput({ taskId, value, canEdit }: { taskId: string; value: string | null; canEdit: boolean }) {
  const { run } = useUpdate(taskId);
  const [local, setLocal] = React.useState(value ?? "");
  if (!canEdit) return <span className="text-sm">{value ?? "—"}</span>;
  return (
    <Input
      type="date"
      className="h-8 w-40 text-sm"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => run({ dueDate: local || null })}
    />
  );
}

export function TaskNextStepInput({ taskId, value, canEdit }: { taskId: string; value: string | null; canEdit: boolean }) {
  const { run } = useUpdate(taskId);
  const [local, setLocal] = React.useState(value ?? "");
  if (!canEdit) return <p className="text-sm">{value ?? "Kein nächster Schritt definiert"}</p>;
  return (
    <Textarea
      className="text-sm"
      rows={2}
      placeholder="Was ist als Nächstes zu tun?"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== (value ?? "")) run({ nextStep: local || null });
      }}
    />
  );
}
