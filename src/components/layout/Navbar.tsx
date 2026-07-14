'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Wifi, WifiOff, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
        // Hit standard root endpoint or docs
        await axios.get(`${API_URL}/docs`, { timeout: 3000 });
        setIsBackendOnline(true);
      } catch (err) {
        setIsBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Workspace Console</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Backend status indicator */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800/80">
          {isBackendOnline === true ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">BE ENGINE: ONLINE</span>
            </>
          ) : isBackendOnline === false ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-400 animate-bounce" />
              <span className="text-[10px] font-semibold text-zinc-400 font-mono">BE ENGINE: OFFLINE</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-[10px] font-semibold text-zinc-400 font-mono">CONNECTING...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
