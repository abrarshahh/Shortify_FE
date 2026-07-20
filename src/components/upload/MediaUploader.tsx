'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadMedia, useProjectDetails, useListUserMedia, useLinkMedia } from '@/features/projects/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { UploadCloud, Film, Image as ImageIcon, Trash2, CheckCircle2, Loader2, Search, X } from 'lucide-react';
import api from '@/lib/axios';

interface MediaUploaderProps {
  projectId: string;
}

export default function MediaUploader({ projectId }: MediaUploaderProps) {
  const { data: project, refetch } = useProjectDetails(projectId);
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { data: userMediaItems } = useListUserMedia();
  const { mutate: linkMedia, isPending: isLinking } = useLinkMedia();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

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
      // Handled by global Axios interceptor
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

  const handleLinkSelected = () => {
    if (selectedLibraryIds.length === 0) return;
    linkMedia({
      projectId,
      mediaIds: selectedLibraryIds
    }, {
      onSuccess: () => {
        toast.success('Media clips linked to project');
        setSelectedLibraryIds([]);
        setIsLibraryModalOpen(false);
        refetch();
      }
    });
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedLibraryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const linkedMedia = project?.media || [];
  const linkedIds = new Set(linkedMedia.map(m => m.id));
  const unlinkedMedia = userMediaItems?.filter(
    (item) => !linkedIds.has(item.id) && item.original_filename?.toLowerCase().includes(librarySearchQuery.toLowerCase())
  ) || [];

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
          <div className="space-y-1 max-w-sm flex flex-col items-center">
            <p className="text-sm font-semibold text-zinc-200">
              {isDragActive ? 'Drop files here...' : 'Drag & drop media here, or browse'}
            </p>
            <p className="text-xs text-zinc-500">
              Supports MP4, MOV, JPG, and PNG videos or photos. Multiple files allowed.
            </p>
            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLibraryModalOpen(true)}
                className="border-zinc-800 hover:bg-zinc-900/85 hover:text-zinc-100 flex items-center gap-2 text-xs font-semibold px-4 py-2"
              >
                <Film className="h-3.5 w-3.5 text-purple-400" />
                Select from Media Library
              </Button>
            </div>
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

      {/* Selection Modal */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Select Media from Library</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose previously uploaded video clips or photos to add to this project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLibraryIds([]);
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
                  placeholder="Search library assets..."
                  value={librarySearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLibrarySearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-900/60 border-zinc-800 focus-visible:ring-purple-500 focus-visible:border-transparent text-xs"
                />
              </div>
            </div>

            {/* Modal Content / Assets Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {unlinkedMedia.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {unlinkedMedia.map((item) => {
                    const isSelected = selectedLibraryIds.includes(item.id);
                    const isVideo = item.mime_type?.startsWith('video/');

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectAsset(item.id)}
                        className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition select-none bg-zinc-900/20 hover:bg-zinc-900/40 ${
                          isSelected
                            ? 'border-purple-500/80 bg-purple-500/5 hover:bg-purple-500/10'
                            : 'border-zinc-900 hover:border-zinc-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="accent-purple-500 h-4 w-4 rounded bg-zinc-950 border-zinc-800 shrink-0"
                        />
                        
                        <div className="h-10 w-10 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center shrink-0">
                          {isVideo ? (
                            <Film className="h-4.5 w-4.5 text-indigo-400" />
                          ) : (
                            <ImageIcon className="h-4.5 w-4.5 text-purple-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-300 truncate">
                            {item.original_filename}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                            {formatSize(item.file_size)}
                            {item.duration && ` • ${item.duration}s`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Film className="h-8 w-8 text-zinc-800 mb-2.5" />
                  <p className="text-xs text-zinc-400 font-medium">No available library media assets found</p>
                  <p className="text-[10px] text-zinc-600 max-w-[240px] mt-1.5 leading-relaxed">
                    Upload assets directly or clear search query to find clips that aren't already linked to this project.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-900 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs text-zinc-500 font-medium">
                {selectedLibraryIds.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setSelectedLibraryIds([]);
                    setIsLibraryModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs border-zinc-800 hover:bg-zinc-900 transition"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={selectedLibraryIds.length === 0 || isLinking}
                  onClick={handleLinkSelected}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Linking...
                    </>
                  ) : (
                    `Link Selected (${selectedLibraryIds.length})`
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
