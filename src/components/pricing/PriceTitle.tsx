import { Tier } from '@/constants/PricingTier';

interface Props {
  tier: Tier;
}

export function PriceTitle({ tier }: Props) {
  const { name } = tier;
  return (
    <div className="px-8 pt-8 mb-2">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sm text-muted-foreground">{tier.description}</p>
    </div>
  );
}
