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
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)'
  };

  return (
    <Sidebar
      className="shadow-2xl border-0"
      style={glassStyle}
    >
      {/* Header - Same as your current design */}
      <SidebarHeader className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg text-gray-800">Company Name</h1>
            <p className="text-xs text-gray-600">AI-Powered Homework Marking</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation - Plain buttons like original */}
      <SidebarContent>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white transform translate-x-1'
                    : 'text-gray-700 hover:bg-white/20 hover:translate-x-1'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </SidebarContent>

      {/* Footer - Demo Mode + Logout */}
      <SidebarFooter className="p-4 mt-auto space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-700 border border-blue-200">
          <Info className="w-4 h-4" />
          <span>Demo Mode</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 text-red-600 hover:bg-red-50 hover:translate-x-1"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
