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
      name: 'PRO',
      id: 'pro',
      icon: '/assets/icons/price-tiers/basic-icon.svg',
      description: 'Powerful transcription with maximum protection',
      features: ['20 hours of transcription per month', '99 language support', 'Highest priority', 'Max file size: 5 GB per upload', 'Multiple file uploads', 'File and transcript encryption included'],
      featured: true,
      priceId: { month: 'pri_01jragknw1mfnjevbszq7tt089', year: 'pri_01jragmnqnywa9gxq1kt6rrszb' },
    }
  ];
  