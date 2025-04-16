import pino, { LoggerOptions, Level } from 'pino';

// Define log level type from pino
type LogLevel = Level;

// Determine if we are in a browser environment
const isBrowser = typeof window !== 'undefined';

interface LogOptions {
  logLevel?: LogLevel;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

export const log = ({
  logLevel,
  action,
  message,
  metadata,
  userId,
}: LogOptions) => {
    
    const pinoOption: LoggerOptions = {
        level: logLevel,
        base: {
            service: 'basescribe-app'
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        enabled: !isBrowser,
        transport: undefined
      }

    const logger = pino(pinoOption);

    const logOutput = logger.child({userId: userId, message: message, metadata: metadata});

    logOutput.info(action);
}
