import { PricingContainer } from '@/components/pricing/PricingContainer';
import { Header } from '@/components/header';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center py-8">
        <PricingContainer country="US" />
      </div>
    </div>
  );
}
