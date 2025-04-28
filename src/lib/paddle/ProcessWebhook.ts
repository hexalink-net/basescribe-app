import {
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent
  } from '@paddle/paddle-node-sdk';
import { createClient, updateUserSubscriptionSSR, renewedSubscriptionStatusSSR } from '@/lib/supabase/server';
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

const paddleWebhookSchema = z.object({
  data: z.object({
    customer_id: z.string(),
    id: z.string(), // subscription ID
    status: z.string(),
    current_billing_period: z
      .object({
        starts_at: z.string(),
        ends_at: z.string(),
      })
      .nullable(),
    items: z
      .array(
        z.object({
          price: z
            .object({
              product_id: z.string(),
              id: z.string(),
            })
        })
      )
      .min(1),
  }),
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
    }
  }
  
  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent) {
    try {
      log({
        logLevel: 'info',
        action: 'updateSubscriptionData',
        message: 'Processing subscription creation event'
      });

      const validateInput = paddleWebhookSchema.safeParse(eventData);

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
          next: { revalidate: 0 }, // disables caching
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
        
      const {error: updateError} = await updateUserSubscriptionSSR(
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

      const {data: profileData, error: profileError} = await supabase.from('users').select('id').eq('email', customer.data.email).single();
      
      if (profileError) {
        log({
          logLevel: 'error',
          action: 'updateSubscriptionData',
          message: 'Failed to fetch user profile',
          metadata: { error: profileError }
        });
        throw new Error('Failed to fetch user profile');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${profileData.id}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'updateSubscriptionData',
        message: 'Error creating subscription',
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

      const validateInput = paddleWebhookSchema.safeParse(eventData);

      if (!validateInput.success) {
        const errorMessage = validateInput.error.issues[0].message;
        throw new Error(errorMessage);
      }

      const supabase = await createClient();
      let planStartDate: string | null = eventData.data.currentBillingPeriod?.startsAt ?? null;
      let planEndDate: string | null = eventData.data.currentBillingPeriod?.endsAt ?? null;

      if (eventData.data.status === 'past_due') {
        planEndDate = null;
        planStartDate = null;  
      }
        
      const {error: updateError} = await renewedSubscriptionStatusSSR(
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

      const {data: profileData, error: profileError} = await supabase.from('users').select('id').eq('customer_id', eventData.data.customerId).single();
      
      if (profileError) {
        log({
          logLevel: 'error',
          action: 'renewedSubscriptionStatus',
          message: 'Failed to fetch user profile',
          metadata: { error: profileError }
        });
        throw new Error('Failed to fetch user profile');
      }

      //Revalidate the profile tag to refresh the profile
      revalidateTag(`profile-${profileData.id}`);

    } catch (error) {
      log({
        logLevel: 'error',
        action: 'renewedSubscriptionStatus',
        message: 'Error renewing subscription',
        metadata: {
          error: error
        }
      });

      throw new Error('Failed to renew subscription');
    }
  }
}

//add every time transaction complete reset monthly usage and daily usage, last quota updated to 1 month after

//when subscription is cancelled, reset back to free tier (product_id, price_id, subscription_id, status, plan start date, plan end date)