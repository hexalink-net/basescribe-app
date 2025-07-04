import { PricingContainer } from '@/components/pricing/PricingContainer';
import { Header } from '@/components/header';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#111111] to-[#0a0a0a] text-white">
      <div className="absolute top-0 left-0 right-0 z-10">
        <Header />
      </div>
      <div className="flex-grow flex items-center justify-center pt-24 pb-16">
        <PricingContainer country="US" />
      </div>
    </div>
  );
}
