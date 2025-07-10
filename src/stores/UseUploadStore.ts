import { create } from 'zustand';

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

type FileWithStatus = {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  language: string;
  duration: number;
  error?: string;
}

type UploadStore = {
  uploads: FileWithStatus[];
  addUpload: (upload: FileWithStatus) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: FileStatus, error?: string) => void;
  updateLanguage: (id: string, language: string) => void;
  removeUpload: (id: string) => void;
  removeAllUploads: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],
  addUpload: (upload: FileWithStatus) => set((state) => ({ uploads: [...state.uploads, upload] })),
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
  updateLanguage: (id: string, language: string) => set((state) => ({
    uploads: state.uploads.map((upload) =>
      upload.id === id ? { ...upload, language } : upload
    )
  })),
  removeUpload: (id: string) => set((state) => ({
    uploads: state.uploads.filter((upload) => upload.id !== id)
  })),
  removeAllUploads: () => set(() => ({
    uploads: []
  })) 
}));
