'use client';

import React from 'react';
import { Film, Image as ImageIcon, Trash2, Clock, FileVideo } from 'lucide-react';
import { MediaAsset } from '@/types/models';
import { Button } from '@/components/ui/button';

interface ClipItemProps {
  asset: MediaAsset;
  onRemove?: (id: string) => void;
  isRemoving?: boolean;
}

export default function ClipItem({ asset, onRemove, isRemoving }: ClipItemProps) {
  const isVideo = asset.mime_type.startsWith('video/');

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 group transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Visual indicator */}
        <div className="h-10 w-10 bg-zinc-900 border border-zinc-850 rounded-lg flex items-center justify-center text-zinc-500 shrink-0">
          {isVideo ? (
            <Film className="h-4.5 w-4.5 text-indigo-400" />
          ) : (
            <ImageIcon className="h-4.5 w-4.5 text-purple-400" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-300 truncate" title={asset.original_filename}>
            {asset.original_filename}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
            <span>{formatSize(asset.file_size)}</span>
            {asset.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {asset.duration}s
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(asset.id)}
          disabled={isRemoving}
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1.5 h-8 w-8 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
export { FileVideo };
