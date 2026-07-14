import { Project, MediaAsset, RenderStatus } from './models';

// Auth API types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  session_id: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  session_id: string;
}

// Project API types
export interface ProjectCreateRequest {
  title: string;
  description: string;
}

export interface ProjectDetailResponse extends Project {
  media: MediaAsset[];
}

// Upload API types
export interface UploadItem {
  id: string;
  path: string;
}

export interface UploadResponse {
  uploaded: UploadItem[];
}

// Render API types
export interface RenderRequest {
  prompt: string;
  output_filename?: string;
  target_duration: 15 | 30 | 60;
  aspect_ratio: '9:16' | '1:1' | '16:9';
  style?: string;
  caption_style?: string; // 'hormozi' | 'clean' | 'none'
  add_subtitle: boolean;
  add_stickers: boolean;
  add_textoverlay: boolean;
}

export interface RenderResponse {
  project_id: string;
  status: RenderStatus;
  message: string;
  final_video_path?: string | null;
  safe_zone_verdict?: string | null;
  progress_percentage?: number;
  current_step?: string;
  skipped_clips?: string[];
}
