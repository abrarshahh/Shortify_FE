'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadAudio, useProjectDetails } from '@/features/projects/hooks';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { Music, UploadCloud, Trash2, CheckCircle2, Loader2, Volume2 } from 'lucide-react';
import api from '@/lib/axios';

interface AudioUploaderProps {
  projectId: string;
}

export default function AudioUploader({ projectId }: AudioUploaderProps) {
  const { data: project, refetch } = useProjectDetails(projectId);
  const { mutate: uploadAudio, isPending: isUploading } = useUploadAudio();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  // Find the selected music asset if it is listed in the project media (wait, the project details response contains user linked assets, let's see if we can resolve the music details).
  // Note: the backend returns music_id in project response.
  // In `projects.py` get_project_details, we filter media_assets to NOT start with 'audio/' for 'media' list, so we might need a separate way or just show basic info. Let's see if there is an audio in all media.
  // Wait, let's look at `list_audio` GET /audio. We can query user audio tracks and search if one matches music_id!
  // In get_project_details, `project.media_assets` has the audio, but it gets filtered out of `media` response. Wait, let's look at get_project_details code:
  // "We only show non-audio media in the 'media' list to keep it clean"
  // So yes, the `media` array inside ProjectDetailResponse will NOT contain the audio asset.
  // But we can check `project.music_id`. If `project.music_id` is present, we know music has been uploaded. Let's show a nice Card for selected music. Since we don't have the original filename of that specific audio directly in the `ProjectDetailResponse` unless we fetch `/audio` (which lists all user audios) and match by ID.
  // That's a great idea! Let's fetch `/audio` using `useListUserAudio` and filter for `id === project.music_id` to show the full selected track name!
  const { data: userAudios } = useListUserAudio();
  const selectedMusic = userAudios?.find((a) => a.id === project?.music_id);

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
            <div className="space-y-1 max-w-sm">
              <p className="text-sm font-semibold text-zinc-200">
                {isDragActive ? 'Drop soundtrack here...' : 'Drag & drop background music here, or browse'}
              </p>
              <p className="text-xs text-zinc-500">
                Supports MP3 and WAV files. Single soundtrack per project.
              </p>
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
    </div>
  );
}

// Fetch list of user audios to help lookup
import { useListUserAudio } from '@/features/projects/hooks';
export { useListUserAudio };
