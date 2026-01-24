import {
  customType,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const Users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull(),
  created: timestamp().defaultNow(),
});

export const Links = pgTable("links", {
  id: serial().primaryKey(),
  url: text().notNull(),
  title: text(),
  created: timestamp().defaultNow(),
  owner: uuid()
    .notNull()
    .references(() => Users.id),
});

export const UrlMetadata = pgTable("url_metadata", {
  url: text().primaryKey(),
  title: text(),
  thumbnail: bytea(),
});
