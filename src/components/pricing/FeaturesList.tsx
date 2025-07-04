import { Tier } from '@/constants/PricingTier';
import { Check } from 'lucide-react';

interface Props {
  tier: Tier;
}

export function FeaturesList({ tier }: Props) {
  return (
    <div className="space-y-6">
      {tier.features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-4 group">
          <div className="relative">
            <Check className="w-6 h-6 text-[#F5E960]" />
            <div className="absolute inset-0 bg-[#F5E960] rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          </div>
          <span className="text-white text-lg">{feature}</span>
        </div>
      ))}
    </div>
  );
}
