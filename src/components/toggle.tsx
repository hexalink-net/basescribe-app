import { BillingFrequency, IBillingFrequency } from '@/constants/BillingFrequency';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  frequency: IBillingFrequency;
  setFrequency: (frequency: IBillingFrequency) => void;
}

export function Toggle({ setFrequency, frequency }: Props) {
  return (
    <div className="flex justify-center mb-3 grid grid-rows-2">
      <Tabs
        value={frequency.value}
        onValueChange={(value) =>
          setFrequency(BillingFrequency.find((billingFrequency) => value === billingFrequency.value)!)
        }
        className="animate-in fade-in-50 text-center mb-4"
      >
        <TabsList className="bg-[#1a1a1a]/70 backdrop-blur-sm border border-[#2a2a2a]/50 hover:border-[#3a3a3a]/70 transition-all duration-300">
          {BillingFrequency.map((billingFrequency) => (
            <TabsTrigger 
              key={billingFrequency.value} 
              value={billingFrequency.value}
              className="data-[state=active]:bg-[#222222] data-[state=active]:text-white text-gray-300 text-sm font-bold"
            >
              {billingFrequency.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* <div>
        <p className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-1 shadow-lg font-bold rounded-sm">
          SAVE 20% ON ANNUAL PLAN
        </p>
      </div> */}
    </div>
  );
}