import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isAudioOrVideoFile(fileName: string): boolean {
  const supportedFormats = [
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.flac', '.ogg', '.webm', '.m4a'
  ];
  
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return supportedFormats.includes(extension);
}

export const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Create a URL for the file
    const url = URL.createObjectURL(file);
    
    // Create appropriate media element based on file type
    const isVideo = file.type.startsWith('video/');
    const mediaElement = isVideo 
      ? document.createElement('video') 
      : document.createElement('audio');
    
    // Set up event listeners
    mediaElement.addEventListener('loadedmetadata', () => {
      // Get duration in seconds
      const durationSeconds = Math.max(1, Math.round(mediaElement.duration));
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Return the duration in seconds
      resolve(durationSeconds);
    });
    
    mediaElement.addEventListener('error', (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Error getting media duration: ${e.message}`));
    });
    
    // Load the media file
    mediaElement.src = url;
    mediaElement.load();
  });
};
