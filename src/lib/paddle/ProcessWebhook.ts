import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
  } from '@paddle/paddle-node-sdk';
  import { createClient, updateUserSubscriptionSSR } from '@/lib/supabase/server';
  
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
  
    private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
      try {
        const supabase = await createClient();
        
        await updateUserSubscriptionSSR(
            supabase,
            eventData.data.customerId,
            eventData.data.items[0].price?.productId ?? '',
            eventData.data.items[0].price?.id ?? '',
            eventData.data.id,
            eventData.data.currentBillingPeriod?.startsAt ?? '',
            eventData.data.currentBillingPeriod?.endsAt ?? ''
        );
        
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