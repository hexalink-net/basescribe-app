import { PricingTier } from '@/constants/PricingTier';
import { IBillingFrequency } from '@/constants/BillingFrequency';
import { FeaturesList } from '@/components/pricing/FeaturesList';
import { PriceAmount } from '@/components/pricing/PriceAmount';
import { cn } from '@/lib/StyleUtils';
import { Button } from '@/components/ui/button';
import { PriceTitle } from '@/components/pricing/PriceTitle';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/pricing/FeaturedCardGradient';
import Link from 'next/link';
import { signInWithGoogle } from '@/app/auth/action';
import Image from 'next/image';
import { FreeCard } from '@/components/pricing/FreeCard';
import { pro, proAnnualPriceId } from '@/constants/PaddleProduct';

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
      {PricingTier.map((tier) => (
        <div key={tier.id} className={cn('border rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden')}>
          <div className={cn('flex flex-col rounded-lg rounded-b-none pricing-card-border')}>
            {tier.featured && <FeaturedCardGradient />}
            <PriceTitle tier={tier} />
            <PriceAmount
              loading={loading}
              tier={tier}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}
            />
            <div className={'px-8'}>
              <Separator className={'bg-border'} />
            </div>
            <div className={'px-8 text-[16px] leading-[24px]'}>{tier.description}</div>
          </div>
          <div className={'px-8 mt-8'}>
          {!user ? (
            // User not logged in - show sign up buttons
            <div className="flex flex-col gap-3">
              <form action={signInWithGoogle}>
                <Button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black" 
                  variant="outline"
                >
                  <Image 
                    src="/google-logo.png" 
                    alt="Google logo" 
                    width={20} 
                    height={20} 
                  />
                  Start Transcribing for Free
                </Button>
              </form>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/auth">Sign up with email address</Link>
              </Button>
            </div>
          ) : isSubscribed ? (
            // User logged in and has this subscription
            isYearly ? (
              // User has yearly subscription - show "Current Plan"
              <Button className={'w-full'} variant={'secondary'} asChild={true}>
                <p>Current Plan</p>
              </Button>
            ) : (
              // User has monthly subscription - show discount message for annual plan
              <Button className={'w-full'} variant={'secondary'} asChild={true}>
                <Link href={`/checkout/${proAnnualPriceId}`}>Get 20% discount on our annual plan</Link>
              </Button>
            )
          ) : (
            // User logged in but doesn't have this subscription - show "Get started"
            <Button className={'w-full'} variant={'secondary'} asChild={true}>
              <Link href={`/checkout/${tier.priceId[frequency.value]}`}>Get started</Link>
            </Button>
          )}
          </div>
          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}