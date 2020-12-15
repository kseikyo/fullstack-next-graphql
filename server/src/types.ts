import { Request, Response } from "express";
import { Redis } from "ioredis";

// WORKAROUND TODO: Remove when the Express types are updated
declare global {
  namespace Express {
    interface Session {
      userId: any;
    }
  }
}

export type MyContext = {
  req: Request & { session: Express.Session };
  redis: Redis;
  res: Response;
};
