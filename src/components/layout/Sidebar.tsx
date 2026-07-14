'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Video } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, clearSession } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Project', href: '/create', icon: PlusCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen shrink-0">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-900 gap-2.5">
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-lg text-white">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-zinc-100 tracking-tight text-md">Shortify AI</h1>
          <p className="text-[10px] font-semibold text-purple-400 tracking-wider uppercase font-mono leading-none">autonomous editor</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-500/10'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex flex-col gap-3.5">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold uppercase text-sm select-none">
            {user?.username?.substring(0, 2) || 'AI'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.username || 'Guest User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'authenticated'}</p>
          </div>
        </div>

        <button
          onClick={clearSession}
          className="flex items-center justify-center gap-2 w-full bg-zinc-900/60 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/10 text-zinc-400 text-xs font-medium py-2.5 px-4 rounded-lg border border-zinc-800 transition-all duration-150 active:scale-[0.98]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
