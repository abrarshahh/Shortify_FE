'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects, useDeleteProjectHard } from '@/features/projects/hooks';
import { useCancelRender } from '@/features/render/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import {
  Video,
  Plus,
  Search,
  Trash2,
  Play,
  Film,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCcw,
  XCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: projects, isLoading, refetch, isRefetching } = useProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectHard();
  const { mutate: cancelRender } = useCancelRender();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to permanently delete this project and all its uploaded files?')) {
      deleteProject(id, {
        onSuccess: () => {
          toast.success('Project deleted successfully');
        },
      });
    }
  };

  const handleCancel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Cancel this rendering pipeline?')) {
      cancelRender(id, {
        onSuccess: () => {
          toast.success('Rendering cancelled');
        },
      });
    }
  };

  const filteredProjects = projects?.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Rendering
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="h-3 w-3" /> Queued
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Play className="h-3 w-3 fill-current" /> Completed
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            Draft
          </span>
        );
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Your Projects</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage and edit your autonomous video projects</p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="border-zinc-800 hover:bg-zinc-800 text-zinc-400"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900/40 border-zinc-800 focus:border-zinc-700 text-zinc-200"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-80 animate-pulse border-zinc-800 bg-zinc-900/20">
              <CardContent className="h-full flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="h-32 bg-zinc-800/50 rounded-xl" />
                  <div className="h-5 bg-zinc-800/50 rounded w-2/3" />
                  <div className="h-4 bg-zinc-800/50 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects?.length === 0 ? (
        /* Empty State */
        <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-8">
          <div className="bg-gradient-to-tr from-purple-600/10 to-indigo-600/10 p-5 rounded-2xl border border-purple-500/10 text-purple-400 mb-6">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-200">No projects found</h3>
          <p className="text-zinc-400 text-sm mt-2 max-w-sm">
            {searchQuery ? "No matches found for your search query." : "Initialize your first AI project and upload video clips to begin editing automatically."}
          </p>
          <div className="mt-8 flex gap-3">
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="border-zinc-800">
                Clear Search
              </Button>
            ) : (
              <Link href="/create">
                <Button>Create Your First Project</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => {
            const thumbnailSrc = `${API_URL}/storage/exports/${project.id}/thumbnail.jpg`;
            const hasThumbnail = project.render_status === 'done';

            return (
              <Card
                key={project.id}
                onClick={() => router.push(`/editor/${project.id}`)}
                className="group cursor-pointer hover:border-zinc-700/80 transition-all duration-200 bg-zinc-900/40 hover:bg-zinc-900/60 shadow-md flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Thumbnail / Status Panel */}
                  <div className="h-44 bg-zinc-950/80 relative flex items-center justify-center border-b border-zinc-800/40 group-hover:bg-zinc-950 transition-colors">
                    {hasThumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbnailSrc}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        onError={(e) => {
                          // Hide broken thumbnail image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 text-zinc-600 group-hover:text-zinc-500 transition-colors">
                        <Video className="h-9 w-9" />
                        <span className="text-[10px] uppercase font-mono tracking-widest font-semibold">No Output Video</span>
                      </div>
                    )}

                    {/* Status Badge overlay */}
                    <div className="absolute top-3 left-3">{getStatusBadge(project.render_status)}</div>

                    {/* Action button overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5 shadow-xl">
                        Open Workspace <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-md font-bold text-zinc-100 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {project.title || 'Untitled Project'}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 min-h-[2rem]">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-medium">
                      {project.target_duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{project.target_duration}s</span>
                        </div>
                      )}
                      {project.aspect_ratio && (
                        <div className="flex items-center gap-1">
                          <Film className="h-3.5 w-3.5" />
                          <span>{project.aspect_ratio}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3.5 border-t border-zinc-800/40 bg-zinc-950/20 flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-zinc-500 font-mono">
                    ID: {project.id.substring(0, 8)}
                  </div>
                  <div className="flex gap-1.5">
                    {/* If rendering, allow cancelling */}
                    {(project.render_status === 'running' || project.render_status === 'queued') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleCancel(project.id, e)}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 h-8"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(project.id, e)}
                      disabled={isDeleting}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
