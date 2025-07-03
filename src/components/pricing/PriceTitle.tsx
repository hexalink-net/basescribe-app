import { Tier } from '@/constants/PricingTier';

interface Props {
  tier: Tier;
}

export function PriceTitle({ tier }: Props) {
  const { name } = tier;
  return (
    <div className="px-8 pt-8">
      <span className="text-3xl font-semibold">{name}</span>
    </div>
  );
}
