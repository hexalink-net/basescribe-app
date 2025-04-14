import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
  } from '@paddle/paddle-node-sdk';
import { createClient, updateUserSubscriptionSSR } from '@/lib/supabase/server';
import { LinkGetCustomerInfoPaddle } from '@/constants/paddleUrl';

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
        case EventName.SubscriptionUpdated:
          await this.updateSubscriptionData(eventData);
          break;
        case EventName.CustomerCreated:
        case EventName.CustomerUpdated:
          await this.updateCustomerData(eventData);
          break;
      }
}

    //make new function for subscription cancelled
    //make new function for subscription renewal
    //make new function for subscription past due
    //make new function for customer created
    //make new function for customer updated
  
private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) { //change to subscription activated
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
        
      const {error} = await updateUserSubscriptionSSR(
            supabase,
            customer.data.email,
            eventData.data.customerId,
            eventData.data.items[0].price?.productId ?? '',
            eventData.data.items[0].price?.id ?? '',
            eventData.data.id,
            eventData.data.currentBillingPeriod?.startsAt ?? '',
            eventData.data.currentBillingPeriod?.endsAt ?? ''
      );
        
      if (error) {
        throw error;
      }
        
      console.log('Subscription updated successfully');
    } catch (e) {
      console.error(e);
    }
}
  
private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    try {
      const supabase = await createClient();
      const response = await supabase
        .from('customers')
        .upsert({
            customer_id: eventData.data.id,
            email: eventData.data.email,
          })
          .select();
        console.log(response);
      } catch (e) {
        console.error(e);
      }
    }
}  