"use server"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { log } from "@/lib/logger";
import { z } from "zod";
import { authRateLimiter } from "@/lib/upstash/ratelimit";
import { headers } from "next/headers";

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ? process.env.NEXT_PUBLIC_WEBSITE_URL : 'https://beta.basescribe.app';

const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long")
});

async function checkAuthRateLimit() {
    const ip = (await headers()).get('x-forwarded-for') ?? '';
    const { success } = await authRateLimiter.limit(ip);

    if (!success) {
        throw new Error('Too many requests. Please try again in a few minutes.');
    }
}

// Google OAuth sign-in
export async function signInWithGoogle() {
    await checkAuthRateLimit();
    // Make sure the redirect URL is absolute and includes the origin
    const supabase = await createClient();
    const redirectUrl = `${PUBLIC_URL}/auth/callback`;

    log({
        logLevel: 'info',
        action: 'signInWithGoogle',
        message: 'Google auth redirect',
    });
        
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (data.url) {
        redirect(data.url)
    }
        
    if (error) {
        log({
            logLevel: 'error',
            action: 'signInWithGoogle',
            message: error.message
        })
        
        throw new Error(error.message);
    }
}

// Email/password sign-in
export async function signInWithEmailPassword(formData: FormData) {
    await checkAuthRateLimit();
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = userLoginSchema.safeParse({ email: email, password: password });

    if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        return { error: errorMessage }
    }
  
    const supabase = await createClient()

    log({
        logLevel: 'info',
        action: 'signInWithEmailPassword',
        message: 'Email and password sign-in',
    });

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
  
    if (error) {
        log({
            logLevel: 'error',
            action: 'signInWithEmailPassword',
            message: error.message
        })
        
        return { error: error.message }
    }
  
    // We don't need to set cookies manually in server actions
    // The Supabase client will handle this for us through its cookie handling
    // Just return success and let the client redirect
  
    return { success: true }
}

// Email/password sign-up
export async function signUpWithEmailPassword(formData: FormData) {
    await checkAuthRateLimit();
    const email = formData.get('email') as string
    const password = formData.get('password') as string
  
    const result = userLoginSchema.safeParse({ email: email, password: password });

    if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        return { error: errorMessage }
    }
  
    const redirectUrl = `${PUBLIC_URL}/auth/callback`
    const supabase = await createClient()

    log({
        logLevel: 'info',
        action: 'signUpWithEmailPassword',
        message: 'Email and password sign-up'
    });
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectUrl,
        }
    })
  
    if (error) {
        log({
            logLevel: 'error',
            action: 'signUpWithEmailPassword',
            message: error.message
        })
        return { error: error.message }
    }
  
    if (data.user?.user_metadata.email_verified === false) {
        return { 
            success: true,
            title: "Check your email",
            message: "We've sent you a confirmation link to complete your signup."
        }
    } else {
        return { 
            success: false,
            title: "User already registered",
            message: "Please try to sign in"
        }
    }
}

// Sign out
export async function signOut() {
    const supabase = await createClient()
    const { error } =await supabase.auth.signOut()

    if (error) {
        log({
            logLevel: 'error',
            action: 'signOut',
            message: error.message
        })
    }
}