import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, ListProjectsParams, ListMediaParams, ProjectUpdateRequest } from './api';
import { ProjectCreateRequest } from '@/types/api';

export function useProjects(params?: ListProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.listProjects(params),
    refetchInterval: (query) => {
      // If any project is rendering, poll lists a bit faster
      const projects = query.state.data;
      if (projects && projects.some((p) => p.render_status === 'running' || p.render_status === 'queued')) {
        return 5000;
      }
      return false;
    },
  });
}

export function useProjectDetails(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProjectDetails(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectUpdateRequest }) =>
      projectsApi.updateProject(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProjectHard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.deleteProjectHard(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProjectSoft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.deleteProjectSoft(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProjectCache() {
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.deleteProjectCache(projectId),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      files,
      onProgress,
    }: {
      projectId: string;
      files: File[];
      onProgress?: (progress: number) => void;
    }) => projectsApi.uploadMedia(projectId, files, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
    },
  });
}

export function useUploadAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      files,
      onProgress,
    }: {
      projectId: string;
      files: File[];
      onProgress?: (progress: number) => void;
    }) => projectsApi.uploadAudio(projectId, files, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-audio'] });
    },
  });
}

export function useListUserMedia(params?: ListMediaParams) {
  return useQuery({
    queryKey: ['user-media', params],
    queryFn: () => projectsApi.listUserMedia(params),
  });
}

export function useListUserAudio(params?: ListMediaParams) {
  return useQuery({
    queryKey: ['user-audio', params],
    queryFn: () => projectsApi.listUserAudio(params),
  });
}

export function useRemoveMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, mediaId }: { projectId: string; mediaId: string }) =>
      projectsApi.removeMedia(projectId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
    },
  });
}

export function useRemoveAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, audioId }: { projectId: string; audioId: string }) =>
      projectsApi.removeAudio(projectId, audioId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-audio'] });
    },
  });
}

export function useDeleteMediaEntirely() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => projectsApi.deleteMediaEntirely(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteAudioEntirely() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audioId: string) => projectsApi.deleteAudioEntirely(audioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-audio'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUploadMediaToLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (progress: number) => void }) =>
      projectsApi.uploadMediaToLibrary(files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
    },
  });
}

export function useUploadAudioToLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (progress: number) => void }) =>
      projectsApi.uploadAudioToLibrary(files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-audio'] });
    },
  });
}

export function useLinkMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, mediaIds }: { projectId: string; mediaIds: string[] }) =>
      projectsApi.linkMedia(projectId, mediaIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-media'] });
    },
  });
}

export function useLinkAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, audioId }: { projectId: string; audioId: string }) =>
      projectsApi.linkAudio(projectId, audioId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-audio'] });
    },
  });
}

// Force reload trigger comment for Turbopack compilation caching issues.
