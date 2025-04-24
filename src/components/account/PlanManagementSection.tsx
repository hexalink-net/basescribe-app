"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PlanManagementSectionProps {
  isPro: boolean;
  proDuration: string;
  freeDuration: string;
}

export function PlanManagementSection({ isPro, proDuration, freeDuration }: PlanManagementSectionProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
      <CardHeader>
        <CardTitle>Manage Your Plan</CardTitle>
        <CardDescription className="text-gray-400">
          Your current subscription plan and options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="font-medium mb-2">Current Plan</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">{isPro ? 'Pro Plan' : 'Free Plan'}</span>
              {isPro && (
                <Badge className="bg-green-600 text-white hover:bg-green-700">Active</Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {isPro 
                ? `Your Pro plan includes ${proDuration} hours of transcription per month.`
                : `Your Free plan includes ${freeDuration} hour of transcription per month.`}
            </p>
            {isPro ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="border-[#3a3a3a] hover:bg-[#2a2a2a] hover:text-white">
                  Cancel Subscription
                </Button>
                <Button variant="outline" className="border-[#3a3a3a] hover:bg-[#2a2a2a] hover:text-white">
                  Change Plan
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            )}
          </div>
          
          {isPro && (
            <div className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="font-medium mb-2">Renewal Information</h3>
              <p className="text-sm text-gray-400">
                Your subscription will automatically renew on <span className="font-medium">May 23, 2025</span>.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
