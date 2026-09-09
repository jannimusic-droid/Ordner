import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { Role } from "@prisma/client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar role={user.role} unreadNotifications={unread} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          name={user.name ?? ""}
          email={user.email ?? ""}
          role={user.role as Role}
          unreadNotifications={unread}
        />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="mx-auto max-w-[1400px] p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
