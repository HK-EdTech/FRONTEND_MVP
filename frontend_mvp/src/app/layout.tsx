'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from '@/lib/supabase';
import { api, ProfileResponse, ModuleWithPermissions, ProfileWithModulesResponse } from '@/lib/api';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [modules, setModules] = useState<ModuleWithPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch profile + modules ONCE on mount (not on every route change)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // Clear state when no session
          setProfile(null);
          setModules([]);
          if (pathname !== '/signin') {
            router.push("/signin");
          }
          setIsLoading(false);
          return;
        }

        // SINGLE API CALL for profile + modules
        const response = await api.getMyProfile(true) as ProfileWithModulesResponse;
        // console.log('[Layout] Profile response:', response);
        // console.log('[Layout] Modules:', response.modules);
        setProfile(response.profile);
        setModules(response.modules || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Clear state on error
        setProfile(null);
        setModules([]);
        if (pathname !== '/signin') {
          router.push("/signin");
        }
        setIsLoading(false);
      }
    };

    if (pathname !== '/signin') {
      fetchData();
    } else {
      // Clear state when on signin page
      setProfile(null);
      setModules([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array = run only once on mount

  // Don't show sidebar on signin page
  if (pathname === '/signin') {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  if (isLoading) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50`}>
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex min-h-screen">
          <SidebarProvider>
            {/* SIDEBAR STAYS MOUNTED - preserves animations */}
            <AppSidebar modules={modules} profile={profile} />

            <main className="flex-1 p-6">
              {/* Children changes on route change */}
              {children}
            </main>
          </SidebarProvider>
        </div>

        <style jsx global>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </body>
    </html>
  );
}
