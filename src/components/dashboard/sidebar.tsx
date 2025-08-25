'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  FileText, 
  Upload, 
  Settings, 
  Home,
  FileSearch,
  GitCompare,
  Brain,
  HelpCircle,
  Layers
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    name: 'Upload Files',
    href: '/dashboard/upload',
    icon: Upload,
    description: 'Add new files for analysis'
  },
  {
    name: 'Files',
    href: '/dashboard/files',
    icon: FileText,
    description: 'Browse analyzed files'
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileSearch,
    description: 'Generated reports'
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Legacy Analyzer</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Main
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-4 w-4 flex-shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="px-4 py-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div>Version 1.0.0</div>
          <div>2025 Legacy Analyzer</div>
        </div>
      </div>
    </div>
  );
}
