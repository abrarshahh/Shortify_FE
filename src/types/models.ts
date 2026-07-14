export interface User {
  id: string;
  username: string;
  email: string;
}

export type RenderStatus = 'not_started' | 'queued' | 'running' | 'done' | 'error' | 'cancelled' | 'unknown';

export interface Project {
  id: string;
  title: string;
  description: string;
  target_duration?: number | null;
  aspect_ratio?: string | null;
  style?: string | null;
  caption_style?: string | null;
  music_id?: string | null;
  created_at: string;
  render_status: RenderStatus;
  last_output_path?: string | null;
}

export interface MediaAsset {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  thumbnail_path?: string | null;
  uploaded_at: string;
  project_ids: string[];
}
