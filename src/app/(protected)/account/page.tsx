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
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </a>
          <h1 className="text-xl font-medium">Account</h1>
        </div>
        <UserMenu user={user} userInitials={userInitials} />
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="usage" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#1a1a1a] p-1 rounded-md">
            <TabsTrigger value="usage" className="data-[state=active]:bg-[#2a2a2a]">Usage</TabsTrigger>
            <TabsTrigger value="plan" className="data-[state=active]:bg-[#2a2a2a]">Plan Management</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-[#2a2a2a]">Billing</TabsTrigger>
          </TabsList>
          
          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
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
          <TabsContent value="plan" className="space-y-6">
            <PlanManagementSection
              isPro={isPro}
              proDuration={proDuration}
              freeDuration={freeDuration}
            />
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingSection isPro={isPro} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
