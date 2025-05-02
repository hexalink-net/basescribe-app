import { fetchAccountData } from './actions';
import { UserMenu } from '@/components/UserMenu';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pro, proDuration, freeDuration, proAnnualPriceId } from '@/constants/PaddleProduct';
import { UsageSection } from '@/components/account/UsageSection';
import { PlanManagementSection } from '@/components/account/PlanManagementSection';
import { BillingSection } from '@/components/account/BillingSection';
import Link from 'next/link';
import Image from 'next/image';

export default async function AccountPage() {
  // Fetch all account data using the server action
  const { user, userProfile, userInitials, error } = await fetchAccountData();
  
  if (!user) {
    // Redirect to auth page instead of throwing an error
    redirect('/auth');
  }
  
  if (!userProfile || error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p>Error loading user profile. Please try again later.</p>
      </div>
    );
  }

  const isPro = userProfile.product_id === pro;
  const isYearly = userProfile.price_id === proAnnualPriceId;
  const planEndDate = userProfile.plan_end_date;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#171717] to-[#0a0a0a] text-white">
      {/* Header with subtle blur effect */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#171717]/80 border-b border-[#2a2a2a] h-16">
        <div className="max-w-6xl mx-auto w-full px-6 md:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/basescribe-logo.png" 
              alt="BaseScribe Logo" 
              width={120} 
              height={20} 
              className="h-8 w-auto" 
              priority
            />
        </Link>
        </div>
        <UserMenu user={user} userInitials={userInitials} />
        </div>
      </header>
      
      {/* Main content with improved spacing */}
      <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <Tabs defaultValue="usage" className="w-full">
          <div className="mb-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <TabsList className="flex p-1 bg-[#2a2a2a]/50 backdrop-blur-sm border border-[#3a3a3a]/50 w-fit">
              <TabsTrigger 
                value="usage" 
                className="px-6 py-3 data-[state=active]:border-b-1 data-[state=active]:border-[#F0F177] data-[state=active]:text-white transition-all"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="px-6 py-3 data-[state=active]:border-b-1 data-[state=active]:border-[#F0F177] data-[state=active]:text-white transition-all"
              >
                Plan
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="px-6 py-3 data-[state=active]:border-b-1 data-[state=active]:border-[#F0F177] data-[state=active]:text-white transition-all"
              >
                Billing
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6 animate-in fade-in-50 duration-300">
            <UsageSection
              monthlyUsageSeconds={userProfile.monthly_usage_seconds || 0}
              totalUsageSeconds={userProfile.total_usage_seconds || 0}
              isPro={isPro}
              proDuration={proDuration}
              freeDuration={freeDuration}
              quotaResetAt={userProfile.quota_reset_at}
            />
          </TabsContent>
          
          {/* Plan Management Tab */}
          <TabsContent value="plan" className="space-y-6 animate-in fade-in-50 duration-300">
            <PlanManagementSection
              isPro={isPro}
              isYearly={isYearly}
              proDuration={proDuration}
              freeDuration={freeDuration}
              planEndDate={planEndDate}
              subscriptionId={userProfile.subscription_id}
            />
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 animate-in fade-in-50 duration-300">
            <BillingSection 
              isPro={isPro} 
              subscriptionId={userProfile.subscription_id}
              customerId={userProfile.customer_id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
