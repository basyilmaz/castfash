import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LogContext {
  userId?: number;
  organizationId?: number;
  requestId?: string;
  ip?: string;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: LogContext;
  stack?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;
  private logDir: string;
  private isDev: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.logLevel =
      (process.env.LOG_LEVEL as LogLevel) || (this.isDev ? 'debug' : 'info');
    this.logDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'verbose'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
    data?: LogContext,
    stack?: string,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.context,
      data,
      stack,
    };
  }

  private writeToFile(entry: LogEntry) {
    if (this.isDev) return; // Don't write to file in development

    const date = new Date().toISOString().split('T')[0];
    const filename = `${entry.level}-${date}.log`;
    const filepath = path.join(this.logDir, filename);
    const line = JSON.stringify(entry) + '\n';

    fs.appendFile(filepath, line, (err) => {
      if (err) console.error('Failed to write log:', err);
    });

    // Also write all logs to combined file
    const combinedPath = path.join(this.logDir, `combined-${date}.log`);
    fs.appendFile(combinedPath, line, (err) => {
      if (err) console.error('Failed to write combined log:', err);
    });
  }

  private colorize(level: LogLevel, text: string): string {
    if (!this.isDev) return text;

    const colors: Record<LogLevel, string> = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[32m', // Green
      debug: '\x1b[36m', // Cyan
      verbose: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    return `${colors[level]}${text}${reset}`;
  }

  private printToConsole(entry: LogEntry) {
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const levelStr = entry.level.toUpperCase().padEnd(7);
    const time = entry.timestamp.split('T')[1].split('.')[0];

    let output = `${time} ${this.colorize(entry.level, levelStr)} ${contextStr} ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      output += ` ${JSON.stringify(entry.data)}`;
    }

    console.log(output);

    if (entry.stack) {
      console.log(this.colorize('error', entry.stack));
    }
  }

  private logMessage(
    level: LogLevel,
    message: any,
    context?: string,
    data?: LogContext,
    stack?: string,
  ) {
    if (!this.shouldLog(level)) return;

    const msgStr =
      typeof message === 'string' ? message : JSON.stringify(message);
    const entry = this.formatMessage(level, msgStr, context, data, stack);

    this.printToConsole(entry);
    this.writeToFile(entry);
  }

  // Standard NestJS LoggerService methods
  log(message: any, context?: string) {
    this.logMessage('info', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.logMessage('error', message, context, undefined, trace);
  }

  warn(message: any, context?: string) {
    this.logMessage('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.logMessage('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.logMessage('verbose', message, context);
  }

  // Enhanced logging methods with context data
  logWithContext(
    level: LogLevel,
    message: string,
    data: LogContext,
    context?: string,
  ) {
    this.logMessage(level, message, context, data);
  }

  // Request logging
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    data?: LogContext,
  ) {
    const level: LogLevel =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.logMessage(level, `${method} ${path} ${statusCode}`, 'HTTP', {
      ...data,
      method,
      path,
      statusCode,
      duration,
    });
  }

  // AI Generation logging
  logGeneration(
    organizationId: number,
    provider: string,
    success: boolean,
    duration: number,
    error?: string,
  ) {
    const level: LogLevel = success ? 'info' : 'error';
    this.logMessage(
      level,
      `AI Generation ${success ? 'succeeded' : 'failed'}`,
      'AI',
      {
        organizationId,
        provider,
        success,
        duration,
        error,
      },
    );
  }

  // Credit transaction logging
  logCreditTransaction(
    organizationId: number,
    type: string,
    amount: number,
    note?: string,
  ) {
    this.logMessage('info', `Credit ${type}: ${amount}`, 'CREDITS', {
      organizationId,
      type,
      amount,
      note,
    });
  }

  // Security event logging
  logSecurityEvent(
    event: string,
    userId?: number,
    ip?: string,
    success: boolean = true,
    details?: any,
  ) {
    const level: LogLevel = success ? 'info' : 'warn';
    this.logMessage(level, `Security: ${event}`, 'SECURITY', {
      userId,
      ip,
      success,
      ...details,
    });
  }

  // Queue event logging
  logQueueEvent(event: string, jobId: string, data?: any) {
    this.logMessage('debug', `Queue: ${event}`, 'QUEUE', {
      jobId,
      ...data,
    });
  }
}

// Singleton instance for global use
let globalLogger: AppLogger | null = null;

export function getLogger(): AppLogger {
  if (!globalLogger) {
    globalLogger = new AppLogger();
  }
  return globalLogger;
}
