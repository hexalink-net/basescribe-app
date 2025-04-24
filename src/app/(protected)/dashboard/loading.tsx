import SkeletonFolderSidebar from '@/components/dashboard/SkeletonFolderSidebar';
import SkeletonTable from '@/components/dashboard/SkeletonTable';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Skeleton Header */}
      <div className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
        <div className="w-32 h-8 bg-[#2a2a2a] rounded"></div>
        <div className="w-10 h-10 bg-[#2a2a2a] rounded-full"></div>
      </div>
      
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Folder Sidebar Skeleton */}
        <SkeletonFolderSidebar />
        
        {/* Main Content Skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="w-40 h-8 bg-[#2a2a2a] rounded"></div>
            <div className="w-28 h-10 bg-[#2a2a2a] rounded"></div>
          </div>
          
          {/* File Table Skeleton */}
          <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
            <SkeletonTable />
          </div>
        </div>
      </div>
    </div>
  );
}