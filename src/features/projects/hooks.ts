import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './api';
import { ProjectCreateRequest } from '@/types/api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.listProjects(),
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

export function useListUserMedia() {
  return useQuery({
    queryKey: ['user-media'],
    queryFn: () => projectsApi.listUserMedia(),
  });
}

export function useListUserAudio() {
  return useQuery({
    queryKey: ['user-audio'],
    queryFn: () => projectsApi.listUserAudio(),
  });
}
