import { requireUser } from "@/lib/session";
import { getDashboardData } from "@/lib/queries";
import { sortByUrgency } from "@/lib/urgency";
import { Section, EmptyState } from "@/components/common/section";
import { StatTile } from "@/components/common/stat-tile";
import { TaskRow } from "@/components/common/task-row";
import { TopicRow } from "@/components/common/topic-row";
import {
  AlertOctagon,
  CalendarCheck,
  Flame,
  Hourglass,
  Layers,
  ListTodo,
  ShieldAlert,
  Ban,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  const todayFocus = sortByUrgency([...data.overdue, ...data.dueToday, ...data.highPriority]).filter(
    (task, idx, arr) => arr.findIndex((t) => t.id === task.id) === idx
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Willkommen zurück, {user.name?.split(" ")[0]}. Das ist heute wichtig.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Offene Aufgaben"
          value={data.stats.openTasks}
          icon={<ListTodo className="size-4.5" />}
          href="/my-tasks"
        />
        <StatTile
          label="Überfällige Aufgaben"
          value={data.stats.overdueTasks}
          icon={<AlertOctagon className="size-4.5" />}
          href="/my-tasks?overdue=1"
          tone="danger"
        />
        <StatTile
          label="Blockierte Aufgaben"
          value={data.stats.blockedTasks}
          icon={<Ban className="size-4.5" />}
          href="/my-tasks?status=BLOCKED"
          tone="warning"
        />
        <StatTile
          label="Eigene Themen"
          value={data.stats.ownedTopics}
          icon={<Layers className="size-4.5" />}
          href="/topics"
        />
      </div>

      <Section
        title="Heute relevant"
        description="Überfällig, heute fällig oder hohe/kritische Priorität"
        icon={<Flame className="size-4" />}
        emphasis="danger"
        count={todayFocus.length}
      >
        {todayFocus.length === 0 ? (
          <EmptyState text="Nichts Dringendes für heute — gut gemacht." />
        ) : (
          todayFocus.slice(0, 8).map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Kommende Aufgaben"
          description="Fällig in den nächsten 7 Tagen"
          icon={<CalendarCheck className="size-4" />}
          count={data.upcoming.length}
        >
          {data.upcoming.length === 0 ? (
            <EmptyState text="Keine Aufgaben in den nächsten 7 Tagen fällig." />
          ) : (
            sortByUrgency(data.upcoming)
              .slice(0, 6)
              .map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </Section>

        <Section
          title="Wartet auf Rückmeldung"
          description="Du wartest aktuell auf eine andere Person"
          icon={<Hourglass className="size-4" />}
          count={data.waiting.length}
        >
          {data.waiting.length === 0 ? (
            <EmptyState text="Du wartest aktuell auf niemanden." />
          ) : (
            data.waiting.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </Section>
      </div>

      <Section
        title="Kritische Themen"
        description="Hohe Priorität, blockiert oder überfällig"
        icon={<ShieldAlert className="size-4" />}
        emphasis="warning"
        count={data.criticalTopics.length}
      >
        {data.criticalTopics.length === 0 ? (
          <EmptyState text="Aktuell keine kritischen Themen in deiner Verantwortung." />
        ) : (
          data.criticalTopics.map((topic) => <TopicRow key={topic.id} topic={topic} />)
        )}
      </Section>
    </div>
  );
}
