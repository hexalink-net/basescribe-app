import {
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent
  } from '@paddle/paddle-node-sdk';
import { createClient, updateUserSubscriptionSSR, renewedSubscriptionStatusSSR } from '@/lib/supabase/server';
import { LinkGetCustomerInfoPaddle } from '@/constants/PaddleUrl';

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
      const supabase = await createClient();
      const getCustomerInfoPaddleUrl = `${LinkGetCustomerInfoPaddle}/${eventData.data.customerId}`;

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
        console.error('Failed to fetch Paddle customer:', await res.text());
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
        
      console.log('Subscription created successfully');
    } catch (error) {
      console.error('Error creating subscription:', error);

      throw new Error('Failed to create subscription');
    }
}

  private async renewedSubscriptionStatus(eventData: SubscriptionUpdatedEvent) {
    try {
      const supabase = await createClient();
      let planStartDate: string | null = eventData.data.currentBillingPeriod?.startsAt ?? null;
      let planEndDate: string | null = eventData.data.currentBillingPeriod?.endsAt ?? null;

      if (eventData.data.status === 'past_due' || eventData.data.status === 'canceled') {
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
        
      console.log('Subscription renewed successfully');
    } catch (error) {
      console.error('Error renewing subscription:', error);

      throw new Error('Failed to renew subscription');
    }
  }
}