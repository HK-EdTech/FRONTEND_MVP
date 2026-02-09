'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from '@/lib/supabase';
import { api, ProfileResponse, ModuleWithPermissions, ProfileWithModulesResponse } from '@/lib/api';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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

  // Find current module based on pathname
  const currentModule = modules.find(m => m.route === pathname);

  // Fetch profile + modules ONCE on mount (not on every route change)
  useEffect(() => {
    const fetchData = async () => {
      const t0 = performance.now();
      console.log(`[⏱ Layout] fetchData START at ${new Date().toISOString()}`);

      try {
        // Check if we have cached profile from login (performance optimization)
        const cached = sessionStorage.getItem('cached_profile');

        if (cached) {
          console.log(`[⏱ Layout] Cache HIT — +${(performance.now() - t0).toFixed(0)}ms`);
          const cachedData = JSON.parse(cached) as ProfileWithModulesResponse;
          setProfile(cachedData.profile);
          setModules(cachedData.modules || []);

          if (pathname === "/" && cachedData.profile.default_route && cachedData.profile.default_route !== "/") {
            console.log(`[⏱ Layout] Redirecting to ${cachedData.profile.default_route} (cached) — +${(performance.now() - t0).toFixed(0)}ms`);
            router.push(cachedData.profile.default_route);
          }
          setIsLoading(false);
          console.log(`[⏱ Layout] DONE (cached path) — total ${(performance.now() - t0).toFixed(0)}ms`);
          return;
        }

        console.log(`[⏱ Layout] Cache MISS — calling supabase.auth.getSession()...`);
        const t1 = performance.now();

        // No cache - check authentication and fetch profile
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log(`[⏱ Layout] supabase.auth.getSession() done — ${(performance.now() - t1).toFixed(0)}ms (total +${(performance.now() - t0).toFixed(0)}ms)`);

        if (error || !session) {
          console.log(`[⏱ Layout] No session — redirecting to /signin — +${(performance.now() - t0).toFixed(0)}ms`);
          // Clear state when no session
          setProfile(null);
          setModules([]);
          if (pathname !== '/signin') {
            router.push("/signin");
          }
          setIsLoading(false);
          return;
        }

        // Fetch profile + modules from API
        console.log(`[⏱ Layout] Calling api.getMyProfile(true)...`);
        const t2 = performance.now();

        const response = await api.getMyProfile(true) as ProfileWithModulesResponse;

        console.log(`[⏱ Layout] api.getMyProfile() done — ${(performance.now() - t2).toFixed(0)}ms (total +${(performance.now() - t0).toFixed(0)}ms)`);

        setProfile(response.profile);
        setModules(response.modules || []);

        // Smart router: Redirect from "/" to role-specific default_route
        if (pathname === "/" && response.profile.default_route && response.profile.default_route !== "/") {
          console.log(`[⏱ Layout] Redirecting to ${response.profile.default_route} — +${(performance.now() - t0).toFixed(0)}ms`);
          router.push(response.profile.default_route);
          setIsLoading(false);
          console.log(`[⏱ Layout] DONE — total ${(performance.now() - t0).toFixed(0)}ms`);
          return;
        }

        setIsLoading(false);
        console.log(`[⏱ Layout] DONE — total ${(performance.now() - t0).toFixed(0)}ms`);
      } catch (err) {
        console.error(`[⏱ Layout] ERROR after ${(performance.now() - t0).toFixed(0)}ms:`, err);
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

            <main className="flex-1">
              {/* Header Bar - Glass style on mobile, transparent on desktop */}
              <div className="sticky top-0 z-40 px-6 py-3 flex items-center gap-3 backdrop-blur-md bg-white/70 border-b border-white/30 shadow-lg md:bg-transparent md:border-none md:backdrop-blur-none md:shadow-none">
                {/* Trigger button - Only visible on mobile */}
                <div className="md:hidden">
                  <SidebarTrigger className="hover:bg-white/50 h-10 w-10 rounded-lg transition-colors" />
                </div>

                {/* Module Title and Description */}
                {currentModule && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent truncate">
                      {currentModule.module_eng_name}
                    </h1>
                    {currentModule.description && (
                      <p className="hidden md:block text-base text-gray-600 mt-1 truncate">
                        {currentModule.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Main content area */}
              <div className="px-6 pb-6">
                {children}
              </div>
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
