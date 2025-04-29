import { fetchAccountData } from './actions';
import { UserMenu } from '@/components/UserMenu';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pro, proDuration, freeDuration } from '@/constants/PaddleProduct';
import { UsageSection } from '@/components/account/UsageSection';
import { PlanManagementSection } from '@/components/account/PlanManagementSection';
import { BillingSection } from '@/components/account/BillingSection';



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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#111111] to-[#0a0a0a] text-white">
      {/* Header with subtle blur effect */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#0f0f0f]/80 border-b border-[#2a2a2a] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </a>
          <h1 className="text-xl font-medium">Account</h1>
        </div>
        <UserMenu user={user} userInitials={userInitials} />
      </header>
      
      {/* Main content with improved spacing */}
      <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <Tabs defaultValue="usage" className="w-full">
          <div className="mb-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <TabsList className="flex p-1 bg-[#1a1a1a]/50 backdrop-blur-sm rounded-xl border border-[#2a2a2a]/50 w-fit">
              <TabsTrigger 
                value="usage" 
                className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
              >
                Plan
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
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
              proDuration={proDuration}
              freeDuration={freeDuration}
            />
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 animate-in fade-in-50 duration-300">
            <BillingSection isPro={isPro} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
