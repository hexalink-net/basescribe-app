"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, Crown, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cancelPlan, getSubscriptionUpgradePreview, upgradeSubscription, getSubscriptionInfo, renewPlan } from '@/app/(protected)/account/actions';
import { useToast } from '@/components/ui/UseToast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface PlanManagementSectionProps {
  isPro: boolean;
  isYearly: boolean;
  proDuration: string;
  freeDuration: string;
  planEndDate: Date;
  subscriptionId?: string;
}

export function PlanManagementSection({ isPro, isYearly, proDuration, freeDuration, planEndDate, subscriptionId }: PlanManagementSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRenewLoading, setIsRenewLoading] = useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    isCancelled: boolean;
    scheduledChange?: string;
  }>({ isCancelled: false });
  const [upgradePreview, setUpgradePreview] = useState<{
    startBillingPeriod?: string;
    endBillingPeriod?: string;
    totalAmount?: string;
    dueAmount?: string;
  }>({});
  const { toast } = useToast();
  const resetDate = new Date(planEndDate);
  const formattedResetDate = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Define fetchSubscriptionDetails with useCallback
  const fetchSubscriptionDetails = useCallback(async () => {
    try {
      if (!subscriptionId) return;
      
      const result = await getSubscriptionInfo(subscriptionId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.subscription) {
        const scheduledChange = result.subscription.data.scheduled_change;
        setSubscriptionDetails({
          isCancelled: scheduledChange?.action === 'cancel',
          scheduledChange: scheduledChange?.action
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive"
      });
    }
  }, [subscriptionId, toast]);
  
  // Fetch subscription details on component mount
  useEffect(() => {
    if (isPro && subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [isPro, subscriptionId, fetchSubscriptionDetails]);
  

  
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      if (!subscriptionId) {
        toast({
          title: "Error",
          description: "Subscription information not found",
          variant: "destructive"
        });
        return;
      }
      
      const result = await cancelPlan(subscriptionId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      if (result.cancelUrl) {
        // Open the cancel URL in a new tab
        window.open(result.cancelUrl, '_blank');
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to process cancellation request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpgradePreview = async () => {
    try {
      setIsUpgradeLoading(true);
      
      if (!subscriptionId) {
        toast({
          title: "Error",
          description: "Subscription information not found",
          variant: "destructive"
        });
        return;
      }
      
      const result = await getSubscriptionUpgradePreview(subscriptionId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      // Format dates for display
      const startDate = new Date(result.startBillingPeriod || '');
      const endDate = new Date(result.endBillingPeriod || '');
      
      const formattedStartDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      setUpgradePreview({
        startBillingPeriod: formattedStartDate,
        endBillingPeriod: formattedEndDate,
        totalAmount: `$${result.totalAmountFormatted}`,
        dueAmount: `$${result.dueAmountFormatted}`
      });
      
      setShowUpgradeModal(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch upgrade preview",
        variant: "destructive"
      });
    } finally {
      setIsUpgradeLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setIsRenewLoading(true);
      
      if (!subscriptionId) {
        toast({
          title: "Error",
          description: "Subscription information not found",
          variant: "destructive"
        });
        return;
      }
      
      await renewPlan(subscriptionId);
      
      toast({
        title: "Subscription Renewed",
        description: "Your subscription has been renewed. Please refresh your page.",
      });
      
      // Update local state to reflect the change
      setSubscriptionDetails({
        isCancelled: false,
        scheduledChange: undefined
      });
      
    } catch {
      toast({
        title: "Error",
        description: "Failed to renew subscription",
        variant: "destructive"
      });
    } finally {
      setIsRenewLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      setIsUpgradeLoading(true);
      
      if (!subscriptionId) {
        toast({
          title: "Error",
          description: "Subscription information not found",
          variant: "destructive"
        });
        return;
      }
      
      const result = await upgradeSubscription(subscriptionId);
      
      if (result && result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Plan Updated",
        description: "Your subscription has been updated to the annual plan. Please refresh your page.",
      });
      
      setShowUpgradeModal(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      });
    } finally {
      setIsUpgradeLoading(false);
    }
  };
  
  return (
    <>
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
                    {subscriptionDetails.isCancelled ? (
                      <Button 
                        variant="outline" 
                        className="border-[#3a3a3a] bg-[#171717]/40 hover:bg-[#2a2a2a] hover:text-white transition-all"
                        onClick={handleRenewSubscription}
                        disabled={isRenewLoading}
                      >
                        {isRenewLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Renew Subscription"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-[#3a3a3a] bg-[#171717]/40 hover:bg-[#2a2a2a] hover:text-white transition-all"
                        onClick={handleCancelSubscription}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    )}
                    {!isYearly && (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-700/20"
                        onClick={handleUpgradePreview}
                        disabled={isUpgradeLoading}
                      >
                        {isUpgradeLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <span>
                            <b>SAVE 25% - </b>&nbsp;Switch to Annual Plan
                          </span>
                        )}
                      </Button>
                    )}
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
                {subscriptionDetails.isCancelled ? (
                  <>Your subscription will end on <span className="font-medium text-purple-300">{formattedResetDate}</span>.</>
                ) : (
                  <>Your subscription will automatically renew on <span className="font-medium text-purple-300">{formattedResetDate}</span>.</>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isPro && (
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="bg-[#1a1a1a] text-white border border-[#2a2a2a] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                <span>Update Plan</span>
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Switch from monthly to annual billing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Billing period</span>
                  <span className="font-medium">
                    {upgradePreview.startBillingPeriod} - {upgradePreview.endBillingPeriod}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total</span>
                  <div className="text-right">
                    <div className="font-medium">{upgradePreview.totalAmount} / month</div>
                  </div>
                </div>
                
                <div className="h-px bg-gray-800 my-4"></div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Due now</span>
                    <p className="text-xs text-gray-400">Unused plan time has been deducted from total</p>
                    <p className="text-xs text-gray-400">Billed to existing billing info</p>
                  </div>
                  <span className="font-medium text-xl">{upgradePreview.dueAmount}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                onClick={handleUpdatePlan}
                disabled={isUpgradeLoading}
              >
                {isUpgradeLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Update Now"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
