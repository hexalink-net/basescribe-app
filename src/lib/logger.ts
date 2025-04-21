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
  logLevel = 'info',
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

    const logContext = logger.child({userId: userId, message: message, metadata: metadata});

    if (logger[logLevel]) {
      logger[logLevel](logContext, message); // Common pattern: context object first, then message string
    } else {
      // Fallback if an invalid level string was somehow passed
      logger.info(logContext, `[Fallback Log Level: ${logLevel}] ${message}`);
    }
}