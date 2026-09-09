"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Layers, ClipboardList, Users, Building2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type SearchResults = {
  topics: { id: string; title: string; department: { name: string } }[];
  tasks: { id: string; title: string; topic: { id: string; title: string } }[];
  people: { id: string; name: string; email: string }[];
  departments: { id: string; name: string }[];
  comments: {
    id: string;
    text: string;
    taskId: string | null;
    topicId: string | null;
    task: { id: string; title: string } | null;
    topic: { id: string; title: string } | null;
  }[];
};

const EMPTY: SearchResults = { topics: [], tasks: [], people: [], departments: [], comments: [] };

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults>(EMPTY);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults(EMPTY);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then(setResults)
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results.topics.length ||
    results.tasks.length ||
    results.people.length ||
    results.departments.length ||
    results.comments.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-64 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-xs hover:bg-accent/50"
      >
        <Search className="size-4" />
        Suchen…
        <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Globale Suche</DialogTitle>
          <Command shouldFilter={false} className="flex flex-col">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-4 text-muted-foreground" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Themen, Aufgaben, Personen, Abteilungen, Kommentare…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-96 overflow-y-auto p-2">
              {query.trim().length < 2 && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Mindestens 2 Zeichen eingeben…
                </div>
              )}
              {query.trim().length >= 2 && !hasResults && (
                <Command.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Keine Ergebnisse gefunden.
                </Command.Empty>
              )}

              {results.topics.length > 0 && (
                <Command.Group heading="Themen" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {results.topics.map((t) => (
                    <Command.Item
                      key={t.id}
                      onSelect={() => go(`/topics/${t.id}`)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
                    >
                      <Layers className="size-4 text-muted-foreground" />
                      <span>{t.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{t.department.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.tasks.length > 0 && (
                <Command.Group heading="Aufgaben" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {results.tasks.map((t) => (
                    <Command.Item
                      key={t.id}
                      onSelect={() => go(`/tasks/${t.id}`)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
                    >
                      <ClipboardList className="size-4 text-muted-foreground" />
                      <span>{t.title}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">{t.topic.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.people.length > 0 && (
                <Command.Group heading="Personen" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {results.people.map((p) => (
                    <Command.Item
                      key={p.id}
                      onSelect={() => go(`/people/${p.id}`)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
                    >
                      <Users className="size-4 text-muted-foreground" />
                      <span>{p.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{p.email}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.departments.length > 0 && (
                <Command.Group heading="Abteilungen" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {results.departments.map((d) => (
                    <Command.Item
                      key={d.id}
                      onSelect={() => go(`/departments/${d.id}`)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
                    >
                      <Building2 className="size-4 text-muted-foreground" />
                      <span>{d.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.comments.length > 0 && (
                <Command.Group heading="Kommentare" className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {results.comments.map((c) => (
                    <Command.Item
                      key={c.id}
                      onSelect={() => go(c.taskId ? `/tasks/${c.taskId}` : `/topics/${c.topicId}`)}
                      className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
                    >
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="flex flex-col">
                        <span className="line-clamp-1">{c.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.task?.title ?? c.topic?.title}
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
