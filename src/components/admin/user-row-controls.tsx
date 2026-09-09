"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserAccount } from "@/actions/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@prisma/client";

type Department = { id: string; name: string };
const ROLES: Role[] = ["EMPLOYEE", "MANAGER", "ADMIN"];

export function UserRowControls({
  userId,
  role,
  departmentId,
  active,
  departments,
}: {
  userId: string;
  role: Role;
  departmentId: string | null;
  active: boolean;
  departments: Department[];
}) {
  const [pending, startTransition] = useTransition();

  function run(patch: Parameters<typeof updateUserAccount>[1]) {
    startTransition(() => {
      updateUserAccount(userId, patch).catch((e) =>
        toast.error(e instanceof Error ? e.message : "Fehler beim Speichern")
      );
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={role} onValueChange={(v) => run({ role: v as Role })} disabled={pending}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={departmentId ?? "none"}
        onValueChange={(v) => run({ departmentId: v === "none" ? null : v })}
        disabled={pending}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Abteilung" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Keine Abteilung</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Checkbox checked={active} onCheckedChange={(v) => run({ active: v === true })} disabled={pending} />
        Aktiv
      </label>
    </div>
  );
}
