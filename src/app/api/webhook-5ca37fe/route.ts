import { NextRequest } from 'next/server';
import { ProcessWebhook } from '@/lib/paddle/ProcessWebhook';
import { getPaddleInstance } from '@/lib/paddle/GetPaddleInstance';

const webhookProcessor = new ProcessWebhook();

// While the webhook route does verify signatures (good!), it lacks:
// - IP address validation to restrict webhook sources
// - Rate limiting to prevent DoS attacks
// - Replay attack protection (no timestamp or nonce validation)

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!;

  let eventName: string | null = null;

  if (!signature || !rawRequestBody) {
    console.error('Missing signature or request body');
    return new Response(JSON.stringify({ error: 'Missing signature or body' }), {
      status: 400,
    });
  }

  try {
    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);

    if (!eventData) {
      console.warn('Webhook payload could not be unmarshalled');
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        status: 400,
      });
    }

    eventName = eventData?.eventType ?? 'Unknown event';

    await webhookProcessor.processEvent(eventData);

    return new Response(JSON.stringify({ event: eventName }), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Webhook processing failed:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { message: error }),
      }),
      { status: 500 }
    );
  }
}
