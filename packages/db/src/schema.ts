import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth-schema";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const Ngo = pgTable("ngo", (t) => ({
  id: t.varchar({ length: 32 }).notNull().primaryKey(),
  name: t.varchar({ length: 128 }).notNull(),
  emoji: t.varchar({ length: 8 }).notNull(),
  accent: t.varchar({ length: 16 }).notNull(),
  tag: t.varchar({ length: 256 }).notNull(),
  tagline: t.text().notNull(),
  founded: t.integer().notNull(),
  hq: t.varchar({ length: 128 }).notNull(),
  rating: t.varchar({ length: 128 }).notNull(),
  cause: t.varchar({ length: 128 }).notNull(),
  body: t.jsonb().$type<string[]>().notNull(),
  impact: t.jsonb().$type<{ n: string; l: string }[]>().notNull(),
  whereFundsGo: t.text().notNull(),
  sortOrder: t.integer().notNull().default(0),
}));

export const Pact = pgTable("pact", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: t.varchar({ length: 256 }).notNull(),
  durationDays: t.integer().notNull(),
  ngoId: t
    .varchar({ length: 32 })
    .notNull()
    .references(() => Ngo.id),
  stakeCents: t.integer().notNull(),
  status: t
    .varchar({ length: 16 })
    .$type<"pending" | "active" | "completed" | "forfeited">()
    .notNull()
    .default("pending"),
  paymentAuthId: t.varchar({ length: 64 }),
  startDate: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  endDate: t.timestamp({ withTimezone: true }),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

export const Checkin = pgTable("checkin", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  pactId: t
    .uuid()
    .notNull()
    .references(() => Pact.id, { onDelete: "cascade" }),
  dayNumber: t.integer().notNull(),
  status: t
    .varchar({ length: 16 })
    .$type<"pending" | "acquitted" | "guilty" | "skipped">()
    .notNull()
    .default("pending"),
  evidenceKind: t.varchar({ length: 32 }),
  transcript: t.jsonb().$type<unknown[]>(),
  credibility: t.integer().notNull().default(5),
  createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  resolvedAt: t.timestamp({ withTimezone: true }),
}));

export * from "./auth-schema";
