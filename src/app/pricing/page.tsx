import { Pricing } from '@/components/pricing/pricing';
import { Header } from '@/components/header';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center py-8">
        <Pricing country="US" />
      </div>
    </div>
  );
}
