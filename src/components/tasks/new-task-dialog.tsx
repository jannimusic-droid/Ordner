"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PeopleSelect } from "@/components/common/people-select";
import { PeopleMultiSelect } from "@/components/common/people-multiselect";
import { PRIORITY_LABELS, PRIORITIES } from "@/lib/constants";

type Person = { id: string; name: string };

export function NewTaskDialog({ topicId, people, defaultOwnerId }: { topicId: string; people: Person[]; defaultOwnerId?: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createTask(topicId, formData);
        toast.success("Aufgabe erstellt");
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Aufgabe konnte nicht erstellt werden");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Neue Aufgabe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Aufgabe anlegen</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required placeholder="z. B. Angebot versenden" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Hauptverantwortlicher</Label>
            <PeopleSelect name="ownerId" people={people} defaultValue={defaultOwnerId} placeholder="Verantwortlichen wählen" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Beteiligte Personen</Label>
            <PeopleMultiSelect name="participantIds" people={people} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Priorität</Label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estimatedEffort">Geschätzter Aufwand (optional)</Label>
            <Input id="estimatedEffort" name="estimatedEffort" placeholder="z. B. 2 Stunden, 1 Tag" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextStep">Nächster Schritt</Label>
            <Textarea id="nextStep" name="nextStep" rows={2} placeholder="Was ist als Nächstes zu tun?" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Wird erstellt…" : "Aufgabe anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
