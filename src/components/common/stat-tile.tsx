import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  href?: string;
  tone?: "default" | "danger" | "warning";
}) {
  const content = (
    <div className="flex flex-1 items-center gap-3 rounded-lg border bg-card px-4 py-3.5">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          tone === "danger" && "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
          tone === "warning" && "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
          tone === "default" && "bg-primary/10 text-primary"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex flex-1 hover:border-primary/40">
        {content}
      </Link>
    );
  }
  return content;
}
