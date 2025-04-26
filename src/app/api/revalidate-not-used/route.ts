import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { log } from "@/lib/logger";

// This is the webhook endpoint that Supabase will call when data changes
export async function POST(request: NextRequest) {
  // Verify the webhook is coming from Supabase using a secret key
  const authHeader = request.headers.get("authorization");
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    log({
      logLevel: 'error',
      action: 'revalidateWebhook',
      message: 'SUPABASE_WEBHOOK_SECRET is not configured'
    });
    return new Response("Server configuration error", { status: 500 });
  }

  if (authHeader !== `Bearer ${webhookSecret}`) {
    log({
      logLevel: 'warn',
      action: 'revalidateWebhook',
      message: 'Unauthorized webhook attempt',
      metadata: { authHeader }
    });
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Parse the request body to get the table and record information
    const payload = await request.json();
    const tableName = payload.table || request.nextUrl.searchParams.get("table");
    const record = payload.record || {};
    const userId = record.user_id;

    console.log(payload)
    
    if (!tableName) {
      return new Response("No table name provided", { status: 400 });
    }
    
    if (tableName !== "uploads" && tableName !== "folders") {
      return new Response("Invalid table name", { status: 400 });
    }

    // Use granular tag revalidation if we have a user ID
    if (userId) {
      log({
        logLevel: 'info',
        action: 'revalidateWebhook',
        message: `Revalidating ${tableName} for user ${userId}`
      });
      
      // Revalidate the user-specific tag
      revalidateTag(`${tableName}`);
    } else {
      // Fallback to general tag if no user ID is available
      log({
        logLevel: 'info',
        action: 'revalidateWebhook',
        message: `Revalidating all ${tableName}`
      });
      
      revalidateTag(tableName);
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'revalidateWebhook',
      message: 'Error processing webhook',
      metadata: { error }
    });
    
    return new Response("Internal Server Error", { status: 500 });
  }
}