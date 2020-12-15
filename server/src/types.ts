import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
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
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Express.Session };
  redis: Redis;
  res: Response;
};
