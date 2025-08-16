'use client';

import {
  Button,
  Icon,
  Input,
  Badge,
  DropdownMenu,
  ThemeToggle,
  Avatar,
  Tooltip
} from '../../../../packages/ui/src';
import { Bell, Search, Command, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onCommandClick: () => void;
}

export function Header({ onMenuClick, onCommandClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search bar */}
      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="pl-10 pr-4"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <Tooltip content="Command Palette (⌘K)">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommandClick}
            className="hidden md:inline-flex"
          >
            <Command className="h-5 w-5" />
          </Button>
        </Tooltip>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-80">
            <DropdownMenu.Label>Notifications</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <div className="space-y-1">
              <DropdownMenu.Item className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full justify-between">
                  <span className="font-medium text-sm">New user registered</span>
                  <span className="text-xs text-muted-foreground">2m ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  John Doe just created an account
                </p>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full justify-between">
                  <span className="font-medium text-sm">System update</span>
                  <span className="text-xs text-muted-foreground">1h ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Version 2.1.0 is available
                </p>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full justify-between">
                  <span className="font-medium text-sm">Backup complete</span>
                  <span className="text-xs text-muted-foreground">3h ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily backup completed successfully
                </p>
              </DropdownMenu.Item>
            </div>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="justify-center">
              View all notifications
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                alt="Admin"
                fallback="SA"
                className="h-8 w-8"
              />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-56">
            <DropdownMenu.Label>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Super Admin</p>
                <p className="text-xs text-muted-foreground">admin@dainabase.com</p>
              </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item>
                <Icon name="User" className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Icon name="CreditCard" className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <Icon name="Users" className="mr-2 h-4 w-4" />
              Team
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              New Team
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="text-destructive">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    </header>
  );
}
