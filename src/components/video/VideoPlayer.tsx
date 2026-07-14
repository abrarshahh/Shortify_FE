'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/features/editor/store';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, duration, setDuration } = useEditorStore();
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync play/pause states from Zustand store
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sync video source change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src, setIsPlaying, setCurrentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === videoRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative group bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[640px] shadow-2xl border border-zinc-800/80 mx-auto flex items-center justify-center">
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={handlePlayPause}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Custom Poster Thumbnail Overlay at Start */}
      {!isPlaying && currentTime === 0 && poster && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={poster}
          alt="Video Thumbnail"
          onClick={handlePlayPause}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer z-10 hover:scale-[1.01] transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-20">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Hover Control Overlays */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-3 z-20">
        {/* Progress Seek bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-zinc-300 font-mono w-9">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-purple-500 bg-zinc-700 h-1 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-semibold text-zinc-300 font-mono w-9">{formatTime(duration)}</span>
        </div>

        {/* Buttons / Controls bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-purple-400 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-150 active:scale-90"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-1.5 group/volume">
              <button onClick={handleToggleMute} className="text-zinc-300 hover:text-white p-1">
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-white bg-zinc-700 h-1 rounded-lg cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity duration-150"
              />
            </div>
          </div>

          <button
            onClick={handleFullscreen}
            className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
