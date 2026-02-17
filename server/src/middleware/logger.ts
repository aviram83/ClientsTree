import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    const bodyToLog = { ...req.body };
    if (bodyToLog.password) {
      bodyToLog.password = '******';
    }
    console.log('Request Body:', bodyToLog);
  }
  next();
};
