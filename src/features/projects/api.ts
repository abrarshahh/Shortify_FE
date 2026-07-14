import api from '@/lib/axios';
import { Project, MediaAsset } from '@/types/models';
import {
  ProjectCreateRequest,
  ProjectDetailResponse,
  UploadResponse,
} from '@/types/api';

export const projectsApi = {
  listProjects: async (): Promise<Project[]> => {
    const res = await api.get<Project[]>('/projects');
    return res.data;
  },

  createProject: async (data: ProjectCreateRequest): Promise<Project> => {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },

  getProjectDetails: async (projectId: string): Promise<ProjectDetailResponse> => {
    const res = await api.get<ProjectDetailResponse>(`/projects/${projectId}`);
    return res.data;
  },

  deleteProjectSoft: async (projectId: string): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/projects/${projectId}`);
    return res.data;
  },

  deleteProjectHard: async (projectId: string): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/projects/${projectId}/hard`);
    return res.data;
  },

  deleteProjectCache: async (projectId: string): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/projects/${projectId}/cache`);
    return res.data;
  },

  uploadMedia: async (
    projectId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post<UploadResponse>(
      `/media/project/${projectId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return res.data;
  },

  uploadAudio: async (
    projectId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post<UploadResponse>(
      `/audio/project/${projectId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return res.data;
  },

  listUserMedia: async (): Promise<MediaAsset[]> => {
    const res = await api.get<MediaAsset[]>('/media');
    return res.data;
  },

  listUserAudio: async (): Promise<MediaAsset[]> => {
    const res = await api.get<MediaAsset[]>('/audio');
    return res.data;
  },

  linkMedia: async (
    projectId: string,
    mediaIds: string[]
  ): Promise<UploadResponse> => {
    const res = await api.post<UploadResponse>(
      `/media/project/${projectId}/link`,
      { media_ids: mediaIds }
    );
    return res.data;
  },

  linkAudio: async (projectId: string, audioId: string): Promise<UploadResponse> => {
    const res = await api.post<UploadResponse>(
      `/audio/project/${projectId}/link`,
      { audio_id: audioId }
    );
    return res.data;
  },

  removeMedia: async (
    projectId: string,
    mediaId: string
  ): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(
      `/media/project/${projectId}/${mediaId}`
    );
    return res.data;
  },

  removeAudio: async (
    projectId: string,
    audioId: string
  ): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(
      `/audio/project/${projectId}/${audioId}`
    );
    return res.data;
  },
};
