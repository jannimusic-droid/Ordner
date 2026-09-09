import Link from "next/link";
import { Bell } from "lucide-react";
import { CommandPalette } from "@/components/search/command-palette";
import { UserMenu } from "@/components/layout/user-menu";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

export function Topbar({
  title,
  name,
  email,
  role,
  unreadNotifications,
}: {
  title?: string;
  name: string;
  email: string;
  role: Role;
  unreadNotifications: number;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      {title && <h1 className="text-sm font-semibold">{title}</h1>}
      <div className="flex-1" />
      <CommandPalette />
      <Link
        href="/notifications"
        className="relative flex size-9 items-center justify-center rounded-md hover:bg-accent"
      >
        <Bell className="size-4.5" />
        {unreadNotifications > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center px-1 text-[0.6rem]">
            {unreadNotifications}
          </Badge>
        )}
      </Link>
      <UserMenu name={name} email={email} role={role} />
    </header>
  );
}
