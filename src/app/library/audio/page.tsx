'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useListUserAudio,
  useDeleteAudioEntirely,
  useRemoveAudio,
  useProjects,
  useUploadAudioToLibrary,
} from '@/features/projects/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import {
  Music,
  Trash2,
  Calendar,
  Clock,
  HardDrive,
  FileText,
  Search,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Volume2,
  UploadCloud,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export default function AudioLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: audioItems, isLoading: loadingAudio, refetch: refetchAudio } = useListUserAudio({
    search: searchQuery || undefined,
    limit,
    offset: (page - 1) * limit,
  });
  const { data: projects } = useProjects();
  
  const { mutate: removeAudio } = useRemoveAudio();
  const { mutate: deleteAudioEntirely, isPending: deletingEntirely } = useDeleteAudioEntirely();
  const { mutate: uploadAudioToLibrary, isPending: isUploading } = useUploadAudioToLibrary();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      uploadAudioToLibrary(
        {
          files,
          onProgress: (progress) => setUploadProgress(progress),
        },
        {
          onSuccess: () => {
            toast.success('Audio files uploaded to library');
            setUploadProgress(0);
            refetchAudio();
          },
          onError: () => {
            setUploadProgress(0);
          },
        }
      );
    }
  };

  const selectedItem = audioItems?.find((item) => item.id === selectedId);

  const getAssetUrl = (path: string) => {
    if (!path) return '';
    return `${API_URL}/storage/${path.replace(/\\/g, '/')}`;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProjectName = (id: string) => {
    const proj = projects?.find((p) => p.id === id);
    return proj ? proj.title : `Project ${id.substring(0, 8)}`;
  };

  const handleRemoveFromProject = (projectId: string, audioId: string) => {
    if (confirm('Are you sure you want to remove this audio asset from this project?')) {
      removeAudio(
        { projectId, audioId },
        {
          onSuccess: () => {
            toast.success('Audio removed from project successfully');
            refetchAudio();
          },
        }
      );
    }
  };

  const handleDeleteEntirely = (audioId: string) => {
    if (
      confirm(
        'Warning: This will permanently delete the audio file from disk and remove it from all associated projects. Continue?'
      )
    ) {
      deleteAudioEntirely(audioId, {
        onSuccess: () => {
          toast.success('Audio deleted entirely');
          setSelectedId(null);
          refetchAudio();
        },
      });
    }
  };

  const filteredAudio = audioItems;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Audio Library</h1>
              <p className="text-sm text-zinc-400">View and manage your sound effects, voiceovers, and ambient music.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search uploaded audio..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-zinc-900/60 border-zinc-800 focus-visible:ring-purple-500 focus-visible:border-transparent text-sm"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="audio/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload Files</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {loadingAudio ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm text-zinc-400">Loading library audio tracks...</p>
          </div>
        ) : filteredAudio && filteredAudio.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAudio.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`cursor-pointer overflow-hidden border transition bg-zinc-900/40 hover:bg-zinc-900 hover:scale-[1.02] duration-200 group ${
                    isSelected
                      ? 'border-purple-500/80 ring-1 ring-purple-500/40'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="aspect-[4/3] relative bg-zinc-950 flex flex-col items-center justify-center border-b border-zinc-900/60">
                    <div className="p-4 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/10 group-hover:scale-110 duration-200">
                      <Music className="h-6 w-6" />
                    </div>

                    {/* Format Indicator Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-300 border border-zinc-800 flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-purple-400" />
                      <span>Audio</span>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-purple-400 transition">
                      {item.original_filename}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {formatBytes(item.file_size)} • {new Date(item.uploaded_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-zinc-900/10">
            <Music className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-md font-semibold text-zinc-300">No audio assets found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Upload sound files or music tracks in your project wizard to populate your audio library catalog.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {audioItems && audioItems.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-900 pt-6 mt-6 shrink-0 font-sans">
            <span className="text-xs text-zinc-500 font-medium">
              Page {page}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs border-zinc-800 hover:bg-zinc-900 transition px-4 py-2"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={!(audioItems && audioItems.length === limit)}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs border-zinc-800 hover:bg-zinc-900 transition px-4 py-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Side Inspector Panel */}
      <div className="w-96 bg-zinc-950 border-l border-zinc-900 flex flex-col h-full shrink-0 overflow-y-auto">
        {selectedItem ? (
          <div className="flex-1 flex flex-col">
            {/* Audio Waveform/Player Container */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/40">
              <div className="h-36 w-full rounded-xl bg-gradient-to-tr from-purple-950/30 to-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center p-4 relative shadow-inner gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 h-8 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1.5 h-10 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1.5 h-6 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-8 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <audio
                  src={getAssetUrl(selectedItem.storage_path)}
                  controls
                  className="w-full"
                />
              </div>
            </div>

            {/* Details List */}
            <div className="p-6 space-y-6 flex-1">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Asset File</h3>
                <h2 className="text-sm font-bold text-zinc-200 mt-1.5 break-all leading-tight">
                  {selectedItem.original_filename}
                </h2>
              </div>

              {/* Metadata Attributes */}
              <div className="space-y-3.5 bg-zinc-900/20 border border-zinc-900/60 rounded-xl p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Mime Type
                  </span>
                  <span className="text-zinc-300 font-mono">{selectedItem.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" /> File Size
                  </span>
                  <span className="text-zinc-300 font-semibold">{formatBytes(selectedItem.file_size)}</span>
                </div>
                {selectedItem.duration !== null && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Duration
                    </span>
                    <span className="text-zinc-300 font-semibold font-mono">{selectedItem.duration} seconds</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Uploaded At
                  </span>
                  <span className="text-zinc-300">
                    {new Date(selectedItem.uploaded_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Connected Projects */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
                  Linked Projects ({selectedItem.project_ids?.length || 0})
                </h3>
                {selectedItem.project_ids && selectedItem.project_ids.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItem.project_ids.map((pId) => (
                      <div
                        key={pId}
                        className="flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-lg p-2.5 text-xs transition duration-150"
                      >
                        <Link
                          href={`/editor/${pId}`}
                          className="font-medium text-zinc-300 hover:text-purple-400 flex items-center gap-1 truncate"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{getProjectName(pId)}</span>
                        </Link>
                        <button
                          onClick={() => handleRemoveFromProject(pId, selectedItem.id)}
                          className="text-[10px] font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded border border-red-500/10 hover:border-red-500/20 transition shrink-0"
                        >
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Not associated with any project.</p>
                )}
              </div>

              {/* Delete entirely button */}
              <div className="pt-4 border-t border-zinc-900">
                <Button
                  variant="danger"
                  onClick={() => handleDeleteEntirely(selectedItem.id)}
                  disabled={deletingEntirely}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-5"
                >
                  {deletingEntirely ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete Entirely From Disk
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-zinc-950/40">
            <Volume2 className="h-8 w-8 text-zinc-800 mb-3" />
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Audio Inspector</h4>
            <p className="text-[11px] text-zinc-600 max-w-[200px] mt-1.5 leading-relaxed">
              Select a music track or sound file from the library to inspect metadata and play the content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Force reload trigger comment for HMR.
