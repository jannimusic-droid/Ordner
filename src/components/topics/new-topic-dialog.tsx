"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTopic } from "@/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
type Department = { id: string; name: string };

export function NewTopicDialog({
  departments,
  people,
  defaultDepartmentId,
}: {
  departments: Department[];
  people: Person[];
  defaultDepartmentId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createTopic(formData);
        toast.success("Thema erstellt");
        setOpen(false);
        router.push(`/topics/${id}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Thema konnte nicht erstellt werden");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Neues Thema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neues Thema anlegen</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required placeholder="z. B. Produktionsplanung optimieren" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Kurze Beschreibung</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Abteilung</Label>
              <Select name="departmentId" defaultValue={defaultDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung wählen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Hauptverantwortlicher</Label>
            <PeopleSelect name="ownerId" people={people} placeholder="Verantwortlichen wählen" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Beteiligte Personen</Label>
            <PeopleMultiSelect name="participantIds" people={people} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Fälligkeitsdatum (optional)</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
              <Checkbox id="crossDepartment" name="crossDepartment" />
              <Label htmlFor="crossDepartment" className="font-normal">
                Abteilungsübergreifend
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextStep">Nächster Schritt</Label>
            <Textarea id="nextStep" name="nextStep" rows={2} placeholder="Was ist als Nächstes zu tun?" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Wird erstellt…" : "Thema anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
