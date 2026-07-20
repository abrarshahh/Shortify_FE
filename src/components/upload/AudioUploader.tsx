'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadAudio, useProjectDetails, useListUserAudio, useLinkAudio } from '@/features/projects/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { Music, UploadCloud, Trash2, CheckCircle2, Loader2, Volume2, Search, X } from 'lucide-react';
import api from '@/lib/axios';

interface AudioUploaderProps {
  projectId: string;
}

export default function AudioUploader({ projectId }: AudioUploaderProps) {
  const { data: project, refetch } = useProjectDetails(projectId);
  const { mutate: uploadAudio, isPending: isUploading } = useUploadAudio();
  const { data: userAudios } = useListUserAudio();
  const { mutate: linkAudio, isPending: isLinking } = useLinkAudio();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Only allow uploading 1 background music track at a time
      uploadAudio(
        {
          projectId,
          files: [acceptedFiles[0]],
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        },
        {
          onSuccess: () => {
            toast.success('Soundtrack uploaded and selected for project');
            setUploadProgress(0);
            refetch();
          },
          onError: () => {
            setUploadProgress(0);
          },
        }
      );
    },
    [projectId, uploadAudio, refetch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleDeleteAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project?.music_id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/audio/project/${projectId}/${project.music_id}`);
      toast.success('Soundtrack removed from project');
      refetch();
    } catch (err) {
      // Handled by Axios global interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleLinkSelected = () => {
    if (!selectedLibraryId) return;
    linkAudio({
      projectId,
      audioId: selectedLibraryId
    }, {
      onSuccess: () => {
        toast.success('Soundtrack linked to project');
        setSelectedLibraryId(null);
        setIsLibraryModalOpen(false);
        refetch();
      }
    });
  };

  const selectedMusic = userAudios?.find((a) => a.id === project?.music_id);
  const unlinkedAudio = userAudios?.filter(
    (item) => item.id !== project?.music_id && item.original_filename?.toLowerCase().includes(librarySearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Drag & drop upload area */}
      {!project?.music_id && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
            isDragActive
              ? 'border-purple-500 bg-purple-500/5'
              : isUploading
              ? 'border-zinc-800 bg-zinc-950/20 cursor-not-allowed'
              : 'border-zinc-800 hover:border-zinc-700/80 bg-zinc-950/40 hover:bg-zinc-950/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 rounded-full mb-4 shadow-inner">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          {isUploading ? (
            <div className="w-full max-w-xs space-y-2">
              <p className="text-sm font-semibold text-zinc-300">Uploading audio track...</p>
              <Progress value={uploadProgress} showPercent size="sm" />
            </div>
          ) : (
            <div className="space-y-1 max-w-sm flex flex-col items-center">
            <p className="text-sm font-semibold text-zinc-200">
              {isDragActive ? 'Drop soundtrack here...' : 'Drag & drop background music here, or browse'}
            </p>
            <p className="text-xs text-zinc-500">
              Supports MP3 and WAV files. Single soundtrack per project.
            </p>
            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLibraryModalOpen(true)}
                className="border-zinc-800 hover:bg-zinc-900/85 hover:text-zinc-100 flex items-center gap-2 text-xs font-semibold px-4 py-2"
              >
                <Music className="h-3.5 w-3.5 text-purple-400" />
                Select from Audio Library
              </Button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Selected background music display */}
      {project?.music_id && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Selected Soundtrack
          </h4>
          <div className="bg-gradient-to-r from-zinc-900 to-indigo-950/20 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between group relative overflow-hidden">
            <div className="flex gap-4 items-center min-w-0">
              <div className="h-12 w-12 bg-purple-600/10 border border-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                <Music className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-200 truncate">
                  {selectedMusic?.original_filename || 'Soundtrack Selected'}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-1 font-mono">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>
                    {selectedMusic?.file_size ? formatSize(selectedMusic.file_size) : 'Ready for rendering'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-emerald-500 flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAudio}
                disabled={isDeleting}
                className="border-zinc-800 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Modal */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Select Soundtrack from Library</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose a previously uploaded background music track or sound effect for this project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLibraryId(null);
                  setIsLibraryModalOpen(false);
                }}
                className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950/40">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search library soundtracks..."
                  value={librarySearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLibrarySearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-900/60 border-zinc-800 focus-visible:ring-purple-500 focus-visible:border-transparent text-xs"
                />
              </div>
            </div>

            {/* Modal Content / Assets Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {unlinkedAudio.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {unlinkedAudio.map((item) => {
                    const isSelected = selectedLibraryId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedLibraryId(isSelected ? null : item.id)}
                        className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition select-none bg-zinc-900/20 hover:bg-zinc-900/40 ${
                          isSelected
                            ? 'border-purple-500/80 bg-purple-500/5 hover:bg-purple-500/10'
                            : 'border-zinc-900 hover:border-zinc-850'
                        }`}
                      >
                        <input
                          type="radio"
                          name="library-audio"
                          checked={isSelected}
                          readOnly
                          className="accent-purple-500 h-4 w-4 rounded-full bg-zinc-950 border-zinc-800 shrink-0"
                        />
                        
                        <div className="h-10 w-10 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center shrink-0">
                          <Music className="h-4.5 w-4.5 text-purple-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-300 truncate">
                            {item.original_filename}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                            {formatSize(item.file_size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Music className="h-8 w-8 text-zinc-800 mb-2.5" />
                  <p className="text-xs text-zinc-400 font-medium">No available library soundtracks found</p>
                  <p className="text-[10px] text-zinc-600 max-w-[240px] mt-1.5 leading-relaxed">
                    Upload audio files directly or clear search query to find music tracks that aren't already set on this project.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-900 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs text-zinc-500 font-medium">
                {selectedLibraryId ? '1 soundtrack selected' : 'No soundtrack selected'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setSelectedLibraryId(null);
                    setIsLibraryModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs border-zinc-800 hover:bg-zinc-900 transition"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!selectedLibraryId || isLinking}
                  onClick={handleLinkSelected}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Linking...
                    </>
                  ) : (
                    'Link Soundtrack'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
