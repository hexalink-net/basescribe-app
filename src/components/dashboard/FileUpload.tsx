"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, validateAudioOrVideoFile, getMediaDuration } from '@/lib/MediaUtils';
import { useToast } from '@/components/ui/UseToast';
import { validateBatchUpload } from '@/app/(protected)/dashboard/actions';
import { pro } from '@/constants/PaddleProduct';

interface FileUploadProps {
  userId: string;
  productId: string | null | undefined;
  onFileSelected: (file: File, language: string, onProgress?: (percentage: number) => void) => Promise<void>;
  maxSizeInBytes: number;
  disabled?: boolean;
  multiple?: boolean;
}

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  language: string;
  error?: string;
}

export function FileUpload({ userId, productId, onFileSelected, maxSizeInBytes, disabled = false, multiple = true }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const totalFilesSizeRef = useRef(0);
  
  // Use a ref to track all active progress intervals for cleanup
  const activeIntervalsRef = useRef<{[id: string]: NodeJS.Timeout}>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: FileWithStatus[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];

    for (const file of acceptedFiles) {
      totalFilesSizeRef.current += file.size;
    }
    
    for (const file of acceptedFiles) {
      const isValid = await validateAudioOrVideoFile(file);
      if (!isValid) {
        invalidFiles.push({ file, reason: 'Invalid file type' });
        totalFilesSizeRef.current -= file.size;
        continue;
      }
      
      if (totalFilesSizeRef.current > maxSizeInBytes) {
        invalidFiles.push({ file, reason: 'File too large' });
        totalFilesSizeRef.current -= file.size;
        continue;
      }
      
      validFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        progress: 0,
        status: 'idle',
        language: 'english' // Default to English
      });
    }
    
    if (invalidFiles.length > 0) {
      const reasons = new Set(invalidFiles.map(f => f.reason));
      let message = '';
      
      if (reasons.has('Invalid file type')) {
        message += 'Some files have invalid types. Please upload audio or video files only (mp3, mp4, wav, etc.). ';
      }
      
      if (reasons.has('File too large')) {
        message += `Some files exceed the maximum size of ${formatFileSize(maxSizeInBytes)}. `;
      }
      
      toast({
        title: "Files couldn't be added",
        description: message,
        variant: "destructive",
      });
    }
    
    if (validFiles.length > 0) {
      // If not multiple, replace existing files
      if (!multiple) {
        setFiles([validFiles[0]]);
      } else {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  }, [maxSizeInBytes, toast, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm']
    },
    maxFiles: multiple ? undefined : 1,
    multiple: multiple,
    disabled: disabled || uploading,
  });
  
  // Cleanup effect for component unmount
  useEffect(() => {
    // Return cleanup function
    return () => {
      // Clear all progress intervals when component unmounts
      Object.values(activeIntervalsRef.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [files]);

  const updateFileProgress = (id: string, progress: number) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, progress } : f
    ));
  };

  const updateFileStatus = (id: string, status: FileStatus, error?: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status, error } : f
    ));
  };

  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    const { file, id, language } = fileWithStatus;
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      updateFileStatus(id, 'uploading');
      
      // Set initial progress to make it visible immediately
      updateFileProgress(id, 5);
      
      // Create a progress callback function that will be passed to onFileSelected
      const handleProgress = (percentage: number) => {
        // Update the file's progress directly with the real percentage
        updateFileProgress(id, percentage);
      };
      
      // As a fallback, still use a slow interval for progress in case real progress isn't working
      // This will be cleared once we get the first real progress update
      progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === id && f.progress < 90) {
            // Smaller increments for smoother appearance
            const increment = 0.5;
            return { ...f, progress: Math.min(f.progress + increment, 90) };
          }
          return f;
        }));
      }, 500);
      
      // Store the interval in our ref for cleanup
      activeIntervalsRef.current[id] = progressInterval;
      
      // Call the parent component's upload function with our progress callback
      await onFileSelected(file, language, handleProgress);
      
      // Clear and remove the interval
      if (progressInterval) {
        clearInterval(progressInterval);
        delete activeIntervalsRef.current[id];
      }
      
      // Ensure we're at 100% at the end
      updateFileProgress(id, 100);
      updateFileStatus(id, 'success');
      
    } catch (error: unknown) {      
      // Clear and remove the interval
      if (progressInterval) {
        clearInterval(progressInterval);
        delete activeIntervalsRef.current[id];
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload';

      const isLimitError = errorMessage.includes('quota exceeded') || 
        errorMessage.includes('Cancelled or past due') || 
        errorMessage.includes('Monthly usage quota');
      
      updateFileStatus(id, 'error', errorMessage);
      
      toast({
        title: isLimitError ? "Transcription Limit Exceeded" : "Upload failed",
        description: isLimitError ? `${file.name}: ${errorMessage}`: `${file.name}: File upload failed either due to file size limit or transcription limit has been reached`,
        variant: "destructive",
      });
    }
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Filter only idle files
      const filesToUpload = files.filter(f => f.status === 'idle');
      
      // Get the duration of each file
      const fileDurations = await Promise.all(
        filesToUpload.map(async (f) => await getMediaDuration(f.file))
      );
      
      // Check if the user has enough transcription limit remaining using server action
      if (productId === pro) {
        const isWithinLimit = await validateBatchUpload(userId, fileDurations);
        
        if (!isWithinLimit) {
            toast({
              title: "Transcription limit exceeded",
              description: "You have reached your monthly transcription limit. Please upgrade your plan for more transcription minutes.",
              variant: "destructive",
            });
            throw new Error(`Transcription limit exceeded.`);
        }
      }
      
      // Start all uploads in parallel
      const uploadPromises = filesToUpload.map(fileWithStatus => 
        uploadFile(fileWithStatus)
      );
      
      await Promise.all(uploadPromises);
    } catch {
      throw new Error("Failed to upload files");
    }finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string, fileSize: number) => {
    // Clear any active interval for this file
    if (activeIntervalsRef.current[id]) {
      clearInterval(activeIntervalsRef.current[id]);
      delete activeIntervalsRef.current[id];
    }

    totalFilesSizeRef.current -= fileSize;
    
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const removeAllFiles = () => {
    // Clear all active intervals
    Object.values(activeIntervalsRef.current).forEach(interval => {
      clearInterval(interval);
    });
    activeIntervalsRef.current = {};
    
    setFiles([]);

    totalFilesSizeRef.current = 0;
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
        } ${files.length > 0 ? 'mb-4' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-lg font-medium">
            {isDragActive 
              ? 'Drop files here' 
              : multiple 
                ? 'Drag & drop your audio or video files here' 
                : 'Drag & drop your audio or video file here'
            }
          </p>
          <p className="text-sm text-gray-400">
            Supported formats: MP3, MP4, WAV, etc. (Max size: {formatFileSize(maxSizeInBytes)})
          </p>
          <Button 
            type="button" 
            className="mt-2 cursor-pointer bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#F0F177] font-medium px-4 py-2 shadow-md transition-all duration-200 ease-in-out hover:shadow-lg flex items-center gap-2 border border-[#2a2a2a]"
            disabled={disabled || uploading}
          >
            Select {multiple ? 'Files' : 'File'}
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="border border-[#2a2a2a] rounded-lg p-4 w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{multiple ? `Files to upload (${files.length})` : 'File to upload'}</h3>
              <div className="flex gap-2">
                {!uploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeAllFiles}
                    className="text-gray-400 hover:text-destructive"
                  >
                    {multiple ? 'Clear All' : 'Clear'}
                  </Button>
                )}
                <Button 
                  onClick={handleUpload} 
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                  disabled={uploading || files.every(f => f.status !== 'idle')}
                >
                  {uploading ? 'Uploading...' : (multiple ? 'Upload All' : 'Upload')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {files.map((fileWithStatus) => (
                <div key={fileWithStatus.id} className="border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${getStatusColor(fileWithStatus.status)}`}>
                        {getStatusIcon(fileWithStatus.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileWithStatus.file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(fileWithStatus.file.size)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400">Language</p>
                          <select 
                            className="bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-gray-300 py-1 px-2"
                            value={fileWithStatus.language}
                            onChange={(e) => {
                              setFiles(prev => prev.map(f => 
                                f.id === fileWithStatus.id ? { ...f, language: e.target.value } : f
                              ));
                            }}
                            disabled={uploading || fileWithStatus.status !== 'idle'}
                          >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="italian">Italian</option>
                            <option value="portuguese">Portuguese</option>
                            <option value="dutch">Dutch</option>
                            <option value="japanese">Japanese</option>
                            <option value="chinese">Chinese</option>
                            <option value="korean">Korean</option>
                            <option value="arabic">Arabic</option>
                            <option value="russian">Russian</option>
                            <option value="hindi">Hindi</option>
                            <option value="indonesian">Indonesian</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {(fileWithStatus.status === 'idle' || fileWithStatus.status === 'error') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileWithStatus.id, fileWithStatus.file.size)}
                        className="text-gray-500 hover:text-destructive cursor-pointer"
                        disabled={uploading}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  
                  {fileWithStatus.status === 'uploading' && (
                    <div className="space-y-1">
                      <Progress value={fileWithStatus.progress} className="h-1" />
                      <p className="text-xs text-right text-gray-400">
                        {fileWithStatus.progress}%
                      </p>
                    </div>
                  )}
                  
                  {fileWithStatus.status === 'error' && fileWithStatus.error && (
                    <p className="text-xs text-destructive mt-1">
                      Error: {fileWithStatus.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: FileStatus): string {
  switch (status) {
    case 'idle': return 'bg-gray-500/10';
    case 'uploading': return 'bg-blue-500/10';
    case 'success': return 'bg-green-500/10';
    case 'error': return 'bg-red-500/10';
  }
}

function getStatusIcon(status: FileStatus) {
  switch (status) {
    case 'idle': 
      return <Upload className="h-5 w-5 text-gray-500" />;
    case 'uploading': 
      return <Upload className="h-5 w-5 text-blue-500" />;
    case 'success': 
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error': 
      return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
}
