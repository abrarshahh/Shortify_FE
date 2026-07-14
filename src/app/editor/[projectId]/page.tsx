'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useProjectDetails, useListUserAudio } from '@/features/projects/hooks';
import { useRenderStatus, useTriggerRender, useCancelRender } from '@/features/render/hooks';
import { useEditorStore } from '@/features/editor/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import VideoPlayer from '@/components/video/VideoPlayer';
import Timeline from '@/components/video/Timeline';
import ClipItem from '@/components/video/ClipItem';
import MediaUploader from '@/components/upload/MediaUploader';
import AudioUploader from '@/components/upload/AudioUploader';
import AgentProgress from '@/components/ai/AgentProgress';
import api from '@/lib/axios';
import { Textarea } from '@/components/ui/input';

import {
  Film,
  Music,
  Sliders,
  Type,
  ArrowLeft,
  Download,
  Sparkles,
  RefreshCcw,
  MessageSquare,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Loader2,
} from 'lucide-react';

export default function EditorWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Zustand Store
  const editorStore = useEditorStore();

  // Queries
  const { data: project, isLoading: isProjectLoading, refetch: refetchProject } = useProjectDetails(projectId);
  const { data: userAudios } = useListUserAudio();
  const { data: renderStatus, refetch: refetchStatus } = useRenderStatus(projectId, true); // Active status polling enabled

  // Mutations
  const { mutate: triggerRender, isPending: isRendering } = useTriggerRender();
  const { mutate: cancelRender, isPending: isCancelling } = useCancelRender();

  // Left panel active tab state
  const [activeTab, setActiveTab] = useState<'clips' | 'music' | 'settings'>('clips');

  // Generation options state
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [style, setStyle] = useState('cinematic');
  const [captionStyle, setCaptionStyle] = useState('hormozi');
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [addStickers, setAddStickers] = useState(true);
  const [addTextOverlay, setAddTextOverlay] = useState(true);

  // Sync details to Zustand editor state
  useEffect(() => {
    if (!project) return;
    editorStore.setProjectId(project.id);
    editorStore.setMediaItems(project.media || []);

    // Resolve BGM audio details
    if (project.music_id && userAudios) {
      const selectedBgm = userAudios.find((a) => a.id === project.music_id);
      if (selectedBgm) {
        editorStore.setMusicItem(selectedBgm);
      }
    } else {
      editorStore.setMusicItem(null);
    }

    // Set duration if not loaded (duration is set in timeline and player once metadata is read, but initialize with target duration as backup)
    if (project.target_duration && editorStore.duration === 0) {
      editorStore.setDuration(project.target_duration);
    }
  }, [project, userAudios]);

  // Sync render inputs on details load
  useEffect(() => {
    if (project) {
      setPrompt(project.title || '');
      if (project.target_duration) setDuration(project.target_duration as 15 | 30 | 60);
      if (project.style) setStyle(project.style);
      if (project.caption_style) setCaptionStyle(project.caption_style);
    }
  }, [project]);

  // Clean up store on unmount
  useEffect(() => {
    return () => {
      editorStore.resetEditor();
    };
  }, []);

  const handleStartRender = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a creative brief or render prompt instruction.');
      return;
    }

    triggerRender(
      {
        projectId,
        data: {
          prompt,
          output_filename: 'final_output.mp4',
          target_duration: duration,
          aspect_ratio: '9:16',
          style,
          caption_style: captionStyle,
          add_subtitle: addSubtitles,
          add_stickers: addStickers,
          add_textoverlay: addTextOverlay,
        },
      },
      {
        onSuccess: () => {
          toast.success('New AI render job dispatched to worker queue.');
          refetchProject();
        },
      }
    );
  };

  const handleCancelRender = () => {
    if (confirm('Cancel the active video rendering task?')) {
      cancelRender(projectId, {
        onSuccess: () => {
          toast.success('Active render task cancelled.');
          refetchProject();
        },
      });
    }
  };

  const handleResetCache = async () => {
    if (confirm('Reset analysis cache for this project? This will force AI agents to re-analyze all files.')) {
      try {
        await api.delete(`/projects/${projectId}/cache`);
        toast.success('Cache wiped successfully.');
        refetchProject();
      } catch (err) {
        // Intercepted
      }
    }
  };

  const handleDownload = () => {
    if (!project?.last_output_path) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
    // Direct link to download route
    window.open(`${API_URL}/projects/${projectId}/download`, '_blank');
  };

  if (isProjectLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-zinc-400 font-mono text-xs animate-pulse">Loading Workspace details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3.5 text-center">
        <h3 className="text-lg font-bold text-zinc-300">Project Not Found</h3>
        <Button onClick={() => router.push('/dashboard')} size="sm">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
  const renderJobState = renderStatus?.status || 'idle';
  const videoSrc = project.last_output_path ? `${API_URL}/storage/${project.last_output_path.replace(/\\/g, '/')}` : '';
  const thumbnailSrc = `${API_URL}/storage/exports/${projectId}/thumbnail.jpg`;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-6 max-w-[1600px] mx-auto overflow-hidden">
      {/* Editor Header Title */}
      <div className="flex items-center justify-between shrink-0 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="border border-zinc-800 hover:bg-zinc-800 text-zinc-400 h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-zinc-100 truncate">{project.title || 'Untitled Project'}</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5 tracking-wider">
              Project ID: {projectId}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0">
          {renderJobState === 'done' && (
            <Button variant="primary" size="sm" onClick={handleDownload} className="flex items-center gap-1.5 shadow-lg">
              <Download className="h-4 w-4" /> Download Export
            </Button>
          )}

          {renderJobState === 'error' && (
            <Button variant="outline" size="sm" onClick={handleResetCache} className="border-zinc-800 text-zinc-400 hover:text-red-400">
              Clear Cache
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              refetchProject();
              refetchStatus();
            }}
            className="border-zinc-800 h-9 w-9 p-0 text-zinc-400"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Workspace Panels Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Media Explorer & Settings (Span 4) */}
        <div className="lg:col-span-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {/* Tab Selector buttons */}
          <div className="flex border-b border-zinc-900 shrink-0 bg-zinc-950/60 p-2 gap-1.5">
            <button
              onClick={() => setActiveTab('clips')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150 ${
                activeTab === 'clips'
                  ? 'bg-purple-600/10 border-purple-500/10 text-purple-400 font-semibold'
                  : 'border-transparent text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Film className="h-3.5 w-3.5" /> Clips
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150 ${
                activeTab === 'music'
                  ? 'bg-purple-600/10 border-purple-500/10 text-purple-400 font-semibold'
                  : 'border-transparent text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Music className="h-3.5 w-3.5" /> Soundtrack
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150 ${
                activeTab === 'settings'
                  ? 'bg-purple-600/10 border-purple-500/10 text-purple-400 font-semibold'
                  : 'border-transparent text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Settings
            </button>
          </div>

          {/* Tab contents scroll pane */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'clips' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Project Media Library</h4>
                  <p className="text-[11px] text-zinc-500">Upload or review visual assets linked to this workspace timeline.</p>
                </div>
                {/* Embedded Media uploader */}
                <MediaUploader projectId={projectId} />
              </div>
            )}

            {activeTab === 'music' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Soundtrack Audio</h4>
                  <p className="text-[11px] text-zinc-500">Add or manage project background music for tempo cuts.</p>
                </div>
                {/* Embedded Audio uploader */}
                <AudioUploader projectId={projectId} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Render Parameters</h4>
                  <p className="text-[11px] text-zinc-500">Adjust the timeline parameters to trigger a fresh render.</p>
                </div>

                <div className="space-y-5">
                  <Textarea
                    label="Edit Prompt instruction"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='E.g. "Create travel vlog style edits with fast pacing..."'
                    disabled={renderJobState === 'running' || renderJobState === 'queued'}
                  />

                  {/* Settings selectors */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value) as 15 | 30 | 60)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      >
                        <option value={15}>15s Reel</option>
                        <option value={30}>30s Short</option>
                        <option value={60}>60s Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Theme Aesthetic</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      >
                        <option value="cinematic">Cinematic look</option>
                        <option value="travel">Travel vlog</option>
                        <option value="fast_cut">Beat Cut sync</option>
                        <option value="adventure">Adventure</option>
                        <option value="dramatic">Dramatic tone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Subtitle Theme</label>
                      <select
                        value={captionStyle}
                        onChange={(e) => setCaptionStyle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      >
                        <option value="hormozi">Alex Hormozi (Emoji highlights)</option>
                        <option value="clean">Clean Modern</option>
                        <option value="none">No subtitle overlays</option>
                      </select>
                    </div>
                  </div>

                  {/* Render switches */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-305 text-zinc-300">Speech Subtitles</span>
                        <span className="text-[10px] text-zinc-500">Transcribe voice and burn captions.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addSubtitles}
                        onChange={(e) => setAddSubtitles(e.target.checked)}
                        className="accent-purple-500 h-4 w-4 bg-zinc-900 border-zinc-800 rounded"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-305 text-zinc-300">Giphy Overlay Stickers</span>
                        <span className="text-[10px] text-zinc-500">Download dynamic overlays dynamically.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addStickers}
                        onChange={(e) => setAddStickers(e.target.checked)}
                        className="accent-purple-500 h-4 w-4 bg-zinc-900 border-zinc-800 rounded"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-305 text-zinc-300">Title Text Overlays</span>
                        <span className="text-[10px] text-zinc-500">Burn title text overlays designed by AI.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addTextOverlay}
                        onChange={(e) => setAddTextOverlay(e.target.checked)}
                        className="accent-purple-500 h-4 w-4 bg-zinc-900 border-zinc-800 rounded"
                        disabled={renderJobState === 'running' || renderJobState === 'queued'}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleStartRender}
                    disabled={renderJobState === 'running' || renderJobState === 'queued' || isRendering}
                    className="w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse fill-current text-purple-300" />
                    Trigger Render
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Video Viewport / Agent progress visualizer (Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-center min-h-0 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative w-full h-full flex flex-col justify-center">
            {/* If pipeline is active, show agent status visualizer */}
            {renderJobState === 'running' || renderJobState === 'queued' || (renderJobState === 'error' && !videoSrc) ? (
              <div className="w-full max-w-md mx-auto overflow-y-auto max-h-[640px] pr-1.5 scrollbar-thin">
                <AgentProgress
                  statusData={renderStatus || null}
                  onCancel={handleCancelRender}
                  isCancelling={isCancelling}
                />
              </div>
            ) : videoSrc ? (
              /* Play final compiled video */
              <div className="flex flex-col items-center">
                <VideoPlayer src={videoSrc} poster={thumbnailSrc} />
              </div>
            ) : (
              /* Default not rendered state */
              <div className="text-center py-20 space-y-4 max-w-sm mx-auto">
                <div className="bg-zinc-900 border border-zinc-800 text-zinc-500 p-5 rounded-2xl inline-block">
                  <Play className="h-8 w-8 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-zinc-300">Video Not Generated</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Generate an autonomous video by configuring creative brief settings under the settings tab and dispatching a render.
                </p>
                <Button size="sm" onClick={() => setActiveTab('settings')}>
                  Open Settings Tab
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Chat Assistant (Span 3) */}
        <div className="lg:col-span-3 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between min-h-0 overflow-hidden">
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <MessageSquare className="h-4.5 w-4.5 text-purple-400" />
              <h3 className="text-sm font-bold text-zinc-200">AI Editor Assistant</h3>
            </div>

            {/* Chat list / Placeholder message */}
            <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed">
              <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 flex gap-3 items-start">
                <Info className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-zinc-300">Feature Notice</p>
                  <p className="text-[11px]">
                    Interactive edit instructions (e.g. chat corrections) are currently being finalized.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950/30 border border-dashed border-zinc-850 rounded-xl p-5 text-center flex flex-col items-center justify-center min-h-[160px] text-zinc-650">
                <Sliders className="h-6 w-6 mb-2.5" />
                <p className="font-semibold text-zinc-550 text-[10px] uppercase tracking-wider">Adjustment Console</p>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[160px] leading-normal">
                  To adjust cuts, modify the render prompts under the Settings tab and trigger a new render.
                </p>
              </div>
            </div>
          </div>

          {/* Disabled chat input box */}
          <div className="border-t border-zinc-900 pt-4 mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask AI to make changes... (Disabled)"
                disabled
                className="w-full bg-zinc-950/40 border border-zinc-900 rounded-xl py-3 pl-3.5 pr-10 text-xs text-zinc-500 placeholder-zinc-600 cursor-not-allowed focus:outline-none"
              />
              <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Timeline Viewer (Span 12) */}
      <div className="shrink-0">
        <Timeline />
      </div>

    </div>
  );
}
export { Loader2 };
