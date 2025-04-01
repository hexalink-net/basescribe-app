"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, UserProfile } from '@/types/DashboardInterface';
import UploadModal from '@/components/dashboard/UploadModal';
import { CheckCircle2, Clock, FileAudio, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User;
  userProfile: UserProfile;
  uploads: Upload[];
}

export default function DashboardClient({ user, userProfile, uploads }: DashboardClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <>
      {/* Recent Files Section */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Recent Files</h2>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Transcribe
          </Button>
        </div>

        {/* Files table */}
        <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-6">
                  <input type="checkbox" className="rounded bg-[#2a2a2a] border-none" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Uploaded</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Mode</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No files yet. Click "Transcribe" to upload your first file.
                  </td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <tr key={upload.id} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a]">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded bg-[#2a2a2a] border-none" />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/transcription/${upload.id}`} className="text-white hover:underline">
                        {upload.file_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {formatDate(upload.created_at)}, {formatTime(upload.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {upload.duration_minutes}m {upload.duration_minutes === 1 ? '' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FileAudio className="h-5 w-5 text-blue-400 mr-2" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 text-sm">Completed</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        user={user}
        userProfile={userProfile}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
