import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLoggerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (req.user) {
      const action = req.method;
      const model = req.path.split('/')[1];
      const metaData = {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        statusCode: res.statusCode,
      };

      prisma.auditLog
        .create({
          data: {
            userId: req.user.id,
            action,
            model,
            metaData,
          },
        })
        .catch((error) => {
          console.error('Audit logging failed:', error);
        });
    }

    return originalSend.call(this, body);
  };

  next();
}; 