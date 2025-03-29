import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data:;
      font-src 'self' data:;
      connect-src 'self' 
        https://your-supabase-url.supabase.co 
        https://*.supabase.co;  /* Allow all Supabase services */
      frame-src 'none';
    `.replace(/\s{2,}/g, ' '), // Minify CSP
  },
];

//add runpod api connect later

const nextConfig: NextConfig = {
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)", // Apply to all pages
  //       headers: securityHeaders,
  //     },
  //   ];
  // },
};

export default nextConfig;
