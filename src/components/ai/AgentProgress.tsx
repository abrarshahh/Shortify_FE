'use client';

import React from 'react';
import AgentCard from './AgentCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RenderResponse } from '@/types/api';
import { Music, Film, Sparkles, Sliders, Type, Loader2, AlertCircle } from 'lucide-react';

interface AgentProgressProps {
  statusData: RenderResponse | null;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export default function AgentProgress({ statusData, onCancel, isCancelling }: AgentProgressProps) {
  if (!statusData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-purple-500" />
        <p className="text-sm font-mono">Initializing Agent progress feed...</p>
      </div>
    );
  }

  const { status, current_step = '', progress_percentage = 0, message = '', skipped_clips = [] } = statusData;

  // Resolve status states for the 5 agents
  const getAgentStatus = (agentIndex: number): 'pending' | 'running' | 'success' | 'failed' => {
    if (status === 'done') return 'success';
    if (status === 'cancelled') return 'pending';

    // Agent indexes:
    // 0: Rhythm Engineer
    // 1: Media Analyst
    // 2: Creative Director
    // 3: Video Editor
    // 4: Subtitle Agent

    const stepLower = current_step.toLowerCase();

    // 0. Rhythm Engineer
    if (agentIndex === 0) {
      if (stepLower.includes('beat') || stepLower.includes('rhythm') || stepLower.includes('audio')) {
        return status === 'error' ? 'failed' : 'running';
      }
      // If we are past beat detection, it succeeded
      if (
        stepLower.includes('media') ||
        stepLower.includes('director') ||
        stepLower.includes('storyboard') ||
        stepLower.includes('timeline') ||
        stepLower.includes('render') ||
        stepLower.includes('grade') ||
        stepLower.includes('safe') ||
        stepLower.includes('transcrib') ||
        stepLower.includes('subtitle') ||
        stepLower.includes('cover') ||
        stepLower.includes('complete')
      ) {
        return 'success';
      }
      return 'pending';
    }

    // 1. Media Analyst
    if (agentIndex === 1) {
      if (stepLower.includes('media') || stepLower.includes('vision') || stepLower.includes('highlights')) {
        return status === 'error' ? 'failed' : 'running';
      }
      if (
        stepLower.includes('director') ||
        stepLower.includes('storyboard') ||
        stepLower.includes('timeline') ||
        stepLower.includes('render') ||
        stepLower.includes('grade') ||
        stepLower.includes('safe') ||
        stepLower.includes('transcrib') ||
        stepLower.includes('subtitle') ||
        stepLower.includes('cover') ||
        stepLower.includes('complete')
      ) {
        return 'success';
      }
      return 'pending';
    }

    // 2. Creative Director
    if (agentIndex === 2) {
      if (stepLower.includes('director') || stepLower.includes('storyboard') || stepLower.includes('timeline') || stepLower.includes('safe')) {
        return status === 'error' ? 'failed' : 'running';
      }
      if (
        stepLower.includes('render') ||
        stepLower.includes('grade') ||
        stepLower.includes('transcrib') ||
        stepLower.includes('subtitle') ||
        stepLower.includes('cover') ||
        stepLower.includes('complete')
      ) {
        return 'success';
      }
      return 'pending';
    }

    // 3. Video Editor
    if (agentIndex === 3) {
      if (stepLower.includes('render') || stepLower.includes('grade') || stepLower.includes('lut') || stepLower.includes('compositing')) {
        return status === 'error' ? 'failed' : 'running';
      }
      if (
        stepLower.includes('transcrib') ||
        stepLower.includes('subtitle') ||
        stepLower.includes('cover') ||
        stepLower.includes('complete')
      ) {
        return 'success';
      }
      return 'pending';
    }

    // 4. Subtitle Agent
    if (agentIndex === 4) {
      if (
        stepLower.includes('transcrib') ||
        stepLower.includes('whisper') ||
        stepLower.includes('subtitle') ||
        stepLower.includes('caption') ||
        stepLower.includes('cover') ||
        stepLower.includes('thumbnail')
      ) {
        return status === 'error' ? 'failed' : 'running';
      }
      return 'pending';
    }

    return 'pending';
  };

  const agents = [
    {
      name: 'Rhythm Engineer',
      role: 'Beat Detection & Alignment',
      icon: Music,
      desc: 'Analyzing audio rhythm grid...',
      defaultMsg: 'RhythmEngineer matches transition cuts to audio beat energy levels.',
    },
    {
      name: 'Media Analyst',
      role: 'Gemini Frame Understanding',
      icon: Film,
      desc: 'Scanning raw visual highlights...',
      defaultMsg: 'MediaAnalyst scans frames to locate highlights, faces, and lighting adjustments.',
    },
    {
      name: 'Creative Director',
      role: 'Timeline & EDL Storyboard',
      icon: Sparkles,
      desc: 'Creating story cut layout storyboard...',
      defaultMsg: 'CreativeDirector generates the Edit Decision List narrative layout and overlays.',
    },
    {
      name: 'Video Editor',
      role: 'FFmpeg Core Rendering',
      icon: Sliders,
      desc: 'Merging video cuts and grading color...',
      defaultMsg: 'VideoEditor composites sections, syncs transitions, and grades color.',
    },
    {
      name: 'Subtitle Agent',
      role: 'Whisper Captions & Thumbnails',
      icon: Type,
      desc: 'Transcribing speech and burning text...',
      defaultMsg: 'SubtitleAgent transcribes vocal audio with Whisper and draws styled overlays.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">Render Status</h3>
            <h2 className="text-lg font-bold text-zinc-200">
              {status === 'running'
                ? 'AI Editor is actively editing...'
                : status === 'queued'
                ? 'Queued in background queue...'
                : status === 'error'
                ? 'Pipeline rendering failed'
                : status === 'cancelled'
                ? 'Pipeline render cancelled'
                : 'Project Idle'}
            </h2>
          </div>

          {status === 'running' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              isLoading={isCancelling}
              className="border-zinc-800 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            >
              Cancel Edit
            </Button>
          )}
        </div>

        {/* Global Progress bar */}
        {(status === 'running' || status === 'queued' || status === 'done') && (
          <div className="space-y-2">
            <Progress value={progress_percentage} showPercent size="md" />
            <p className="text-xs text-purple-400 font-medium font-mono animate-pulse">{message}</p>
          </div>
        )}

        {/* Error notification banner */}
        {status === 'error' && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              <span className="font-bold">Error Message:</span> {message || 'An unexpected error occurred during rendering.'}
            </div>
          </div>
        )}

        {/* Skipped Clips notice */}
        {skipped_clips.length > 0 && (
          <div className="text-xs bg-zinc-950/80 border border-zinc-900 text-zinc-400 p-3 rounded-lg flex flex-col gap-1">
            <span className="font-bold text-zinc-300">Skipped low-quality segments ({skipped_clips.length}):</span>
            <span className="font-mono text-[10px] break-all">{skipped_clips.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Agents Card Stack */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Pipeline Agents</h3>
        <div className="flex flex-col gap-3">
          {agents.map((agent, idx) => {
            const agentStatus = getAgentStatus(idx);
            const activeMsg = agentStatus === 'running' ? current_step : agentStatus === 'success' ? 'Task completed successfully.' : agentStatus === 'failed' ? message : agent.defaultMsg;

            return (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                icon={agent.icon}
                status={agentStatus}
                message={activeMsg}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
