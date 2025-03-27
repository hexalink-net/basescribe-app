"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, isAudioOrVideoFile } from '@/lib/utils';
import { useToast } from '@/components/ui/UseToast';

interface FileUploadProps {
  onFileSelected: (file: File) => Promise<void>;
  maxSizeInBytes: number;
}

export function FileUpload({ onFileSelected, maxSizeInBytes }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) return;
    
    if (!isAudioOrVideoFile(selectedFile.name)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio or video file (mp3, mp4, wav, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile.size > maxSizeInBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${formatFileSize(maxSizeInBytes)}`,
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  }, [maxSizeInBytes, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      await onFileSelected(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded and is being processed.",
      });
      
      // Reset after a short delay
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the file here' : 'Drag & drop your audio or video file here'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: MP3, MP4, WAV, etc. (Max size: {formatFileSize(maxSizeInBytes)})
            </p>
            <Button type="button" className="mt-2">
              Select File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-gray-500 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-500">
                {progress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full mt-2">
              Upload File
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
