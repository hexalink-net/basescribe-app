'use client';

import { PriceSection } from '@/components/checkout/PriceSection';
import { CheckoutFormGradients } from '@/components/checkout/CheckoutFromGradients';
import { type Environments, initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import throttle from 'lodash.throttle';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PathParams {
  priceId: string;
  [key: string]: string | string[];
}

interface Props {
  userEmail?: string;
  updateCustomerId?: (customerId: string) => Promise<void>;
}

export function CheckoutContents({ userEmail, updateCustomerId }: Props) {  
  const { priceId } = useParams<PathParams>();
  console.log(priceId)
  const quantity = 1;
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);

  const handleCheckoutEvents = useCallback((event: CheckoutEventsData) => {
    setCheckoutData(event);
  }, []);

  const updateItems = useCallback(
    (paddle: Paddle, priceId: string, quantity: number) => {
      const throttledUpdate = throttle((p: Paddle, id: string, qty: number) => {
        p.Checkout.updateItems([{ priceId: id, quantity: qty }]);
      }, 1000);
      throttledUpdate(paddle, priceId, quantity);
    },
    [],
  );

  useEffect(() => {
    if (!paddle?.Initialized && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        eventCallback: async (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data);
          }

          if (event.name === 'checkout.completed' && updateCustomerId) {
            try {
              const customerId = event.data?.customer?.id ?? '';
              updateCustomerId(customerId)
                .finally(() => {
                  window.location.href = '/checkout/success';
                });
            } catch (error: unknown) {
              console.error('Error updating customer ID:', error);
            }
          }
        },
        checkout: {
          settings: {
            variant: 'one-page',
            displayMode: 'inline',
            theme: 'dark',
            allowLogout: false,
            frameTarget: 'paddle-checkout-frame',
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background-color: transparent; border: none',
          },
        },
      }).then((paddle) => {
        if (paddle && priceId) {
          setPaddle(paddle);
          paddle.Checkout.open({
            ...(userEmail && { customer: { email: userEmail } }),
            items: [{ priceId: priceId, quantity: 1 }],
          });
        }
      });
    }
  }, [paddle?.Initialized, priceId, userEmail, updateCustomerId, handleCheckoutEvents]);

  useEffect(() => {
    if (paddle && priceId && paddle.Initialized) {
      updateItems(paddle, priceId, quantity);
    }
  }, [paddle, priceId, quantity, updateItems]);


  return (
    <div
      className={
        'rounded-lg md:bg-background/80 md:backdrop-blur-[24px] md:p-10 md:pl-16 md:pt-16 md:min-h-[400px] flex flex-col justify-between relative'
      }
    >
      <CheckoutFormGradients />
      <div className={'flex flex-col md:flex-row gap-8 md:gap-16'}>
        <div className={'w-full md:w-[400px]'}>
          <PriceSection checkoutData={checkoutData} quantity={quantity} />
        </div>
        <div className={'min-w-[375px] lg:min-w-[535px]'}>
          <div className={'text-base leading-[20px] font-semibold mb-8'}>Payment details</div>
          <div className={'paddle-checkout-frame'} />
        </div>
      </div>
    </div>
  );
}