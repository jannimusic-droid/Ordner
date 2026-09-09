import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { NotificationRow } from "@/components/notifications/notification-row";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Benachrichtigungen</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} ungelesen` : "Alles gelesen"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 && (
          <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
            Noch keine Benachrichtigungen.
          </p>
        )}
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
