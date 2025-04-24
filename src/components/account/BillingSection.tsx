"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BillingSectionProps {
  isPro: boolean;
}

export function BillingSection({ isPro }: BillingSectionProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your payment methods and view invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isPro && (
            <div className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="font-medium mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-400">Expires 12/2026</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-[#3a3a3a] hover:bg-[#2a2a2a] hover:text-white">
                Update Payment Method
              </Button>
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-4">Billing History</h3>
            {isPro ? (
              <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#2a2a2a] bg-[#222222] font-medium text-sm">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-[#2a2a2a]">
                  <div className="grid grid-cols-4 gap-4 p-4 text-sm items-center">
                    <div>Apr 23, 2025</div>
                    <div>Pro Plan Subscription</div>
                    <div>$15.00</div>
                    <div>
                      <Badge className="bg-green-600 text-white hover:bg-green-700">Paid</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 text-sm items-center">
                    <div>Mar 23, 2025</div>
                    <div>Pro Plan Subscription</div>
                    <div>$15.00</div>
                    <div>
                      <Badge className="bg-green-600 text-white hover:bg-green-700">Paid</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-[#2a2a2a] rounded-lg">
                <p className="text-gray-400 mb-4">No billing history available on the Free plan.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
