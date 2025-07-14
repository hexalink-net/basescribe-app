import { Tier } from '@/constants/PricingTier';
import { CardHeader, CardTitle } from '@/components/landing/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/StyleUtils';

interface Props {
  loading: boolean;
  tier: Tier;
  priceMap: Record<string, string>;
  value: string;
  priceSuffix: string;
}

export function PriceHeader({ loading, priceMap, priceSuffix, tier, value }: Props) {
  const { name, description } = tier;
  return (
    <CardHeader className="text-center pb-8 relative z-10">
      <CardTitle className="text-4xl font-bold text-white mb-2">{name} <span className="text-[#C5C6C7]">(COMING SOON)</span></CardTitle>
      <p className="text-[#C5C6C7] text-xl"> {description}</p>
      <div className="text-5xl font-bold mt-6">
      <div>
          {loading ? (
            <Skeleton className="h-[96px] w-full bg-border" />
          ) : (
            <>
              <div className={cn('bg-gradient-to-r from-[#F5E960] to-[#FFD600] bg-clip-text text-transparent')}>
                {value === 'year' ? (
                  <span>
                  {`$${(
                    parseFloat(
                        priceMap[tier.priceId[value]].replace('$', ''),
                      ) / 12  
                    ).toFixed(0)}`}
                  </span>
                ) : (
                  <span>{priceMap[tier.priceId[value]].replace(/\.00$/, '')}</span>
                )}
                <span className="text-xl text-[#C5C6C7]">{priceSuffix}</span>
              </div>
              {value === 'year' ? (
                <p className="text-[#F5E960] font-semibold mt-2 text-lg">Billed annually ({priceMap[tier.priceId[value]].replace(/\.00$/, '')}/year)</p>
              ) : null}
            </>
          )}
        </div>
        </div>
  </CardHeader>
  );
}
