'use client';

import React, { useRef } from 'react';
import { useEditorStore } from '@/features/editor/store';
import { Film, Music, Type, Play } from 'lucide-react';

export default function Timeline() {
  const { mediaItems, musicItem, currentTime, duration, isPlaying, setCurrentTime } = useEditorStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  // Handle seeking by clicking on the timeline
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    const targetTime = percent * duration;

    // Trigger video seek
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Calculate percentage progress of playhead
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time display
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 shadow-xl select-none">
      {/* Timeline stats header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-400 font-mono">TIMELINE MONITOR</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs font-semibold">
          <span className="text-zinc-500">PLAYHEAD:</span>
          <span className="text-purple-400">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="relative">
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative min-h-[140px] bg-zinc-900/40 rounded-xl border border-zinc-800/40 overflow-hidden cursor-ew-resize flex flex-col justify-between py-1.5"
        >
          {/* 1. Subtitles / Captions Track */}
          <div className="h-8 flex items-center px-4 gap-2 relative bg-zinc-950/20 border-b border-zinc-900/60">
            <div className="w-16 flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase shrink-0">
              <Type className="h-3.5 w-3.5 text-yellow-500/80" /> Text
            </div>
            {duration > 0 && (
              <div className="flex-1 flex gap-2 h-full py-1">
                <div className="w-[15%] bg-yellow-500/10 border border-yellow-500/25 rounded-md text-[9px] font-semibold text-yellow-400/80 flex items-center justify-center truncate px-1">
                  Intro
                </div>
                <div className="w-[25%] bg-yellow-500/10 border border-yellow-500/25 rounded-md text-[9px] font-semibold text-yellow-400/80 flex items-center justify-center truncate px-1">
                  Vocal Segment 1
                </div>
                <div className="w-[20%] bg-yellow-500/10 border border-yellow-500/25 rounded-md text-[9px] font-semibold text-yellow-400/80 flex items-center justify-center truncate px-1">
                  Transition Hook
                </div>
                <div className="w-[22%] bg-yellow-500/10 border border-yellow-500/25 rounded-md text-[9px] font-semibold text-yellow-400/80 flex items-center justify-center truncate px-1">
                  Peak Moment
                </div>
              </div>
            )}
          </div>

          {/* 2. Video Clips Track */}
          <div className="h-10 flex items-center px-4 gap-2 relative bg-zinc-950/20 border-b border-zinc-900/60">
            <div className="w-16 flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase shrink-0">
              <Film className="h-3.5 w-3.5 text-indigo-400" /> Video
            </div>
            <div className="flex-1 flex gap-1 h-full py-1">
              {mediaItems.length > 0 ? (
                mediaItems.map((item, idx) => {
                  // Calculate dynamic visual width percentage based on duration if present, or distribute equally
                  const clipWidth = item.duration && duration > 0 ? `${(item.duration / duration) * 90}%` : '20%';
                  return (
                    <div
                      key={item.id}
                      style={{ width: clipWidth }}
                      className="bg-indigo-600/10 hover:bg-indigo-600/15 border border-indigo-500/20 rounded-md text-[9px] font-semibold text-indigo-300 flex items-center justify-between px-2 min-w-[50px] truncate"
                    >
                      <span className="truncate">{item.original_filename}</span>
                      {item.duration && <span className="text-[8px] opacity-65 font-mono">{item.duration}s</span>}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center text-[10px] text-zinc-600 italic">No video clips linked.</div>
              )}
            </div>
          </div>

          {/* 3. Audio Music Track */}
          <div className="h-8 flex items-center px-4 gap-2 relative bg-zinc-950/20">
            <div className="w-16 flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase shrink-0">
              <Music className="h-3.5 w-3.5 text-purple-400" /> Audio
            </div>
            <div className="flex-1 flex h-full py-1">
              {musicItem ? (
                <div className="w-full bg-purple-600/10 border border-purple-500/20 rounded-md text-[9px] font-semibold text-purple-300 flex items-center justify-between px-2.5 truncate">
                  <span className="truncate">{musicItem.original_filename}</span>
                  <span className="text-[8px] opacity-65 font-mono">BGM</span>
                </div>
              ) : (
                <div className="flex items-center text-[10px] text-zinc-600 italic">No music track linked.</div>
              )}
            </div>
          </div>

          {/* Interactive Playhead Line */}
          {duration > 0 && (
            <div
              className="absolute inset-y-0 w-[2px] bg-purple-500 pointer-events-none shadow-[0_0_10px_rgba(168,85,247,0.7)] transition-all ease-out duration-75"
              style={{ left: `calc(${playheadPercent}% + 72px)` }} // Offset by the track titles width (16px + 16px title label offset)
            >
              {/* Playhead Handle */}
              <div className="absolute -top-1 -translate-x-[4px] h-3.5 w-2.5 bg-purple-500 rounded-sm flex items-center justify-center shadow-lg">
                <Play className="h-2 w-2 text-white fill-current rotate-90" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
