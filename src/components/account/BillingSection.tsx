"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreditCard, Receipt, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { changePaymentMethod, getBillingHistory } from '@/app/(protected)/account/actions';
import { useToast } from '@/components/ui/UseToast';

interface BillingSectionProps {
  isPro: boolean;
  subscriptionId?: string;
  customerId?: string;
}

export function BillingSection({ isPro, subscriptionId, customerId }: BillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBillingHistory, setIsLoadingBillingHistory] = useState(false);
  const { toast } = useToast();
  
  const handleViewBillingHistory = async () => {
    try {
      setIsLoadingBillingHistory(true);
      
      if (!customerId) {
        toast({
          title: "Error",
          description: "Customer information not found",
          variant: "destructive"
        });
        return;
      }
      
      const result = await getBillingHistory(customerId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      if (result.billingHistoryUrl) {
        // Open the billing history URL in a new tab
        window.open(result.billingHistoryUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access billing history",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBillingHistory(false);
    }
  };
  
  const handleChangePaymentMethod = async () => {
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
      
      const result = await changePaymentMethod(subscriptionId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      if (result.cancelUrl) {
        // Open the payment method update URL in a new tab
        window.open(result.cancelUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment method update request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 text-white overflow-hidden transition-all duration-300 hover:border-[#3a3a3a]/70">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Billing Information</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Manage your payment methods and view invoices
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {isPro && (
          <div className="bg-[#171717]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-5 transition-all duration-300 hover:bg-[#171717] hover:border-[#3a3a3a] hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-medium">Payment Method</h3>
            </div>
            <div className="flex items-center justify-between mb-4 bg-[#171717]/50 p-3 rounded-lg border border-[#2a2a2a]/50">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#3a3a3a]/50">
                  <CreditCard className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="font-medium text-white">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-400">Expires 12/2026</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                onClick={handleChangePaymentMethod}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Update
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="bg-[#171717]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-5 transition-all duration-300 hover:bg-[#171717] hover:border-[#3a3a3a] hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Receipt className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-medium">Billing History</h3>
            </div>
            
            {isPro ? (
              <div className="flex items-center justify-between mb-4 bg-[#171717]/50 p-3 rounded-lg border border-[#2a2a2a]/50">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-[#3a3a3a]/50">
                    <Receipt className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Subscription Invoices</p>
                    <p className="text-xs text-gray-400">View your complete billing history</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  onClick={handleViewBillingHistory}
                  disabled={isLoadingBillingHistory}
                >
                  {isLoadingBillingHistory ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#222222]/70 to-[#1e1e1e]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No billing history</h3>
                <p className="text-gray-400 mb-6 max-w-xs mx-auto">You don&apos;t have any invoices yet. Upgrade to Pro to access premium features.</p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-700/20 px-6">
                  <Link href="/pricing" className="flex items-center gap-1">
                    Upgrade to Pro
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
