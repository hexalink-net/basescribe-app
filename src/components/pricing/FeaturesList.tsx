import { Tier } from '@/constants/PricingTier';
import { cn } from '@/lib/StyleUtils';

interface Props {
  tier: Tier;
}

export function FeaturesList({ tier }: Props) {
  return (
    <div className="px-8 pb-8">
      <div className="text-sm font-medium mb-3">
        For professionals who need more power, flexibility, and true privacy.
      </div>
      <ul className="space-y-3">
        {tier.features.map((feature: string) => (
          <li key={feature} className="flex items-start">
            <svg 
              className={cn(
                "h-5 w-5 mr-2 flex-shrink-0",
                tier.featured ? "text-yellow-500" : "text-green-500"
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
