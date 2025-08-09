"use client";

import * as React from "react";
import * as Cmdk from "cmdk";
import { Dialog, DialogContent } from "../dialog";
import { twMerge } from "tailwind-merge";

export interface CommandPaletteItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  items: CommandPaletteItem[];
  placeholder?: string;
  emptyText?: string;
  trigger?: React.ReactNode;
}

export function CommandPalette({
  items,
  placeholder = "Rechercher...",
  emptyText = "Aucun résultat.",
  trigger,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groups = items.reduce((acc, item) => {
    const group = item.group || "Défaut";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, CommandPaletteItem[]>);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          <span>⌘K</span>
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[640px] p-0">
          <Cmdk.Command className="rounded-lg border border-border bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-xl">
            <Cmdk.Input
              placeholder={placeholder}
              className="w-full border-0 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none placeholder:text-neutral-500"
            />
            <Cmdk.List className="max-h-[300px] overflow-y-auto p-2">
              <Cmdk.Empty className="px-4 py-6 text-center text-sm text-neutral-600">
                {emptyText}
              </Cmdk.Empty>
              {Object.entries(groups).map(([group, groupItems]) => (
                <Cmdk.Group key={group} heading={group}>
                  <div className="px-2 py-1.5 text-xs font-medium text-neutral-600">
                    {group}
                  </div>
                  {groupItems.map((item) => (
                    <Cmdk.Item
                      key={item.id}
                      value={item.label}
                      onSelect={() => {
                        item.onSelect?.();
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 aria-selected:bg-neutral-100"
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-xs text-neutral-500">
                          {item.shortcut}
                        </span>
                      )}
                    </Cmdk.Item>
                  ))}
                </Cmdk.Group>
              ))}
            </Cmdk.List>
          </Cmdk.Command>
        </DialogContent>
      </Dialog>
    </>
  );
}