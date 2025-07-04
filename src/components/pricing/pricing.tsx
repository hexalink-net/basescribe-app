"use client"

import { Toggle } from '@/components/toggle';
import { PriceCards } from '@/components/pricing/PriceCards';
import { useEffect, useState } from 'react';
import { BillingFrequency, IBillingFrequency } from '@/constants/BillingFrequency';
import { Environments, initializePaddle, Paddle } from '@paddle/paddle-js';
import { usePaddlePrices } from '@/hooks/UsePaddlePrices';

interface Props {
  country: string;
  user?: { id: string; email?: string } | null;
  userSubs?: { product_id: string; price_id: string } | null;
}

export function Pricing({ country, user, userSubs }: Props) {
  const [frequency, setFrequency] = useState<IBillingFrequency>(BillingFrequency[0]);
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  const { prices, loading } = usePaddlePrices(paddle, country);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
      }).then((paddle) => {
        if (paddle) {
          setPaddle(paddle);
        }
      });
    }
  }, []);

  return (
    <div className="w-full p-4">
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="text-center mb-5">
            <h2 className="text-2xl md:text-5xl font-bold mb-8 tracking-tight">
              Simple, transparent
              <br />
              <span className="text-[#F5E960]">pricing</span>
            </h2>
            <p className="text-xl text-[#C5C6C7] max-w-4xl mx-auto leading-relaxed">
              No hidden fees, no surprises. Just secure transcription that works.
            </p>
        </div>      
        <Toggle frequency={frequency} setFrequency={setFrequency} />
        <PriceCards frequency={frequency} loading={loading} priceMap={prices} user={user} userSubs={userSubs} />
      </div>
    </div>
  );
}
