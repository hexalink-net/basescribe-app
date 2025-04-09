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
      name: 'Free',
      id: 'free',
      icon: '/assets/icons/price-tiers/free-icon.svg',
      description: 'Ideal for individuals who want to get started with simple design tasks.',
      features: ['1 workspace', 'Limited collaboration', 'Export to PNG and SVG'],
      featured: false,
      priceId: { month: 'pri_01jragd254tcrrdmwtk1c8h776', year: 'pri_01jrcqk5576zvh8f7qhq2xsdqm' },
    },
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
  