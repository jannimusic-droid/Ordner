import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-transparent ring-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-transparent ring-transparent",
        outline: "text-foreground ring-border",
        destructive: "bg-destructive/10 text-destructive border-transparent ring-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
