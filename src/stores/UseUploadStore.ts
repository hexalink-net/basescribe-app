import { create } from 'zustand';

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

type FileWithStatus = {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  language: string;
  size: string;
  duration: number;
  error?: string;
}

type UploadStore = {
  uploads: FileWithStatus[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  addUploading: (upload: FileWithStatus) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: FileStatus, error?: string) => void;
  removeAllUploading: () => void;
}

export const useUploadingStore = create<UploadStore>((set) => ({
  uploads: [],
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  addUploading: (upload: FileWithStatus) => set((state) => ({ uploads: [...state.uploads, upload] })),
  updateProgress: (id: string, progress: number) => set((state) => ({
    uploads: state.uploads.map((upload) =>
      upload.id === id ? { ...upload, progress } : upload
    )
  })),
  updateStatus: (id: string, status: FileStatus, error?: string) => set((state) => ({
    uploads: state.uploads.map((upload) =>
      upload.id === id ? { ...upload, status, error } : upload
    )
  })),
  removeAllUploading: () => set(() => ({
    uploads: []
  })) 
}));

type PendingUploadStore = {
  pendingUploads: FileWithStatus[];
  addPendingUpload: (upload: FileWithStatus) => void;
  updateLanguage: (id: string, language: string) => void;
  removePendingUpload: (id: string) => void;
  removeAllPendingUploads: () => void;
}

export const usePendingUploadStore = create<PendingUploadStore>((set) => ({
  pendingUploads: [],
  addPendingUpload: (upload: FileWithStatus) => set((state) => ({ pendingUploads: [...state.pendingUploads, upload] })),
  updateLanguage: (id: string, language: string) => set((state) => ({
    pendingUploads: state.pendingUploads.map((upload) =>
      upload.id === id ? { ...upload, language } : upload
    )
  })),
  removePendingUpload: (id: string) => set((state) => ({
    pendingUploads: state.pendingUploads.filter((upload) => upload.id !== id)
  })),
  removeAllPendingUploads: () => set(() => ({
    pendingUploads: []
  })) 
}));

