import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import "dotenv/config";

export const db = drizzle(process.env.DATABASE_URL as string, {
  schema,
  logger: false,
});
