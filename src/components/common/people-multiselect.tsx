"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/common/person";

type Person = { id: string; name: string };

export function PeopleMultiSelect({
  name,
  people,
  excludeId,
  defaultValue = [],
  onChange,
  placeholder = "Beteiligte auswählen",
}: {
  name?: string;
  people: Person[];
  excludeId?: string;
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [selected, setSelected] = React.useState<string[]>(defaultValue);
  const options = people.filter((p) => p.id !== excludeId);

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setSelected(next);
    onChange?.(next);
  }

  return (
    <Popover>
      {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="flex items-center gap-1 truncate">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                <div className="flex -space-x-1.5">
                  {selected.slice(0, 4).map((id) => {
                    const p = options.find((o) => o.id === id);
                    return p ? <PersonAvatar key={id} person={p} size="xs" /> : null;
                  })}
                </div>
                <span className="ml-1">{selected.length} ausgewählt</span>
              </>
            )}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {options.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
              <PersonAvatar person={p} size="xs" />
              {p.name}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
