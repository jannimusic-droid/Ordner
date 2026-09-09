import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials, avatarColor } from "@/lib/people";

type Person = { id: string; name: string };

/**
 * Visual identity for a person's relation to a topic/task: Verantwortlich (owner)
 * gets a solid primary ring, Beteiligt (participant) gets a neutral ring — this
 * distinction must read at a glance everywhere a person is shown.
 */
export function PersonAvatar({
  person,
  role = "participant",
  size = "sm",
  className,
}: {
  person: Person;
  role?: "owner" | "participant";
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "xs" ? "size-5" : size === "md" ? "size-8" : "size-6.5";
  return (
    <Avatar
      className={cn(
        sizeClass,
        "ring-2",
        role === "owner" ? "ring-primary" : "ring-transparent",
        className
      )}
      title={person.name}
    >
      <AvatarFallback className={cn(avatarColor(person.name), "text-[0.6rem]")}>
        {initials(person.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function PersonChip({
  person,
  role = "participant",
  href,
}: {
  person: Person;
  role?: "owner" | "participant";
  href?: string;
}) {
  const content = (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background py-0.5 pr-2.5 pl-0.5 text-xs">
      <PersonAvatar person={person} role={role} size="xs" />
      <span className="max-w-32 truncate">{person.name}</span>
      {role === "owner" && (
        <span className="rounded-full bg-primary/10 px-1.5 py-px text-[0.65rem] font-medium text-primary">
          V
        </span>
      )}
    </span>
  );
  if (href) {
    return (
      <Link href={href} className="hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}

export function PersonGroup({
  owner,
  participants,
  max = 4,
}: {
  owner: Person;
  participants: Person[];
  max?: number;
}) {
  const shown = participants.slice(0, max);
  const overflow = participants.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      <PersonAvatar person={owner} role="owner" size="xs" />
      {shown.map((p) => (
        <PersonAvatar key={p.id} person={p} role="participant" size="xs" />
      ))}
      {overflow > 0 && (
        <span className="z-10 flex size-5 items-center justify-center rounded-full bg-muted text-[0.6rem] font-medium text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  );
}
