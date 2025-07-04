import { PricingTier } from '@/constants/PricingTier';
import { IBillingFrequency } from '@/constants/BillingFrequency';
import { FeaturesList } from '@/components/pricing/FeaturesList';
import { cn } from '@/lib/StyleUtils';
import { Button } from '@/components/ui/button';
import { PriceHeader } from '@/components/pricing/PriceHeader';
import { FeaturedCardGradient } from '@/components/pricing/FeaturedCardGradient';
import Link from 'next/link';
import { signInWithGoogle } from '@/app/auth/action';
import Image from 'next/image';
import { FreeCard } from '@/components/pricing/FreeCard';
import { pro, proAnnualPriceId } from '@/constants/PaddleProduct';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/landing/card';

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
  user?: { id: string; email?: string } | null;
  userSubs?: { product_id: string; price_id: string } | null;
}

export function PriceCards({ loading, frequency, priceMap, user, userSubs }: Props) {
  const isSubscribed = userSubs?.product_id === pro;
  const isYearly = userSubs?.price_id === proAnnualPriceId;

  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none">
      <FreeCard user={user} userSubs={userSubs}/>
      {PricingTier.map((tier, index) => (
        <div 
          key={tier.id} 
          className={cn(
            'border border-[#2a2a2a]/50 rounded-lg bg-[#1a1a1a]/50 backdrop-blur-sm overflow-hidden',
            'transition-all duration-300 hover:border-[#3a3a3a]/70 shadow-xl',
            'animate-in fade-in-50',
            {'delay-100': index === 0, 'delay-200': index === 1}
          )}
        >
          <Card className="group relative bg-gradient-to-b from-[#F5E960]/10 to-[#1F2833]/40 border-2 border-[#F5E960]/50 hover:border-[#F5E960] backdrop-blur-2xl p-10 transition-all duration-700 hover:scale-105 overflow-hidden">
            {tier.featured && <FeaturedCardGradient />}
            <PriceHeader tier={tier} 
              loading={loading}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}/>
            <CardContent className="space-y-8 relative z-10">
              <FeaturesList tier={tier} />
              <div className={'px-8 mt-8'}>
                {!user ? (
                  // User not logged in - show sign up buttons
                  <div className="flex flex-col gap-3">
                    <form action={signInWithGoogle}>
                      <Button 
                        type="submit" 
                        className="w-full flex items-center justify-center gap-2 bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] hover:text-white transition-all group" 
                        variant="outline"
                      >
                        <Image 
                          src="/google-logo.png" 
                          alt="Google logo" 
                          width={20} 
                          height={20} 
                          className="transition-transform group-hover:scale-105"
                        />
                        <span className="flex items-center justify-center gap-1">
                          Start Transcribing for Free
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </form>
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#F0F177] hover:text-[#d9e021] hover:bg-transparent transition-colors mb-4" 
                      asChild
                    >
                      <Link href="/auth">Sign up with email address</Link>
                    </Button>
                  </div>
                ) : isSubscribed ? (
                  // User logged in and has this subscription
                  isYearly ? (
                    // User has yearly subscription - show "Current Plan"
                    <Button className="mt-2 mb-4 w-full bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] transition-all" variant="outline">
                      <span className="flex items-center justify-center gap-1">
                        Current Plan
                      </span>
                    </Button>
                  ) : (
                    // User has monthly subscription - show discount message for annual plan
                    <Button className="mt-2 mb-4 w-full bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] transition-all group" variant="outline" asChild>
                      <Link href={`/checkout/${proAnnualPriceId}`}>
                        <span className="flex items-center justify-center gap-1">
                          Get 20% discount on our annual plan
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Button>
                  )
                ) : (
                  // User logged in but doesn't have this subscription - show "Get started"
                  <Button className="mt-2 mb-4 w-full bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] transition-all group" variant="outline" asChild>
                    <Link href={`/checkout/${tier.priceId[frequency.value]}`}>
                      <span className="flex items-center justify-center gap-1">
                        Get started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}