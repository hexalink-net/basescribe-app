"use client";

import { memo, useMemo } from 'react';

// Optimized skeleton loader component for table with memoization to prevent re-renders
const SkeletonTable = memo(() => {
  // Pre-generate skeleton rows to avoid map operation during render
  const skeletonRows = useMemo(() => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="border-b border-[#2a2a2a] py-4 px-4 flex items-center">
        <div className="w-[20px] h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/4 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/5 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded"></div>
      </div>
    ));
  }, []);
  
  return (
    <div className="animate-pulse" style={{ contentVisibility: 'auto' }}>
      {/* Skeleton header with lower opacity to reduce paint complexity */}
      <div className="border-b border-[#2a2a2a] py-3 px-4 flex">
        <div className="w-[20px] h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/4 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/5 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded"></div>
      </div>
      
      {/* Render pre-generated skeleton rows */}
      {skeletonRows}
    </div>
  );
});

SkeletonTable.displayName = 'SkeletonTable';

export default SkeletonTable;
