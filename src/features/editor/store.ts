import { create } from 'zustand';
import { MediaAsset } from '@/types/models';

interface EditorState {
  projectId: string | null;
  mediaItems: MediaAsset[];
  musicItem: MediaAsset | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeTab: 'media' | 'audio' | 'captions' | 'render-settings';
  
  setProjectId: (id: string | null) => void;
  setMediaItems: (items: MediaAsset[]) => void;
  setMusicItem: (music: MediaAsset | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveTab: (tab: 'media' | 'audio' | 'captions' | 'render-settings') => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  projectId: null,
  mediaItems: [],
  musicItem: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  activeTab: 'media',

  setProjectId: (projectId) => set({ projectId }),
  setMediaItems: (mediaItems) => set({ mediaItems }),
  setMusicItem: (musicItem) => set({ musicItem }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetEditor: () =>
    set({
      projectId: null,
      mediaItems: [],
      musicItem: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      activeTab: 'media',
    }),
}));
export default useEditorStore;
