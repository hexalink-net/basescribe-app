import { PricingPlans } from '@/components/pricing';
import { Header } from '@/components/header';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PricingPlans />
    </div>
  );
}
