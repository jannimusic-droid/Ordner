"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setTaskParticipants } from "@/actions/tasks";
import { PeopleMultiSelect } from "@/components/common/people-multiselect";

type Person = { id: string; name: string };

export function TaskParticipantsEditor({
  taskId,
  people,
  ownerId,
  defaultValue,
  canEdit,
}: {
  taskId: string;
  people: Person[];
  ownerId: string;
  defaultValue: string[];
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!canEdit) {
    return (
      <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
        {defaultValue.length === 0
          ? "Keine weiteren Beteiligten"
          : people
              .filter((p) => defaultValue.includes(p.id))
              .map((p) => p.name)
              .join(", ")}
      </div>
    );
  }

  return (
    <div className={pending ? "opacity-60" : undefined}>
      <PeopleMultiSelect
        people={people}
        excludeId={ownerId}
        defaultValue={defaultValue}
        onChange={(ids) => {
          startTransition(() => {
            setTaskParticipants(taskId, ids).catch((e) =>
              toast.error(e instanceof Error ? e.message : "Fehler beim Speichern")
            );
          });
        }}
      />
    </div>
  );
}
