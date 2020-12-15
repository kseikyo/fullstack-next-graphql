import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import cors from "cors";

import Redis from "ioredis";

import session from "express-session";
import connectRedis from "connect-redis";


const main = async () => {
  // Connect to database
  const orm = await MikroORM.init(microConfig);
  // Run migrations
  await orm.getMigrator().up();

  const app = express();

  // Redis connection
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  // middleware to use redis to store the session cookie
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years of duration
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "supersecret",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: () => {},
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(process.env.PORT || 3333, () => {
    console.log("server started");
  });
};

main().catch((err) => {
  console.log(err);
});
