"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CreditCard, Calendar, Crown, ArrowRight } from 'lucide-react';

interface PlanManagementSectionProps {
  isPro: boolean;
  proDuration: string;
  freeDuration: string;
}

export function PlanManagementSection({ isPro, proDuration, freeDuration }: PlanManagementSectionProps) {
  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 text-white overflow-hidden transition-all duration-300 hover:border-[#3a3a3a]/70">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Manage Your Plan</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Your current subscription plan and options
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="bg-gradient-to-r from-[#171717]/70 to-[#1e1e1e]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-6 transition-all duration-300 hover:border-[#3a3a3a] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-600/10 blur-2xl"></div>
          
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isPro ? 'bg-blue-600/20' : 'bg-gray-600/20'}`}>
              <Crown className={`h-6 w-6 ${isPro ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{isPro ? 'Pro Plan' : 'Free Plan'}</h3>
                {isPro ? (
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 text-white shadow-glow-blue">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-0">
                    Limited
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-400 mb-6">
                {isPro 
                  ? `Your Pro plan includes ${proDuration} hours of transcription per month.`
                  : `Your Free plan includes ${freeDuration} hour of transcription per month.`}
              </p>
              
              {isPro ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="border-[#3a3a3a] bg-[#171717]/40 hover:bg-[#2a2a2a] hover:text-white transition-all">
                    Cancel Subscription
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-700/20">
                    Change Plan
                  </Button>
                </div>
              ) : (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-700/20 group">
                  <Link href="/pricing" className="flex items-center gap-1">
                    Upgrade to Pro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {isPro && (
          <div className="bg-[#171717]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-5 transition-all duration-300 hover:bg-[#171717] hover:border-[#3a3a3a] hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-medium">Renewal Information</h3>
            </div>
            <p className="text-gray-400">
              Your subscription will automatically renew on <span className="font-medium text-purple-300">May 23, 2025</span>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
