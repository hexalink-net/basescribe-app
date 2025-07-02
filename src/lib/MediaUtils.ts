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
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
}

export async function validateAudioOrVideoFile(file: File): Promise<boolean> {
  const supportedExtensions = ['.mp3', '.mp4', '.wav', '.avi', '.mov', '.flac', '.ogg', '.webm', '.m4a'];
  const supportedMimeTypes = [
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a',
    'audio/flac', 'audio/ogg', 'video/mp4', 'video/x-msvideo',
    'video/quicktime', 'video/webm', 'video/ogg'
  ];

  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const isExtensionValid = supportedExtensions.includes(extension);
  const isMimeTypeValid = supportedMimeTypes.includes(file.type);

  if (!isExtensionValid && !isMimeTypeValid) return false;

  const duration = await getMediaDuration(file);
  if (!duration || isNaN(duration)) return false;

  const fileSizeMB = file.size / (1024 * 1024); // convert bytes to MB

  // Basic sanity: avoid files that are like 500MB for 2 seconds
  const averageBitrate = fileSizeMB / duration; // MB per second
  const maxReasonableBitrate = 10; // e.g., 10 MB/s max allowed

  if (averageBitrate > maxReasonableBitrate) {
    console.warn(`Suspicious bitrate: ${averageBitrate} MB/s`);
    return false;
  }

  return true;
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
      reject(new Error(`Error getting media duration: ${e}`));
    });
    
    // Load the media file
    mediaElement.src = url;
    mediaElement.load();
  });
};