"use server"
import { createClient, createNewUserSSR } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ? process.env.NEXT_PUBLIC_WEBSITE_URL : "https://basescribe-app.vercel.app/"

// Google OAuth sign-in
export async function signInWithGoogle() {
    // Make sure the redirect URL is absolute and includes the origin
    const supabase = await createClient();
    const redirectUrl = `${PUBLIC_URL}/auth/callback`;
    console.log('Google auth redirect URL:', redirectUrl);
        
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (data.url) {
        redirect(data.url)
    }
        
    if (error) throw error;
}

// Email/password sign-in
export async function signInWithEmailPassword(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
  
    if (!email || !password) {
        return { error: "Email and password are required" }
    }
  
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
  
    if (error) {
        return { error: error.message }
    }
  
    // We don't need to set cookies manually in server actions
    // The Supabase client will handle this for us through its cookie handling
    // Just return success and let the client redirect
  
    return { success: true }
}

// Email/password sign-up
export async function signUpWithEmailPassword(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
  
    if (!email || !password) {
        return { error: "Email and password are required" }
    }
  
    const redirectUrl = `${PUBLIC_URL}/auth/callback`
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectUrl,
        }
    })
  
    if (error) {
        return { error: error.message }
    }
  
    // Create user record in the database
    if (data.user) {
        const { error } = await createNewUserSSR(supabase, data.user.id, email);
        if (error) {
            console.error('Error creating user profile:', error);
            // Continue anyway, as the auth part succeeded
        }
    }
  
    return { 
        success: true,
        message: "Check your email for the confirmation link"
    }
}

// Sign out
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}