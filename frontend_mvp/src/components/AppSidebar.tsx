'use client';

import { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleWithPermissions, ProfileResponse } from '@/lib/api';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  BrainCircuit,
  Info,
  LogOut,
  Camera,
  FilePlus,
  Calendar as CalendarIcon,
  FileText
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';

// Icon mapping for dynamic modules
const MODULE_ICONS: Record<string, any> = {
  'scan_homework': Camera,
  'assign_homework': FilePlus,
  'calendar': CalendarIcon,
};

interface AppSidebarProps {
  modules: ModuleWithPermissions[];
  profile: ProfileResponse | null;
}

export function AppSidebar({ modules, profile }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    const items = [];

    // FIRST: Dynamic modules from API (sorted by seq_no)
    if (modules && modules.length > 0) {
      items.push(...modules.map(m => ({
        id: m.module_code,
        label: m.module_eng_name,
        icon: MODULE_ICONS[m.module_code] || FileText,
        route: m.route,
        permissions: m.permissions,
        isDynamic: true
      })));
    }

    // SECOND: Hardcoded items
    items.push(
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/' },
      { id: 'analyzer', label: 'Resume Analyzer', icon: FileSearch, route: '/analyzer' },
      { id: 'candidates', label: 'Candidates', icon: Users, route: '/candidates' },
      { id: 'jobs', label: 'Job Postings', icon: Briefcase, route: '/jobs' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/analytics' },
      { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' }
    );

    return items;
  }, [modules]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const glassStyle = {
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
    '--sidebar-width-icon': '3.75rem',
  } as React.CSSProperties;

  return (
    <Sidebar
      collapsible="icon"
      className="shadow-2xl border-0"
      style={glassStyle}
    >
      {/* Header */}
      <SidebarHeader className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0 group-data-[collapsible=icon]:hidden">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 transition-[opacity,visibility] duration-200 delay-[225ms] group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:delay-0">
            <h1 className="text-lg text-gray-800 whitespace-nowrap">ATS Analyzer</h1>
            {profile && (
              <p className="text-xs text-gray-600 whitespace-nowrap">{profile.full_name}</p>
            )}
          </div>
          <SidebarTrigger className="ml-auto h-10 w-10 hover:bg-white/30 rounded-lg transition-colors group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <nav className="p-4 space-y-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-[width,background-color,transform] duration-300
                  group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:gap-0
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white transform translate-x-1 group-data-[collapsible=icon]:translate-x-0'
                    : 'text-gray-700 hover:bg-white/20 hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0'
                  }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap transition-[opacity,visibility] duration-200 delay-[225ms] group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:delay-0">
                  {item.label}
                </span>
                {item.isDynamic && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/20 group-data-[collapsible=icon]:hidden">
                    Dynamic
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 mt-auto space-y-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        {modules.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-100 text-green-700 border border-green-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:gap-0">
            <Info className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap transition-[opacity,visibility] duration-200 delay-[225ms] group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:delay-0">
              {modules.length} module(s)
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-[width,background-color,transform] duration-300 text-red-600 hover:bg-red-50 hover:translate-x-1 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:hover:translate-x-0 group-data-[collapsible=icon]:gap-0"
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap transition-[opacity,visibility] duration-200 delay-[225ms] group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:delay-0">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
