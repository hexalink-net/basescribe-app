"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CreditCard, Receipt, Download, ChevronRight } from 'lucide-react';

interface BillingSectionProps {
  isPro: boolean;
}

export function BillingSection({ isPro }: BillingSectionProps) {
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
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                <span className="flex items-center gap-1">
                  Update
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Receipt className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-medium">Billing History</h3>
            </div>
          </div>
          
          {isPro ? (
            <div className="border border-[#2a2a2a]/70 rounded-xl overflow-hidden backdrop-blur-sm bg-[#171717]/80">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#2a2a2a] bg-[#171717]/70 font-medium text-sm">
                <div>Date</div>
                <div>Description</div>
                <div>Amount</div>
                <div className="text-right">Status</div>
              </div>
              <div className="divide-y divide-[#2a2a2a]/50">
                <div className="grid grid-cols-4 gap-4 p-4 text-sm items-center hover:bg-[#171717]/70 transition-colors">
                  <div>Apr 23, 2025</div>
                  <div>Pro Plan Subscription</div>
                  <div>$15.00</div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 text-white">
                      Paid
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-800/50">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 text-sm items-center hover:bg-[#171717]/70 transition-colors">
                  <div>Mar 23, 2025</div>
                  <div>Pro Plan Subscription</div>
                  <div>$15.00</div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 text-white">
                      Paid
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-800/50">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#222222]/70 to-[#1e1e1e]/70 backdrop-blur-sm border border-[#2a2a2a]/50 rounded-xl p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No billing history</h3>
              <p className="text-gray-400 mb-6 max-w-xs mx-auto">You don't have any invoices yet. Upgrade to Pro to access premium features.</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-700/20 px-6">
                <Link href="/pricing" className="flex items-center gap-1">
                  Upgrade to Pro
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
