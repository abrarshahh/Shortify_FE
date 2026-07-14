'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Run initialization once on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && isAuthPage) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, isAuthPage, router]);

  // Loading indicator for token checks
  if (isLoading && !isAuthPage) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute rounded-full h-8 w-8 bg-purple-500/10"></div>
        </div>
        <p className="text-zinc-400 font-mono text-xs animate-pulse">Initializing Shortify Workspace...</p>
      </div>
    );
  }

  // Render auth pages directly (login/register)
  if (isAuthPage) {
    return <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">{children}</div>;
  }

  // Render main dashboard shell
  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-zinc-900/30 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
