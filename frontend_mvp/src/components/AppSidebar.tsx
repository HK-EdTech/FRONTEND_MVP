'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  BrainCircuit,
  Info,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileSearch },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Glassmorphism styles (your current design!)
  const glassStyle = {
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
    '--sidebar-width-icon': '3.75rem', // 60px instead of default 48px
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
          <div className="flex-1 transition-opacity duration-200 delay-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">
            <h1 className="text-lg text-gray-800 whitespace-nowrap">NAME</h1>
          </div>
          <SidebarTrigger className="ml-auto h-10 w-10 hover:bg-white/30 rounded-lg transition-colors group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>

      {/* Navigation - Plain buttons with icon collapse support */}
      <SidebarContent>
        <nav className="p-4 space-y-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-[width,background-color,transform] duration-300
                  group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:gap-0
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white transform translate-x-1 group-data-[collapsible=icon]:translate-x-0'
                    : 'text-gray-700 hover:bg-white/20 hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0'
                  }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="transition-opacity duration-200 delay-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </SidebarContent>

      {/* Footer - Demo Mode + Logout */}
      <SidebarFooter className="p-4 mt-auto space-y-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-700 border border-blue-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:gap-0">
          <Info className="w-4 h-4 shrink-0" />
          <span className="transition-opacity duration-200 delay-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">Demo Mode</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-[width,background-color,transform] duration-300 text-red-600 hover:bg-red-50 hover:translate-x-1 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:hover:translate-x-0 group-data-[collapsible=icon]:gap-0"
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="transition-opacity duration-200 delay-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
