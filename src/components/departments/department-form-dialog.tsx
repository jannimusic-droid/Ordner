"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { createDepartment, updateDepartment } from "@/actions/departments";
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
import { PeopleSelect } from "@/components/common/people-select";

type Person = { id: string; name: string };
type Department = { id: string; name: string; description: string | null; leadId: string | null };

export function DepartmentFormDialog({
  department,
  people,
}: {
  department?: Department;
  people: Person[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();
  const isEdit = !!department;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (isEdit) await updateDepartment(department!.id, formData);
        else await createDepartment(formData);
        toast.success(isEdit ? "Abteilung aktualisiert" : "Abteilung angelegt");
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="size-3.5" />
            Bearbeiten
          </Button>
        ) : (
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Neue Abteilung
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Abteilung bearbeiten" : "Neue Abteilung anlegen"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={department?.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" name="description" defaultValue={department?.description ?? ""} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Abteilungsleitung</Label>
            <PeopleSelect name="leadId" people={people} defaultValue={department?.leadId ?? undefined} placeholder="Leitung wählen" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
