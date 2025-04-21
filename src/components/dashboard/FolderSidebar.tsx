"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderIcon, FolderPlus, ChevronRight, Pencil, Trash2, ArrowRight, MoreVertical } from 'lucide-react';
import { Folder, UserProfile } from '@/types/DashboardInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { createFolder } from '@/app/(protected)/dashboard/folder/actions';
import { useToast } from '@/components/ui/UseToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { pro } from '@/constants/PaddleProduct';

interface FolderSidebarProps {
  folders: Folder[];
  currentFolder: Folder | null;
  userProfile: UserProfile;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onMoveFolder: (folder: Folder) => void;
}

// Format seconds to minutes:seconds format
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function FolderSidebar({
  folders,
  currentFolder,
  userProfile,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder
}: FolderSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  // Handle create folder at root level
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Always create at root level (null parent_id)
      const result = await createFolder(newFolderName, null);
      
      if (result.success && result) {
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
        
        // Navigate to the newly created folder
        router.push(`/dashboard/folder/${result.data}`);
        router.refresh();
        toast({
          title: "Folder created",
          description: "The folder has been successfully created.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create folder.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the folder.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-64 border-r border-[#2a2a2a] flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="p-4">
          <Link href="/dashboard" className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${!currentFolder ? 'bg-[#2a2a2a]' : ''}`}>
            <FolderIcon className="h-4 w-4" />
            <span>All Files</span>
          </Link>
        </div>
        
        {/* Folder Header */}
        <div className="px-4 pt-4 pb-1 border-t border-[#2a2a2a]">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-400">Folders</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 cursor-pointer" 
                onClick={() => {
                  // Open the folder creation dialog
                  setIsNewFolderModalOpen(true);
                }}
                title="Create a new folder in the root directory"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Folder List - with max height to ensure scrolling */}
      <div className="overflow-y-auto flex-grow px-4 pt-2 max-h-[calc(100vh-270px)]">
        <div className="space-y-1">
          
          {/* Root folders */}
          {folders
            .filter(folder => folder.parent_id === null)
            .map(rootFolder => {
              // Check if this folder has any subfolders
              const hasSubfolders = folders.some(f => f.parent_id === rootFolder.id);
              const isExpanded = expandedFolders[rootFolder.id] || false;
              
              return (
                <div key={rootFolder.id} className="space-y-0.5">
                  <div className="flex items-center">
                    {hasSubfolders ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 mr-1" 
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedFolders(prev => ({
                            ...prev,
                            [rootFolder.id]: !prev[rootFolder.id]
                          }));
                        }}
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </motion.div>
                      </Button>
                    ) : (
                      <div className="w-6 mr-1" /> // Spacer for alignment
                    )}
                    <div className="flex items-center flex-grow group relative">
                      <Link 
                        href={`/dashboard/folder/${rootFolder.id}`} 
                        className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] flex-grow ${currentFolder?.id === rootFolder.id ? 'bg-[#2a2a2a]' : ''}`}
                      >
                        <FolderIcon className="h-4 w-4" />
                        <span>{rootFolder.name}</span>
                      </Link>
                      <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-gray-400 hover:text-white cursor-pointer"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg py-1 px-0 min-w-[160px]">
                            <DropdownMenuItem 
                              className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
                              onClick={() => onRenameFolder(rootFolder)}
                            >
                              <Pencil className="h-3 w-3 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
                              onClick={() => onMoveFolder(rootFolder)}
                            >
                              <ArrowRight className="h-3 w-3 mr-2" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />
                            <DropdownMenuItem 
                              className="text-red-500 hover:text-white hover:bg-red-600 cursor-pointer focus:bg-red-600 focus:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center"
                              onClick={() => onDeleteFolder(rootFolder)}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subfolders with animation */}
                  <AnimatePresence>
                    {hasSubfolders && isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="ml-6 pl-2 border-l border-[#3a3a3a]"
                      >
                        {folders
                          .filter(subfolder => subfolder.parent_id === rootFolder.id)
                          .map(subfolder => (
                            <motion.div
                              key={subfolder.id}
                              initial={{ x: -5, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2, delay: 0.05 }}
                            >
                              <div className="flex items-center group relative">
                                <Link 
                                  href={`/dashboard/folder/${subfolder.id}`} 
                                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] flex-grow ${currentFolder?.id === subfolder.id ? 'bg-[#2a2a2a]' : ''}`}
                                >
                                  <FolderIcon className="h-4 w-4" />
                                  <span>{subfolder.name}</span>
                                </Link>
                                <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white cursor-pointer"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg py-1 px-0 min-w-[160px]">
                                      <DropdownMenuItem 
                                        className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
                                        onClick={() => onRenameFolder(subfolder)}
                                      >
                                        <Pencil className="h-3 w-3 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
                                        onClick={() => onMoveFolder(subfolder)}
                                      >
                                        <ArrowRight className="h-3 w-3 mr-2" />
                                        Move
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />
                                      <DropdownMenuItem 
                                        className="text-red-500 hover:text-white hover:bg-red-600 cursor-pointer focus:bg-red-600 focus:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center"
                                        onClick={() => onDeleteFolder(subfolder)}
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          }
        </div>
      </div>
      
      {/* Usage Section - positioned at the bottom */}
      <div className="mt-auto p-4 border-t border-[#2a2a2a]">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Usage</h3>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">
                {userProfile.product_id === pro
                  ? `${formatDuration(userProfile.monthly_usage_seconds || 0)} / 15:00:00` 
                  : `${formatDuration(userProfile.monthly_usage_seconds || 0)} / 00:30:00`}
              </span>
              <span className="text-gray-400">
                {userProfile.product_id === pro
                  ? `${Math.round((userProfile.monthly_usage_seconds / (15 * 60 * 60)) * 100)}%` 
                  : `${Math.round((userProfile.monthly_usage_seconds / (30 * 60)) * 100)}%`}
              </span>
            </div>
            <Progress 
              value={userProfile.product_id === pro
                ? Math.min(100, ((userProfile.total_usage_seconds || 0) / (15 * 60 * 60)) * 100) 
                : Math.min(100, ((userProfile.monthly_usage_seconds || 0) / (30 * 60)) * 100)} 
              className="h-1 bg-[#2a2a2a]" 
              indicatorClassName="bg-[#3b82f6]" 
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {userProfile.product_id === pro
              ? 'Pro plan: 15 hours per month' 
              : 'Pro plan: 30 minutes per month'}
          </div>
        </div>
      </div>

      {/* New Folder Dialog */}
      {isNewFolderModalOpen && (
        <Dialog open={isNewFolderModalOpen} onOpenChange={setIsNewFolderModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new folder in the root directory
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-[#2a2a2a] border-[#3a3a3a]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewFolderModalOpen(false);
                  setNewFolderName('');
                }}
                className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} className="cursor-pointer">
                Create Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
