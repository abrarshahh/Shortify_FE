'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadMedia, useProjectDetails } from '@/features/projects/hooks';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { UploadCloud, Film, Image as ImageIcon, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface MediaUploaderProps {
  projectId: string;
}

export default function MediaUploader({ projectId }: MediaUploaderProps) {
  const { data: project, refetch } = useProjectDetails(projectId);
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      uploadMedia(
        {
          projectId,
          files: acceptedFiles,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        },
        {
          onSuccess: () => {
            toast.success('Media files uploaded successfully');
            setUploadProgress(0);
            refetch();
          },
          onError: () => {
            setUploadProgress(0);
          },
        }
      );
    },
    [projectId, uploadMedia, refetch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov'],
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    disabled: isUploading,
  });

  const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(mediaId);
    try {
      await api.delete(`/media/project/${projectId}/${mediaId}`);
      toast.success('Asset removed from project');
      refetch();
    } catch (err) {
      // Axios interceptor handles toast error
    } finally {
      setIsDeleting(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const linkedMedia = project?.media || [];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

  return (
    <div className="space-y-6">
      {/* Drag & drop upload area */}
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
        <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 rounded-full mb-4 shadow-inner group-hover:text-zinc-200 transition-colors">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        {isUploading ? (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-sm font-semibold text-zinc-300">Uploading media clips...</p>
            <Progress value={uploadProgress} showPercent size="sm" />
          </div>
        ) : (
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-zinc-200">
              {isDragActive ? 'Drop files here...' : 'Drag & drop media here, or browse'}
            </p>
            <p className="text-xs text-zinc-500">
              Supports MP4, MOV, JPG, and PNG videos or photos. Multiple files allowed.
            </p>
          </div>
        )}
      </div>

      {/* Uploaded media list */}
      {linkedMedia.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Uploaded Clips ({linkedMedia.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {linkedMedia.map((asset) => {
              const isVideo = asset.mime_type.startsWith('video/');
              return (
                <div
                  key={asset.id}
                  className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 flex gap-3 items-center group relative overflow-hidden"
                >
                  {/* Thumbnail indicator */}
                  <div className="h-12 w-12 bg-zinc-900 border border-zinc-850 rounded-lg shrink-0 flex items-center justify-center text-zinc-500 overflow-hidden">
                    {isVideo ? (
                      <Film className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-purple-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-300 truncate" title={asset.original_filename}>
                      {asset.original_filename}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {formatSize(asset.file_size)}
                      {asset.duration && ` • ${asset.duration}s`}
                    </p>
                  </div>

                  {/* Complete Check */}
                  <div className="text-emerald-500/80 mr-2 group-hover:opacity-0 transition-opacity">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>

                  {/* Hover Delete Action */}
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 pl-2 rounded">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteMedia(asset.id, e)}
                      disabled={isDeleting === asset.id}
                      className="text-zinc-500 hover:text-red-400 p-1.5 h-8 w-8 hover:bg-red-500/10"
                    >
                      {isDeleting === asset.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
