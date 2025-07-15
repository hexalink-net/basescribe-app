"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadingStore } from "@/stores/UseUploadStore";
import { X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Globe, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";


type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

function getStatusIcon(status: FileStatus) {
    switch (status) {
      case 'uploading': 
        return <RefreshCw className="h-4 w-4 text-gray-200 animate-spin" />;
      case 'success': 
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error': 
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
    return null;
}

export function UploadProgressToast() {
  const { uploads, isSidebarOpen, toggleSidebar, removeAllUploading } = useUploadingStore();
  const [isVisible, setIsVisible] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Show toast when there are uploads
  useEffect(() => {
    if (uploads.length > 0) {
      setIsVisible(true);
    }
  }, [uploads.length]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleSidebar();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, toggleSidebar]);

  const activeUploads = uploads.filter(u => 
    u.status === 'uploading'
  );
  const hasActiveUploads = activeUploads.length > 0;
  const allCompletedOrFailed = uploads.length > 0 && !hasActiveUploads;

  if (!isVisible || uploads.length === 0) return null;

  return (
    <>
      {/* Centered Toast */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-[#2a2a2a] rounded-lg shadow-lg border border-[#2a2a2a] overflow-hidden w-80">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
              {getStatusIcon(
                hasActiveUploads ? 'uploading' : 
                uploads.some(u => u.status === 'error') ? 'error' : 
                allCompletedOrFailed ? 'success' : 'idle'
              )}
              <h3 className="font-medium text-sm text-gray-200">
                {hasActiveUploads 
                  ? `Uploading ${activeUploads.length} file${activeUploads.length > 1 ? 's' : ''}...`
                  : uploads.some(u => u.status === 'error')
                    ? 'Upload completed with errors'
                    : allCompletedOrFailed 
                      ? 'Uploads completed' 
                      : 'Uploads'
                }
              </h3>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={toggleSidebar}
                >
                  {isSidebarOpen ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                {allCompletedOrFailed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      removeAllUploading();
                      setIsVisible(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar with Overlay */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={toggleSidebar}
          />
          <div 
            ref={sidebarRef}
            className={`fixed top-0 right-0 h-full w-96 bg-[#1a1a1a] shadow-2xl border-l border-[#2a2a2a] shadow-[0_0_15px_rgba(255,255,255,0.2)] z-50 transform transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4 h-full flex flex-col text-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upload Progress</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {uploads.map((upload) => (
                  <div 
                    key={upload.id} 
                    className={`p-3 mb-3 grid grid-cols-7`}
                  >
                    <div className="flex justify-between items-center col-span-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-medium truncate">
                            {upload.file.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Language</p>
                          <p className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded">
                            {upload.language}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {upload.status === 'uploading' && (
                            <Progress 
                              value={upload.progress} 
                              className="h-0.5 flex-1 bg-gray-700" 
                              indicatorClassName="bg-[#F0F177]"
                            />
                          )}
                          {upload.status === 'uploading' && (
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                            {upload.progress}%
                          </span>
                          )}
                          {upload.status === 'error' && upload.error && (
                            <p className="text-xs text-red-500 mt-1">Error: {upload.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 mt-5">
                        {upload.status !== 'uploading' && (
                            getStatusIcon(upload.status)
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {allCompletedOrFailed && (
                <Button
                  variant="outline"
                  className="mt-4 hover:bg-[#3a3a3a] cursor-pointer"
                  onClick={() => {
                    removeAllUploading();
                    setIsVisible(false);
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}