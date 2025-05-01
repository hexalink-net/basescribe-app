import { BillingFrequency, IBillingFrequency } from '@/constants/BillingFrequency';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  frequency: IBillingFrequency;
  setFrequency: (frequency: IBillingFrequency) => void;
}

export function Toggle({ setFrequency, frequency }: Props) {
  return (
    <div className="flex justify-center mb-10">
      <Tabs
        value={frequency.value}
        onValueChange={(value) =>
          setFrequency(BillingFrequency.find((billingFrequency) => value === billingFrequency.value)!)
        }
        className="animate-in fade-in-50"
      >
        <TabsList className="bg-[#1a1a1a]/70 backdrop-blur-sm border border-[#2a2a2a]/50 hover:border-[#3a3a3a]/70 transition-all duration-300">
          {BillingFrequency.map((billingFrequency) => (
            <TabsTrigger 
              key={billingFrequency.value} 
              value={billingFrequency.value}
              className="data-[state=active]:bg-[#222222] data-[state=active]:text-white text-gray-300"
            >
              {billingFrequency.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}