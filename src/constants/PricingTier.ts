export interface Tier {
    name: string;
    id: 'free' | 'pro';
    icon: string;
    description: string;
    features: string[];
    featured: boolean;
    priceId: Record<string, string>;
  }
  
  export const PricingTier: Tier[] = [
    {
      name: 'Pro',
      id: 'pro',
      icon: '/assets/icons/price-tiers/basic-icon.svg',
      description: 'Enhanced design tools for scaling teams who need more flexibility.',
      features: ['Integrations', 'Unlimited workspaces', 'Advanced editing tools', 'Everything in Starter'],
      featured: true,
      priceId: { month: 'pri_01jragknw1mfnjevbszq7tt089', year: 'pri_01jragmnqnywa9gxq1kt6rrszb' },
    }
  ];
  