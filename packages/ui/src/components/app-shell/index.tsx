"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Sheet, SheetTrigger, SheetContent } from "../sheet";
import { Button } from "../button";
import { CommandPalette } from "../command-palette";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu";
import { useToast } from "../toast";

export interface AppShellProps {
  sidebar?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children?: React.ReactNode;
  title?: string;
}

export function AppShell({ sidebar, topbarRight, children, title = "Dashboard" }: AppShellProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <div className="sticky top-0 z-[1030] flex h-14 items-center gap-2 border-b border-border bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">☰</Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="w-full max-w-md">{sidebar}</div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-sm font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <CommandPalette
            items={[
              { id: "go-dashboard", label: "Aller au Dashboard", group: "Navigation" },
              { id: "new-report", label: "Créer un rapport", group: "Actions" },
            ]}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Compte ▾</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => toast({ title: "Profil" })}>Profil</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast({ title: "Paramètres" })}>Paramètres</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast({ title: "Déconnexion" })}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {topbarRight}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-14 hidden min-w-[240px] border-r border-border bg-white dark:bg-neutral-900 dark:border-neutral-800 md:block">
          {sidebar}
        </aside>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}