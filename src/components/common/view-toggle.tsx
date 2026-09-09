"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table2, KanbanSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "kanban" ? "kanban" : "table";

  function set(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md border p-0.5">
      <button
        onClick={() => set("table")}
        className={cn(
          "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
          view === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Table2 className="size-3.5" />
        Tabelle
      </button>
      <button
        onClick={() => set("kanban")}
        className={cn(
          "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
          view === "kanban" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <KanbanSquare className="size-3.5" />
        Kanban
      </button>
    </div>
  );
}
