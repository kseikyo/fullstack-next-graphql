import { __prod__ } from "./contants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "lireddit",
  user: "postgres",
  password: "VAPihhxNS8YcnnAMWeXokmF9eceBgyUpiJe2vXG8",
  type: "postgresql",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
// exporting as Parameters gives us an array, and its type is the typeof mikroORM.init
// this gives proper typing definitions and autocompletion
