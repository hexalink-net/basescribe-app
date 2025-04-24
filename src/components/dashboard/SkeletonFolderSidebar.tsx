"use client";

import { memo, useMemo } from 'react';

// Optimized skeleton loader component for folder sidebar with memoization to prevent re-renders
const SkeletonFolderSidebar = memo(() => {
  // Pre-generate skeleton folder items to avoid map operation during render
  const skeletonFolders = useMemo(() => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="px-4 py-2">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <div className="w-4 h-4 bg-[#2a2a2a] rounded"></div>
          <div className="w-3/4 h-4 bg-[#2a2a2a] rounded"></div>
        </div>
      </div>
    ));
  }, []);
  
  return (
    <div className="w-64 border-r border-[#2a2a2a] flex flex-col h-full animate-pulse" style={{ contentVisibility: 'auto' }}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 p-2 rounded-md">
            <div className="w-4 h-4 bg-[#2a2a2a] rounded"></div>
            <div className="w-20 h-4 bg-[#2a2a2a] rounded"></div>
          </div>
        </div>
        
        {/* Folder Header */}
        <div className="px-4 pt-4 pb-1 border-t border-[#2a2a2a]">
          <div className="flex justify-between items-center">
            <div className="w-16 h-4 bg-[#2a2a2a] rounded"></div>
            <div className="w-6 h-6 bg-[#2a2a2a] rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Folder List */}
      <div className="overflow-y-auto flex-grow">
        {skeletonFolders}
      </div>
      
      {/* Usage Section - positioned at the bottom */}
      <div className="mt-auto p-4 border-t border-[#2a2a2a]">
        <div className="space-y-2">
          <div className="w-20 h-4 bg-[#2a2a2a] rounded mb-1"></div>
          <div className="flex justify-between">
            <div className="w-24 h-3 bg-[#2a2a2a] rounded"></div>
            <div className="w-8 h-3 bg-[#2a2a2a] rounded"></div>
          </div>
          <div className="w-full h-1 bg-[#2a2a2a] rounded"></div>
          <div className="w-32 h-3 bg-[#2a2a2a] rounded mt-1"></div>
        </div>
      </div>
    </div>
  );
});

SkeletonFolderSidebar.displayName = 'SkeletonFolderSidebar';

export default SkeletonFolderSidebar;
