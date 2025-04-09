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

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none">
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
            <Button className={'w-full'} variant={'secondary'} asChild={true}>
              <Link href={`/checkout/${tier.priceId[frequency.value]}`}>Get started</Link>
            </Button>
          </div>
          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}