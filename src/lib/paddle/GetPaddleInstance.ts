import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';
import { log } from '@/lib/logger';

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!process.env.PADDLE_API_KEY) {
    log({
      logLevel: 'error',
      action: 'getPaddleInstance',
      message: 'Paddle API key is missing'
    });
  }

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
}