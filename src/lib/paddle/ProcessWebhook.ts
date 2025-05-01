import {
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
    TransactionCompletedEvent,
    SubscriptionCanceledEvent
  } from '@paddle/paddle-node-sdk';
import { createClient, updateUserSubscriptionSSR, renewedSubscriptionStatusSSR, renewedMonthlyUsageSSR, cancelSubscriptionSSR } from '@/lib/supabase/server';
import { LinkGetCustomerInfoPaddle } from '@/constants/PaddleUrl';
import { log } from '@/lib/logger';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

interface PaddleCustomerResponse {
  data: {
      id: string;
      status: 'active' | 'archived' | 'deleted';
      custom_data: Record<string, unknown> | null;
      name: string;
      email: string;
      marketing_consent: boolean;
      locale: string;
      created_at: string; // ISO timestamp
      updated_at: string; // ISO timestamp
      import_meta: string | null; // adjust type if needed
    };
    meta: {
      request_id: string;
    };
}

const paddleWebhookSubscriptionSchema = z.object({
  data: z.object({
    customerId: z.string(),
    id: z.string(), // subscription ID
    status: z.string(),
    currentBillingPeriod: z
      .object({
        startsAt: z.string(),
        endsAt: z.string(),
      })
      .nullable(),
    items: z
      .array(
        z.object({
          price: z
            .object({
              productId: z.string(),
              id: z.string(),
            })
        })
      )
      .min(1),
  }),
});

const paddleWebhookTransactionSchema = z.object({
  eventId: z.string(),
  notificationId: z.string(),
  eventType: z.literal('transaction.completed'),
  occurredAt: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    customerId: z.string(),
    currencyCode: z.string(),
    subscriptionId: z.string(),
    billingPeriod: z.object({
      startsAt: z.string(),
      endsAt: z.string()
    }),
    billedAt: z.string()
  })
});
  
export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.SubscriptionUpdated:
        await this.renewedSubscriptionStatus(eventData);
        break;
      case EventName.TransactionCompleted:
        await this.renewedMonthlyUsage(eventData);
        break;
      case EventName.SubscriptionCanceled:
        await this.cancelSubscription(eventData);
        break;
    }
  }
  
  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent) {
    try {
      log({
        logLevel: 'info',
        action: 'updateSubscriptionData',
        message: 'Processing subscription creation event'
      });

      const validateInput = paddleWebhookSubscriptionSchema.safeParse(eventData);

      if (!validateInput.success) {
        const errorMessage = validateInput.error.issues[0].message;
        throw new Error(errorMessage);
      }

      const supabase = await createClient();
      const getCustomerInfoPaddleUrl = `${LinkGetCustomerInfoPaddle}${eventData.data.customerId}`;

      const res = await fetch(getCustomerInfoPaddleUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
      });
      
      if (!res.ok) {
        log({
          logLevel: 'error',
          action: 'updateSubscriptionData',
          message: 'Failed to fetch Paddle customer',
          metadata: {
            response: await res.text()
          }
        });
        throw new Error('Failed to fetch Paddle customer');
      }
        
      const customer: PaddleCustomerResponse = await res.json();
        
      const {data, error: updateError} = await updateUserSubscriptionSSR(
            supabase,
            customer.data.email,
            eventData.data.customerId,
            eventData.data.items[0].price?.productId ?? '',
            eventData.data.items[0].price?.id ?? '',
            eventData.data.id,
            eventData.data.status,
            eventData.data.currentBillingPeriod?.startsAt ?? '',
            eventData.data.currentBillingPeriod?.endsAt ?? ''
      );
        
      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error('Failed to fetch user ID');
      }

      const userId = typeof data === 'string' ? data : 
                    Array.isArray(data) && data[0] ? data[0].found_user_id : null;

      if (!userId) {
        throw new Error('Failed to extract user ID from response');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${userId}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'updateSubscriptionData',
        message: (error as Error).message,
        metadata: {
          error: error
        }
      });

      throw new Error('Failed to create subscription');
    }
}

  private async renewedSubscriptionStatus(eventData: SubscriptionUpdatedEvent) {
    try {
      log({
        logLevel: 'info',
        action: 'renewedSubscriptionStatus',
        message: 'Processing subscription update event'
      });

      const validateInput = paddleWebhookSubscriptionSchema.safeParse(eventData);

      if (!validateInput.success) {
        const errorMessage = validateInput.error.issues[0].message;
        throw new Error(errorMessage);
      }

      const supabase = await createClient();
      const planStartDate: string | null = eventData.data.currentBillingPeriod?.startsAt ?? null;
      const planEndDate: string | null = eventData.data.currentBillingPeriod?.endsAt ?? null;
        
      const {data,error: updateError} = await renewedSubscriptionStatusSSR(
            supabase,
            eventData.data.customerId,
            eventData.data.id,
            eventData.data.status,
            planStartDate,
            planEndDate,
      );
        
      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error('Failed to fetch user ID');
      }

      const userId = typeof data === 'string' ? data : 
                    Array.isArray(data) && data[0] ? data[0].found_user_id : null;

      if (!userId) {
        throw new Error('Failed to extract user ID from response');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${userId}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'renewedSubscriptionStatus',
        message: (error as Error).message,
        metadata: {
          error: error
        }
      });

      throw new Error('Failed to renew subscription');
    }
  }

  private async renewedMonthlyUsage(eventData: TransactionCompletedEvent) {
    try {
      log({
        logLevel: 'info',
        action: 'renewedMonthlyUsage',
        message: 'Processing transaction completion event'
      });

      const validateInput = paddleWebhookTransactionSchema.safeParse(eventData);

      if (!validateInput.success) {
        const errorMessage = validateInput.error.issues[0].message;
        throw new Error(errorMessage);
      }

      const supabase = await createClient();

      // Ensure customerId is not null before proceeding
      if (!eventData.data.customerId || !eventData.data.subscriptionId) {
        throw new Error('Customer ID or Subscription ID is missing in the event data');
      }

      const {data, error: updateError} = await renewedMonthlyUsageSSR(
        supabase,
        eventData.data.customerId,
        eventData.data.subscriptionId
      );
        
      if (updateError) {
        throw updateError;
      }


      if (!data) {
        throw new Error('Failed to fetch user ID');
      }

      const userId = typeof data === 'string' ? data : 
                    Array.isArray(data) && data[0] ? data[0].found_user_id : null;

      if (!userId) {
        throw new Error('Failed to extract user ID from response');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${userId}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'renewedMonthlyUsage',
        message: (error as Error).message,
        metadata: {
          error: error
        }
      });

      throw new Error('Failed to renew monthly usage');
    }
  }

  private async cancelSubscription(eventData: SubscriptionCanceledEvent) {
    try {
      log({
        logLevel: 'info',
        action: 'cancelSubscription',
        message: 'Processing subscription cancellation event'
      });

      const validateInput = paddleWebhookSubscriptionSchema.safeParse(eventData);

      if (!validateInput.success) {
        const errorMessage = validateInput.error.issues[0].message;
        throw new Error(errorMessage);
      }

      const supabase = await createClient();
      const {data, error: updateError} = await cancelSubscriptionSSR(
        supabase,
        eventData.data.customerId,
        eventData.occurredAt
      );

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error('Failed to fetch user ID');
      }

      const userId = typeof data === 'string' ? data : 
                    Array.isArray(data) && data[0] ? data[0].found_user_id : null;

      if (!userId) {
        throw new Error('Failed to extract user ID from response');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${userId}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'cancelSubscription',
        message: (error as Error).message,
        metadata: {
          error: error
        }
      });

      throw new Error('Failed to cancel subscription');
    }
  }
}