"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command as Cmdk } from "cmdk";
import { twMerge } from "tailwind-merge";
import { Button } from "../button";

type CommandItem = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect?: () => void;
  group?: string;
};

export interface CommandPaletteProps {
  placeholder?: string;
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hotkey?: string; // ex: "mod+k"
}

function parseHotkey(h: string) {
  const isMac = typeof window !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  return h.replace("mod", isMac ? "⌘" : "Ctrl");
}

export function CommandPalette({
  placeholder = "Rechercher une action…",
  items,
  open,
  onOpenChange,
  hotkey = "mod+k",
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const setOpen = (v: boolean) => {
    setIsOpen(v);
    onOpenChange?.(v);
  };

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
      const isMod = isMac ? e.metaKey : e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const groups = Array.from(new Set(items.map(i => i.group || "General")));

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Ouvrir la palette ({parseHotkey(hotkey)})
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content
            className={twMerge(
              "fixed left-1/2 top-1/5 z-[1050] w-[90vw] max-w-2xl -translate-x-1/2 rounded-lg border border-border bg-white shadow-xl outline-none"
            )}
          >
            <Cmdk label="Command Menu" className="cmdk-ui">
              <div className="p-2 border-b border-border">
                <Cmdk.Input
                  autoFocus
                  placeholder={placeholder}
                  className="h-11 w-full rounded-md bg-white px-3 text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
              <Cmdk.List className="max-h-[60vh] overflow-auto py-2">
                {groups.map(g => (
                  <Cmdk.Group key={g} heading={g} className="px-2 py-1">
                    {items
                      .filter(i => (i.group || "General") === g)
                      .map(i => (
                        <Cmdk.Item
                          key={i.id}
                          onSelect={() => {
                            i.onSelect?.();
                            setOpen(false);
                          }}
                          className="cursor-pointer rounded-md px-2 py-2 text-sm aria-selected:bg-neutral-100"
                        >
                          <span>{i.label}</span>
                          {i.shortcut && (
                            <kbd className="ml-auto rounded border border-border bg-neutral-50 px-1 text-[10px]">
                              {i.shortcut}
                            </kbd>
                          )}
                        </Cmdk.Item>
                      ))}
                  </Cmdk.Group>
                ))}
                <Cmdk.Empty className="px-3 py-6 text-sm text-neutral-500">
                  Aucun résultat
                </Cmdk.Empty>
              </Cmdk.List>
            </Cmdk>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}