import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
// Use this object to send drizzle queries to your DB
export const db = drizzle(sql);
// Create a pgTable that maps to a table in your DB

export const QuoteGroup = pgTable("quote_group", {
  id: serial("id").primaryKey(),
  createdAt: decimal("created_at", { precision: 15, scale: 0 })
    .$defaultFn(() => Math.floor(new Date().getTime() / 1000).toString())
    .notNull(),
});
export const QuoteSingle = pgTable("quote", {
  id: serial("id").primaryKey(),
  electricityPrice: decimal("electricity_price", {
    precision: 10,
    scale: 4,
  }).notNull(),
  powerOutput: decimal("power_output", { precision: 10, scale: 4 }).notNull(),
  systemSize: decimal("system_size", { precision: 10, scale: 4 }).notNull(),
  zipCode: text("zip_code").notNull(),
  maximumElectricityPrice: decimal("maximum_electricity_price", {
    precision: 10,
    scale: 4,
  }).notNull(),
  protocolFeeValueMultiplier: decimal("protocol_fee_value_multiplier", {
    precision: 10,
    scale: 4,
  }).notNull(),
  startingDateTimestamp: decimal("starting_date_timestamp", {
    precision: 15,
    scale: 0,
  }).notNull(),
  targetTimestamp: decimal("target_timestamp", {
    precision: 15,
    scale: 0,
  }).notNull(),
  decayPerDay: decimal("decay_per_day", { precision: 10, scale: 5 }).notNull(),
  installerFee: decimal("installer_fee", { precision: 10, scale: 4 }).notNull(),
  lat: decimal("lat", { precision: 10, scale: 4 }),
  lon: decimal("lon", { precision: 10, scale: 4 }).notNull(),
  carbonCreditEffectiveness: decimal("carbon_credit_effectiveness", {
    precision: 10,
    scale: 4,
  }).notNull(),
  quote: decimal("quote", { precision: 10, scale: 4 }),
  timestampToBenchmark: decimal("timestamp_to_benchmark", {
    precision: 15,
    scale: 0,
  }).notNull(),
  quoteGroupId: serial("quote_group_id")
    .references(() => QuoteGroup.id)
    .notNull(),
});

export const quoteGroupRelations = relations(QuoteGroup, ({ many }) => ({
  quotes: many(QuoteSingle),
}));

export const quoteSingleRelations = relations(QuoteSingle, ({ one }) => ({
  quoteGroup: one(QuoteGroup, {
    fields: [QuoteSingle.quoteGroupId],
    references: [QuoteGroup.id],
  }),
}));

const InsertQuoteGroupSchema = createInsertSchema(QuoteGroup);
export type InsertQuoteGroup = z.infer<typeof InsertQuoteGroupSchema>;
const InsertQuoteSingleSchema = createInsertSchema(QuoteSingle);
export type InsertQuoteSingle = z.infer<typeof InsertQuoteSingleSchema>;
// export const createQuoteGroup;

type CreateGroupArgs = {
  quotes: InsertQuoteSingle[];
};
export async function createQuoteGroup(data: CreateGroupArgs) {
  const groupId = generateRandomNumber(0, 1_000_000_000);
  data.quotes.forEach((quote) => {
    quote.quoteGroupId = groupId;
  });
  await db.transaction(async (tx) => {
    const group = await tx.insert(QuoteGroup).values({ id: groupId });
    const quotes = await tx.insert(QuoteSingle).values(data.quotes);
  });
}

const generateRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
