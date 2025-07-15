import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const UPSTASH_URL = "https://*.upstash.io"; 
const PADDLE_URL = "https://*.paddle.com";
const PADDLE_CDN = process.env.PADDLE_CDN;
const GOOGLE_USER_CONTENT = process.env.GOOGLE_USER_CONTENT;
const PADDLE_CHECKOUT = process.env.PADDLE_CHECKOUT;
const DATADOG_BROWSER_AGENT = "https://www.datadoghq-browser-agent.com";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://apis.google.com ${PADDLE_CDN} ${DATADOG_BROWSER_AGENT} https://cdn.paddle.com;
      style-src 'self' 'unsafe-inline' ${PADDLE_CDN};
      img-src 'self' data: blob: ${GOOGLE_USER_CONTENT};
      font-src 'self' data:;
      media-src 'self' blob:;
      connect-src 'self' ${SUPABASE_URL} https://*.supabase.co ${UPSTASH_URL} ${PADDLE_URL};
      frame-src 'self' https://accounts.google.com ${PADDLE_CHECKOUT};
    `.replace(/\s{2,}/g, " ").trim(),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/api/webhook-5ca37fe",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.6",
  },
};

export default nextConfig;
