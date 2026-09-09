"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { addTopicComment } from "@/actions/topics";
import { addTaskComment } from "@/actions/tasks";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, avatarColor } from "@/lib/people";
import { formatDateTime } from "@/lib/dates";
import { Send } from "lucide-react";

type CommentItem = {
  id: string;
  text: string;
  createdAt: Date | string;
  author: { id: string; name: string };
};

export function CommentThread({
  entity,
  entityId,
  comments,
}: {
  entity: "topic" | "task";
  entityId: string;
  comments: CommentItem[];
}) {
  const [text, setText] = React.useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        if (entity === "topic") await addTopicComment(entityId, trimmed);
        else await addTaskComment(entityId, trimmed);
        setText("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Kommentar konnte nicht gespeichert werden");
      }
    });
  }

  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            Noch keine Einträge. Beginne den Statusverlauf mit einem Update.
          </p>
        )}
        {sorted.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className={avatarColor(c.author.name)}>{initials(c.author.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.author.name}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t pt-3">
        <Textarea
          placeholder="Statusupdate hinzufügen …"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">⌘/Strg + Enter zum Senden</span>
          <Button size="sm" onClick={submit} disabled={pending || !text.trim()} className="gap-1.5">
            <Send className="size-3.5" />
            Senden
          </Button>
        </div>
      </div>
    </div>
  );
}
