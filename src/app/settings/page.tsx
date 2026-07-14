'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Settings, Shield, User, HardDrive, Cpu, Server } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuration templates updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">System Settings</h2>
        <p className="text-zinc-400 text-sm mt-1">Configure workspace defaults and check engine hardware parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Navigation list */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-1.5 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-600/10 border border-purple-500/10 text-left">
            <User className="h-4.5 w-4.5" /> Account Details
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 text-left">
            <Shield className="h-4.5 w-4.5" /> API Configurations
          </button>
        </div>

        {/* Content list */}
        <div className="md:col-span-2 space-y-6">
          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" /> Account Profile
              </CardTitle>
              <CardDescription>Verify active login profile credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Username" value={user?.username || 'video_creator'} disabled />
                  <Input label="Email address" value={user?.email || 'creator@example.com'} disabled />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm">
                    Save Account Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Engine Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-400" /> AI Backend Engine Status
              </CardTitle>
              <CardDescription>Check hardware allocations of your FastAPI Shortify worker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4">
                  <Cpu className="h-5 w-5 mx-auto text-indigo-400 mb-2" />
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Orchestrator</p>
                  <p className="text-sm font-bold text-zinc-200 mt-1 font-mono">LangGraph 1.x</p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4">
                  <HardDrive className="h-5 w-5 mx-auto text-purple-400 mb-2" />
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Transcriber</p>
                  <p className="text-sm font-bold text-zinc-200 mt-1 font-mono">Whisper Local</p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4">
                  <Settings className="h-5 w-5 mx-auto text-emerald-400 mb-2" />
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Video Compositor</p>
                  <p className="text-sm font-bold text-zinc-200 mt-1 font-mono">FFmpeg CFR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
