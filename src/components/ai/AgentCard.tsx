'use client';

import React from 'react';
import { LucideIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AgentCardProps {
  name: string;
  role: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  icon: LucideIcon;
}

export default function AgentCard({ name, role, status, message, icon: Icon }: AgentCardProps) {
  const statusColors = {
    pending: 'border-zinc-800 bg-zinc-950/20 text-zinc-500 opacity-60',
    running: 'border-purple-500 bg-purple-500/5 text-purple-400 shadow-md shadow-purple-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    failed: 'border-red-500/30 bg-red-500/5 text-red-400',
  };

  const statusIcons = {
    pending: <div className="h-4.5 w-4.5 rounded-full border border-zinc-700 bg-zinc-900 shrink-0" />,
    running: <Loader2 className="h-4.5 w-4.5 animate-spin text-purple-500 shrink-0" />,
    success: <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />,
    failed: <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />,
  };

  return (
    <div className={`border rounded-2xl p-4 flex gap-4 transition-all duration-300 items-start ${statusColors[status]}`}>
      {/* Agent Icon */}
      <div className={`p-3 rounded-xl border shrink-0 ${
        status === 'running' 
          ? 'bg-purple-600/10 border-purple-500/20 text-purple-300' 
          : status === 'success'
          ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300'
          : status === 'failed'
          ? 'bg-red-600/10 border-red-500/20 text-red-300'
          : 'bg-zinc-900 border-zinc-850 text-zinc-650'
      }`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2.5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">{role}</h4>
            <h3 className={`text-sm font-bold mt-0.5 ${status === 'pending' ? 'text-zinc-400' : 'text-zinc-200'}`}>
              {name}
            </h3>
          </div>
          <div className="shrink-0">{statusIcons[status]}</div>
        </div>

        {/* Message logs */}
        {status !== 'pending' && message && (
          <p className={`text-xs mt-2.5 leading-relaxed truncate font-medium ${
            status === 'failed' 
              ? 'text-red-400' 
              : status === 'success'
              ? 'text-zinc-400'
              : 'text-zinc-300 animate-pulse'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
export { CheckCircle, XCircle, Loader2 };
