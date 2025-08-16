'use client';

import {
  NavigationMenu,
  Button,
  Icon,
  Badge,
  ScrollArea,
  Separator
} from '../../../../packages/ui/src';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/', icon: 'Home', badge: null },
      { label: 'Analytics', href: '/analytics', icon: 'BarChart3', badge: null },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: '/users', icon: 'Users', badge: '1.2k' },
      { label: 'Content', href: '/content', icon: 'FileText', badge: '3.8k' },
      { label: 'Collections', href: '/collections', icon: 'Database', badge: '42' },
      { label: 'Media', href: '/media', icon: 'Image', badge: null },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: 'Settings', badge: null },
      { label: 'API Access', href: '/api', icon: 'Key', badge: null },
      { label: 'Webhooks', href: '/webhooks', icon: 'Webhook', badge: '8' },
      { label: 'Logs', href: '/logs', icon: 'FileText', badge: 'New' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { label: 'Import/Export', href: '/tools/import-export', icon: 'Download', badge: null },
      { label: 'Backup', href: '/tools/backup', icon: 'HardDrive', badge: null },
      { label: 'Health Check', href: '/tools/health', icon: 'Activity', badge: null },
    ]
  }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300",
        "bg-dashboard-sidebar dashboard-sidebar",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Command" className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Dainabase</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={onClose}
          >
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="User" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Super Admin</p>
              <p className="text-xs text-white/60">admin@dainabase.com</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {menuItems.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "nav-item flex items-center justify-between",
                          isActive && "active"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon 
                            name={item.icon as any} 
                            className="w-4 h-4" 
                          />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'New' ? 'default' : 'secondary'}
                            className="ml-auto bg-white/20 text-white border-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Icon name="HelpCircle" className="w-4 h-4 mr-3" />
            Help & Support
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Icon name="LogOut" className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
