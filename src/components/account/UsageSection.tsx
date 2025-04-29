"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Clock, BarChart, Activity } from 'lucide-react';

interface UsageSectionProps {
  monthlyUsageSeconds: number;
  totalUsageSeconds: number;
  isPro: boolean;
  proDuration: string;
  freeDuration: string;
  quotaResetAt: string;
}

// Format seconds to minutes:seconds format
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function UsageSection({ 
  monthlyUsageSeconds = 0, 
  totalUsageSeconds = 0, 
  isPro, 
  proDuration, 
  freeDuration,
  quotaResetAt
}: UsageSectionProps) {
  const usagePercentage = isPro
    ? Math.min(100, (monthlyUsageSeconds / (parseInt(proDuration) * 60 * 60)) * 100)
    : Math.min(100, (monthlyUsageSeconds / (parseInt(freeDuration) * 60 * 60)) * 100);
    
  // Format the quota reset date
  const resetDate = new Date(quotaResetAt);
  const formattedResetDate = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Calculate days remaining until reset
  const now = new Date();
  const diffTime = Math.abs(resetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine color based on usage percentage
  const isHighUsage = usagePercentage > 80;
  const progressColor = isHighUsage ? 'bg-red-500' : 'bg-blue-500';
  const progressGlow = isHighUsage ? 'shadow-glow-red' : 'shadow-glow-blue';

  return (
    <Card className="bg-[#1a1a1a]/50 backdrop-blur-sm border-[#2a2a2a]/50 text-white overflow-hidden transition-all duration-300 hover:border-[#3a3a3a]/70">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Usage Summary</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Your current usage and limits for this billing period
            </CardDescription>
            <CardDescription className="text-gray-400 mt-1">
              Next plan refresh is in <span className="font-medium text-blue-400">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span> on <span className="font-medium text-blue-400">{formattedResetDate}</span>.
            </CardDescription>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-medium">
            Refreshes in {diffDays} {diffDays === 1 ? 'day' : 'days'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Usage progress bar with glowing effect */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              {formatDuration(monthlyUsageSeconds)} / 
              {isPro ? ` ${proDuration}:00:00` : ` ${freeDuration}:00:00`}
            </span>
            <span className={`font-bold ${isHighUsage ? 'text-red-400' : 'text-blue-400'}`}>
              {Math.round(usagePercentage)}%
            </span>
          </div>
          <div className="h-2 bg-[#2a2a2a]/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColor} rounded-full transition-all duration-500 ease-out ${progressGlow}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
        
        {/* Usage stats cards with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#222222]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-5 transition-all duration-300 hover:bg-[#222222] hover:border-[#3a3a3a] hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-medium">Monthly Usage</h3>
            </div>
            <p className="text-sm text-gray-400">
              {isPro 
                ? `You've used ${formatDuration(monthlyUsageSeconds)} out of ${proDuration} hours this month.`
                : `You've used ${formatDuration(monthlyUsageSeconds)} out of ${freeDuration} hour this month.`}
            </p>
          </div>
          
          <div className="bg-[#222222]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-5 transition-all duration-300 hover:bg-[#222222] hover:border-[#3a3a3a] hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-medium">Total Usage</h3>
            </div>
            <p className="text-sm text-gray-400">
              Total usage across all time: {formatDuration(totalUsageSeconds)}
            </p>
          </div>
        </div>
      </CardContent>
      
      {!isPro && (
        <CardFooter className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-t border-[#2a2a2a]/50 p-4 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div>
              <h4 className="font-medium text-blue-300">Need more transcription time?</h4>
              <p className="text-sm text-gray-400">Upgrade to Pro for 10x more monthly usage</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-all px-6 shadow-lg hover:shadow-blue-700/20">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
