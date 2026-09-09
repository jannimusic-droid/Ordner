"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function SortHeader({ field, label, className }: { field: string; label: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort");
  const currentDir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const active = currentSort === field;

  function onClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set("dir", active && currentDir === "asc" ? "desc" : "asc");
    router.push(`${pathname}?${params.toString()}`);
  }

  const Icon = active ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 text-xs font-medium hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="size-3" />
      </button>
    </TableHead>
  );
}
