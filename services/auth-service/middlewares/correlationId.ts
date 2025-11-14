import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const addCorrelationId = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req['correlationId'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};
