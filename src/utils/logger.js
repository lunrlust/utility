import winston from 'winston';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

const logDir = path.join(os.homedir(), '.lunrlust', 'logs');

let logger = null;

export function initLogger() {
  // Only initialize once
  if (logger) {
    return logger;
  }

  // Create log directory if it doesn't exist
  fs.ensureDirSync(logDir);

  // Create a timestamp for the log file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFilePath = path.join(logDir, `lunrlust-${timestamp}.log`);

  // Configure winston logger
  logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'lunrlust' },
    transports: [
      // Write to log file
      new winston.transports.File({ 
        filename: logFilePath,
        level: 'info'
      }),
      // Write errors to separate file
      new winston.transports.File({ 
        filename: path.join(logDir, `lunrlust-error-${timestamp}.log`), 
        level: 'error' 
      })
    ]
  });

  // Add console transport for development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'warn' // Only show warnings and errors in console
    }));
  }
  
  return logger;
}

export function getLogger() {
  return logger || initLogger();
}