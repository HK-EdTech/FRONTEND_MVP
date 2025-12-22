"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ResumeAnalyzer } from "@/components/ResumeAnalyzer";
import { CandidateManagement } from "@/components/CandidateManagement";
import { JobPostings } from "@/components/JobPostings";
import { Analytics } from "@/components/Analytics";
import { Settings } from "@/components/Settings";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Supabase authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to signin if not authenticated
        router.push("/signin");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/signin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "analyzer":
        return <ResumeAnalyzer />;
      case "candidates":
        return <CandidateManagement />;
      case "jobs":
        return <JobPostings />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 relative">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden p-4 relative z-10">
          <SidebarTrigger />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {renderContent()}
        </div>
      </main>
    </SidebarProvider>
  );
}
