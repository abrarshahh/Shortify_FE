import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { renderApi } from './api';

export function useTriggerRender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      renderApi.triggerRender(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['render-status', variables.projectId] });
    },
  });
}

export function useRenderStatus(projectId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['render-status', projectId],
    queryFn: () => renderApi.getRenderStatus(projectId),
    enabled: !!projectId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Continue polling if status is queued or running
      if (!data || data.status === 'queued' || data.status === 'running') {
        return 3000; // poll every 3 seconds
      }
      return false;
    },
  });
}

export function useCancelRender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => renderApi.cancelRender(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['render-status', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
