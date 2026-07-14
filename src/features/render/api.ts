import api from '@/lib/axios';
import { RenderRequest, RenderResponse } from '@/types/api';

export const renderApi = {
  triggerRender: async (
    projectId: string,
    data: RenderRequest
  ): Promise<RenderResponse> => {
    const res = await api.post<RenderResponse>(
      `/projects/${projectId}/render`,
      data
    );
    return res.data;
  },

  getRenderStatus: async (projectId: string): Promise<RenderResponse> => {
    const res = await api.get<RenderResponse>(
      `/projects/${projectId}/render/status`
    );
    return res.data;
  },

  cancelRender: async (projectId: string): Promise<{ status: string; message: string }> => {
    const res = await api.delete<{ status: string; message: string }>(
      `/projects/${projectId}/render`
    );
    return res.data;
  },
};
