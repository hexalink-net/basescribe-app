import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { log } from '@/lib/logger';

// While the webhook route does verify signatures (good!), it lacks:
// - IP address validation to restrict webhook sources
// - Rate limiting to prevent DoS attacks
// - Replay attack protection (no timestamp or nonce validation)

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.text();

  let eventName: string | null = null;

  if (!rawRequestBody) {
    log({
      logLevel: 'error',
      action: 'Webhook POST',
      message: 'Missing request body',
      metadata: { body: !!rawRequestBody }
    });
    return new Response(JSON.stringify({ error: 'Missing signature or body' }), {
      status: 400,
    });
  }

  try {
    const eventData = JSON.parse(rawRequestBody);

    if (!eventData) {
      log({
        logLevel: 'error',
        action: 'Webhook POST',
        message: 'Webhook payload could not be unmarshalled',
        metadata: { requestBody: rawRequestBody }
      });
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        status: 400,
      });
    }

    console.log(eventData)

    revalidatePath(`/dashboard`)

    return new Response(JSON.stringify({ event: eventName }), {
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'Webhook POST ProcessEvent',
      message: 'Webhook processing failed',
      metadata: { error: errorMessage, requestBody: rawRequestBody }
    });

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { message: errorMessage }),
      }),
      { status: 500 }
    );
  }
}