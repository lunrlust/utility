import winston from 'winston';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

const logDir = path.join(os.homedir(), '.lunrlust', 'logs');

export function initLogger() {
  // Create log directory if it doesn't exist
  fs.ensureDirSync(logDir);

  // Create a timestamp for the log file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFilePath = path.join(logDir, `lunrlust-${timestamp}.log`);

  // Configure winston logger
  const logger = winston.createLogger({
    level: 'info',
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
      level: 'debug'
    }));
  }

  logger.info('Logger initialized');
  
  return logger;
}

export function getLogger() {
  return winston.loggers.get('default');
}