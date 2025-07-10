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
import { useUploadStore } from '@/stores/UseUploadStore';
import { proDurationLimitNumberInSeconds, freeDurationLimitNumberInSeconds } from '@/constants/PaddleProduct';

interface FileUploadProps {
  userId: string;
  productId: string | null | undefined;
  monthlyUsage: number | undefined;
  onFileSelected: (file: File, language: string, duration: number, onProgress?: (percentage: number) => void) => Promise<void>;
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
  size: string;
  language: string;
  duration: number;
  error?: string;
}

const MAX_FILE_SIZE_PRO_PER_FILE = 1200 * 1000 * 1000;

export function FileUpload({ userId, productId, monthlyUsage, onFileSelected, maxSizeInBytes, disabled = false, multiple = true }: FileUploadProps) {
  const queuedFiles = useUploadStore((state) => state.uploads);
  const { addUpload, updateProgress, updateStatus, updateLanguage, removeUpload, removeAllUploads } = useUploadStore.getState();
  const [uploading, setUploading] = useState(false);
  const totalFilesSizeRef = useRef(0);
  const { toast } = useToast();
  
  // Use a ref to track all active progress intervals for cleanup
  const activeIntervalsRef = useRef<{[id: string]: NodeJS.Timeout}>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: FileWithStatus[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];
    
    for (const file of acceptedFiles) {
      const isValid = await validateAudioOrVideoFile(file);
      
      if (!isValid) {
        invalidFiles.push({ file, reason: 'Invalid file type' });
        continue;
      }

      if (file.size > MAX_FILE_SIZE_PRO_PER_FILE) {
        invalidFiles.push({ file, reason: 'File too large. No more than 1 GB' });
        continue;
      }
      
      if (totalFilesSizeRef.current + file.size > maxSizeInBytes) {
        invalidFiles.push({ file, reason: 'Total file trying to upload is too large. No more than 5 GB' });
        continue;
      }

      let durationSeconds = await getMediaDuration(file);
      if (durationSeconds === null) {
        durationSeconds = Math.max(1, Math.round((file.size / (128 * 1024 / 8 * 60))));
      }

      if (monthlyUsage !== undefined) {
        let durationLimitNumberInSeconds = productId === pro ? proDurationLimitNumberInSeconds : freeDurationLimitNumberInSeconds;
        if (durationSeconds + monthlyUsage > durationLimitNumberInSeconds) {
          invalidFiles.push({ file, reason: 'You exceeded your monthly transcription limit' });
          continue;
        }
      } else {
        invalidFiles.push({ file, reason: 'You exceeded your monthly transcription limit' });
        continue;
      }
      
      if (totalFilesSizeRef.current + file.size < maxSizeInBytes) { 
        validFiles.push({
            file,
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            progress: 0,
            status: 'idle',
            language: 'english', // Default to English
            size: formatFileSize(file.size),
            duration: durationSeconds,
        });
        totalFilesSizeRef.current += file.size;
      }
    }
    
    if (invalidFiles.length > 0) {
      const reasons = new Set(invalidFiles.map(f => f.reason));
      let message = '';
      
      if (reasons.has('Invalid file type')) {
        message += 'Some files have invalid types. Please upload audio or video files only (mp3, mp4, wav, etc.). ';
      }

      if (reasons.has('File too large. No more than 1 GB')) {
        message += `Some files exceed the maximum size of ${formatFileSize(MAX_FILE_SIZE_PRO_PER_FILE)}. `;
      }
      
      if (reasons.has('Total file trying to upload is too large. No more than 5 GB')) {
        message += `Total amount of files trying to upload exceed the maximum size of ${formatFileSize(maxSizeInBytes)}. `;
      }

      if (reasons.has('You exceeded your monthly transcription limit')) {
        message += 'You have reached your monthly transcription limit. Please upgrade your plan for more transcription minutes. ';
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
        removeAllUploads();
        addUpload(validFiles[0]);
      } else {
        for (const file of validFiles) {
          addUpload(file);
        }
      }
    }
  }, [maxSizeInBytes, toast, multiple, addUpload, removeAllUploads]);

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
  }, [queuedFiles]);

  const updateFileProgress = (id: string, progress: number) => {
    updateProgress(id, progress);
  };

  const updateFileStatus = (id: string, status: FileStatus, error?: string) => {
    updateStatus(id, status, error);
  };

  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    const { file, id, language, duration } = fileWithStatus;
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
        queuedFiles.map(f => {
          if (f.id === id && f.progress < 90) {
            // Smaller increments for smoother appearance
            const increment = 0.5;
            updateFileProgress(id, Math.min(f.progress + increment, 90));
          }
        });
      }, 500);
      
      // Store the interval in our ref for cleanup
      activeIntervalsRef.current[id] = progressInterval;
      
      // Call the parent component's upload function with our progress callback
      await onFileSelected(file, language, duration, handleProgress);
      
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
      
      if (isLimitError) {
        updateFileStatus(id, 'error', errorMessage);
      } else {
        updateFileStatus(id, 'error', 'File upload failed either due to file size limit or transcription limit has been reached');
      }
    }
  };
  
  const handleUpload = async () => {
    if (queuedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      // Filter only idle files
      const filesToUpload = queuedFiles.filter(f => f.status === 'idle');
      
      // Get the duration of each file
      const fileDurations = await Promise.all(
        filesToUpload.map(async (f) => await getMediaDuration(f.file))
      );
      
      // Check if the user has enough transcription limit remaining using server action
      if (productId === pro) {
        const isWithinLimit = await validateBatchUpload(userId, fileDurations);
        
        if (!isWithinLimit) {
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
    
    removeUpload(id);
  };
  
  const removeAllFiles = () => {
    // Clear all active intervals
    Object.values(activeIntervalsRef.current).forEach(interval => {
      clearInterval(interval);
    });
    activeIntervalsRef.current = {};
    
    removeAllUploads();

    totalFilesSizeRef.current = 0;
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
        } ${queuedFiles.length > 0 ? 'mb-4' : ''}`}
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

      {queuedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="border border-[#2a2a2a] rounded-lg p-4 w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{multiple ? `Files to transcribe (${queuedFiles.length})` : 'File to transcribe'}</h3>
              <div className="flex gap-2">
                {!uploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeAllFiles}
                    className="text-gray-400 hover:text-destructive cursor-pointer"
                  >
                    {multiple ? 'Clear All' : 'Clear'}
                  </Button>
                )}
                <Button 
                  onClick={handleUpload} 
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                  disabled={uploading || queuedFiles.every(f => f.status !== 'idle')}
                >
                  {uploading ? 'Uploading...' : (multiple ? 'Transcribe All' : 'Transcribe')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {queuedFiles.map((fileWithStatus) => (
                <div key={fileWithStatus.id} className="border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${getStatusColor(fileWithStatus.status)}`}>
                        {getStatusIcon(fileWithStatus.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileWithStatus.file.name}</p>
                        <p className="text-sm text-gray-400">{fileWithStatus.size}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400">Language</p>
                          <select 
                            className="bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-gray-300 py-1 px-2"
                            value={fileWithStatus.language}
                            onChange={(e) => {
                              updateLanguage(fileWithStatus.id, e.target.value);
                            }}
                            disabled={uploading || fileWithStatus.status !== 'idle'}
                          >
                          <optgroup label="-- High Accuracy Languages --">
                            <option value="arabic">🇸🇦 Arabic</option>
                            <option value="catalan">🇪🇸 Catalan</option>
                            <option value="czech">🇨🇿 Czech</option>
                            <option value="dutch">🇳🇱 Dutch</option>
                            <option value="english">🇺🇸 English</option>
                            <option value="french">🇫🇷 French</option>
                            <option value="german">🇩🇪 German</option>
                            <option value="indonesian">🇮🇩 Indonesian</option>
                            <option value="italian">🇮🇹 Italian</option>
                            <option value="japanese">🇯🇵 Japanese</option>
                            <option value="korean">🇰🇷 Korean</option>
                            <option value="malay">🇲🇾 Malay</option>
                            <option value="polish">🇵🇱 Polish</option>
                            <option value="portuguese">🇵🇹 Portuguese</option>
                            <option value="romanian">🇷🇴 Romanian</option>
                            <option value="russian">🇷🇺 Russian</option>
                            <option value="spanish">🇪🇸 Spanish</option>
                            <option value="swedish">🇸🇪 Swedish</option>
                            <option value="thai">🇹🇭 Thai</option>
                            <option value="turkish">🇹🇷 Turkish</option>
                            <option value="ukrainian">🇺🇦 Ukrainian</option>
                          </optgroup>
                          <optgroup label="-- Other Languages --">
                            <option value="afrikaans">🇿🇦 Afrikaans</option>
                            <option value="albanian">🇦🇱 Albanian</option>
                            <option value="amharic">🇪🇹 Amharic</option>
                            <option value="armenian">🇦🇲 Armenian</option>
                            <option value="assamese">🇮🇳 Assamese</option>
                            <option value="azerbaijani">🇦🇿 Azerbaijani</option>
                            <option value="bashkir">🇷🇺 Bashkir</option>
                            <option value="basque">🇪🇸 Basque</option>
                            <option value="belarusian">🇧🇾 Belarusian</option>
                            <option value="bengali">🇧🇩 Bengali</option>
                            <option value="bosnian">🇧🇦 Bosnian</option>
                            <option value="breton">🇫🇷 Breton</option>
                            <option value="bulgarian">🇧🇬 Bulgarian</option>
                            <option value="cantonese">🇭🇰 Cantonese</option>
                            <option value="chinese">🇨🇳 Chinese</option>
                            <option value="croatian">🇭🇷 Croatian</option>
                            <option value="danish">🇩🇰 Danish</option>
                            <option value="estonian">🇪🇪 Estonian</option>
                            <option value="faroese">🇫🇴 Faroese</option>
                            <option value="finnish">🇫🇮 Finnish</option>
                            <option value="georgian">🇬🇪 Georgian</option>
                            <option value="greek">🇬🇷 Greek</option>
                            <option value="gujarati">🇮🇳 Gujarati</option>
                            <option value="haitian creole">🇭🇹 Haitian Creole</option>
                            <option value="hausa">🇳🇬 Hausa</option>
                            <option value="hawaiian">🇺🇸 Hawaiian</option>
                            <option value="hebrew">🇮🇱 Hebrew</option>
                            <option value="hindi">🇮🇳 Hindi</option>
                            <option value="hungarian">🇭🇺 Hungarian</option>
                            <option value="icelandic">🇮🇸 Icelandic</option>
                            <option value="kazakh">🇰🇿 Kazakh</option>
                            <option value="khmer">🇰🇭 Khmer</option>
                            <option value="lao">🇱🇦 Lao</option>
                            <option value="latin">🇻🇦 Latin</option>
                            <option value="latvian">🇱🇻 Latvian</option>
                            <option value="lithuanian">🇱🇹 Lithuanian</option>
                            <option value="luxembourgish">🇱🇺 Luxembourgish</option>
                            <option value="macedonian">🇲🇰 Macedonian</option>
                            <option value="malagasy">🇲🇬 Malagasy</option>
                            <option value="malayalam">🇮🇳 Malayalam</option>
                            <option value="maltese">🇲🇹 Maltese</option>
                            <option value="maori">🇳🇿 Maori</option>
                            <option value="marathi">🇮🇳 Marathi</option>
                            <option value="mongolian">🇲🇳 Mongolian</option>
                            <option value="myanmar">🇲🇲 Myanmar</option>
                            <option value="nepali">🇳🇵 Nepali</option>
                            <option value="norwegian">🇳🇴 Norwegian</option>
                            <option value="occitan">🇫🇷 Occitan</option>
                            <option value="pashto">🇦🇫 Pashto</option>
                            <option value="persian">🇮🇷 Persian</option>
                            <option value="punjabi">🇮🇳 Punjabi</option>
                            <option value="sanskrit">🇮🇳 Sanskrit</option>
                            <option value="serbian">🇷🇸 Serbian</option>
                            <option value="sindhi">🇮🇳 Sindhi</option>
                            <option value="sinhala">🇱🇰 Sinhala</option>
                            <option value="slovak">🇸🇰 Slovak</option>
                            <option value="slovenian">🇸🇮 Slovenian</option>
                            <option value="somali">🇸🇴 Somali</option>
                            <option value="swahili">🇰🇪 Swahili</option>
                            <option value="tagalog">🇵🇭 Tagalog</option>
                            <option value="tamil">🇮🇳 Tamil</option>
                            <option value="tatar">🇷🇺 Tatar</option>
                            <option value="telugu">🇮🇳 Telugu</option>
                            <option value="tibetan">🇨🇳 Tibetan</option>
                            <option value="turkmen">🇹🇷 Turkmen</option>
                            <option value="urdu">🇵🇰 Urdu</option>
                            <option value="uzbek">🇺🇿 Uzbek</option>
                            <option value="vietnamese">🇻🇳 Vietnamese</option>
                            <option value="welsh">🏴 Welsh</option>
                            <option value="yiddish">🇮🇱 Yiddish</option>
                            <option value="yoruba">🇳🇬 Yoruba</option>
                          </optgroup>
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
