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
}

export function Pricing({ country, user }: Props) {
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
    <div className="mx-auto max-w-7xl w-full relative px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-8">
      <Toggle frequency={frequency} setFrequency={setFrequency} />
      <PriceCards frequency={frequency} loading={loading} priceMap={prices} user={user} />
    </div>
  );
}
