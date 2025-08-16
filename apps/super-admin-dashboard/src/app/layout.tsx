'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { 
  AppShell,
  ThemeToggle,
  NotificationCenter,
  CommandPalette,
  UIProvider
} from '../../../packages/ui/src';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  // Keyboard shortcut for command palette
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UIProvider>
          <AppShell
            header={
              <Header 
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                onCommandClick={() => setCommandOpen(true)}
              />
            }
            sidebar={
              <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            }
            sidebarOpen={sidebarOpen}
          >
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>

            {/* Global Components */}
            <NotificationCenter position="bottom-right" />
            <CommandPalette 
              open={commandOpen}
              onOpenChange={setCommandOpen}
              commands={[
                {
                  id: 'home',
                  label: 'Go to Dashboard',
                  action: () => window.location.href = '/',
                  icon: 'Home',
                },
                {
                  id: 'users',
                  label: 'Manage Users',
                  action: () => window.location.href = '/users',
                  icon: 'Users',
                },
                {
                  id: 'content',
                  label: 'Content Management',
                  action: () => window.location.href = '/content',
                  icon: 'FileText',
                },
                {
                  id: 'analytics',
                  label: 'View Analytics',
                  action: () => window.location.href = '/analytics',
                  icon: 'BarChart',
                },
                {
                  id: 'settings',
                  label: 'Settings',
                  action: () => window.location.href = '/settings',
                  icon: 'Settings',
                },
                {
                  id: 'theme',
                  label: 'Toggle Theme',
                  action: () => {
                    const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                    document.documentElement.classList.toggle('dark');
                    localStorage.setItem('theme', theme);
                  },
                  icon: 'Moon',
                },
              ]}
            />
          </AppShell>
        </UIProvider>
      </body>
    </html>
  );
}
