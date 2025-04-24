"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

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

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
      <CardHeader>
        <CardTitle>Usage Summary</CardTitle>
        <CardDescription className="text-gray-400">
          Your current usage and limits for this billing period.
        </CardDescription>
        <CardDescription className="text-gray-400">
          Next plan refresh is in <b>{diffDays} {diffDays === 1 ? 'day' : 'days'}</b> on {formattedResetDate}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>
                {formatDuration(monthlyUsageSeconds)} / 
                {isPro ? ` ${proDuration}:00:00` : ` ${freeDuration}:00:00`}
              </span>
              <span>{Math.round(usagePercentage)}%</span>
            </div>
            <Progress 
              value={usagePercentage}
              className="h-1 bg-[#2a2a2a]" 
              indicatorClassName="bg-[#3b82f6]" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-4">
              <h3 className="font-medium mb-2">Monthly Usage</h3>
              <p className="text-sm text-gray-400">
                {isPro 
                  ? `You've used ${formatDuration(monthlyUsageSeconds)} out of ${proDuration} hours this month.`
                  : `You've used ${formatDuration(monthlyUsageSeconds)} out of ${freeDuration} hour this month.`}
              </p>
            </div>
            
            <div className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-4">
              <h3 className="font-medium mb-2">Total Usage</h3>
              <p className="text-sm text-gray-400">
                Total usage across all time: {formatDuration(totalUsageSeconds)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!isPro && (
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
