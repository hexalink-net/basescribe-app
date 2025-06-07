"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderIcon, FolderPlus, ChevronRight, Pencil, Trash2, ArrowRight, MoreVertical, Menu, X } from 'lucide-react';
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
import { pro, proDuration, freeDuration } from '@/constants/PaddleProduct';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

        toast({
          title: "Folder created",
          description: "The folder has been successfully created.",
        });
        
        // Navigate to the newly created folder
        router.push(`/dashboard/folder/${result.data}`);
        router.refresh();
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
    <div>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div 
        className={`
          fixed md:relative top-0 left-0 h-full w-64 bg-[#171717] border-r border-[#2a2a2a] flex flex-col 
          transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="p-4">
          <Link href="/dashboard" className={`text-white flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${!currentFolder ? 'bg-[#2a2a2a]' : ''}`}>
            <FolderIcon className="h-4 w-4" />
            <span >All Files</span>
          </Link>
        </div>
        
        {/* Folder Header */}
        <div className="px-4 pt-4 pb-1 border-t border-[#2a2a2a] text-white">
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
      <div className="overflow-y-auto flex-grow px-4 pt-2 max-h-[calc(100vh-270px)] text-white">
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
                              className="h-6 w-6 p-0 text-gray hover:text-white cursor-pointer"
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
                                        className="h-6 w-6 p-0 text-gray hover:text-white cursor-pointer"
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
        {userProfile.product_id !== pro && (
            <div className="mb-5">
              <Button asChild variant="outline" size="sm" className="w-full text-xs text-white">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-400">Usage</h3>
          <div>
            {/* Calculate usage percentage */}
            {(() => {
              const usagePercentage = Math.min(
                100,
                ((userProfile.monthly_usage_seconds || 0) / 
                (userProfile.product_id === pro ? (20 * 60 * 60) : (1 * 60 * 60))) * 100
              );
              const isHighUsage = usagePercentage > 80;
              const progressColor = 'bg-gradient-to-r from-[#F0F177] to-[#d9e021]';
              const progressGlow = 'shadow-glow-yellow';
              
              return (
                <>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">
                      {formatDuration(userProfile.monthly_usage_seconds || 0)} / 
                      {userProfile.product_id === pro ? ` ${proDuration}:00:00` : ` ${freeDuration}:00:00`}
                    </span>
                    <span className="font-bold text-[#d9e021]">
                      {Math.round(usagePercentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressColor} rounded-full transition-all duration-500 ease-out ${progressGlow}`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </>
              );
            })()} 
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {userProfile.product_id === pro
              ? `Pro plan: ${proDuration} hours per month` 
              : `Free plan: ${freeDuration} hour per month`}
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

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
