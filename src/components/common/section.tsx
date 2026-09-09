import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  icon,
  action,
  count,
  emphasis,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  count?: number;
  emphasis?: "default" | "danger" | "warning";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-start gap-2.5">
          {icon && (
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                emphasis === "danger" && "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
                emphasis === "warning" && "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
                (!emphasis || emphasis === "default") && "bg-primary/10 text-primary"
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              {title}
              {typeof count === "number" && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                  {count}
                </span>
              )}
            </CardTitle>
            {description && <CardDescriptionSlot>{description}</CardDescriptionSlot>}
          </div>
        </div>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}

function CardDescriptionSlot({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-dashed py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
