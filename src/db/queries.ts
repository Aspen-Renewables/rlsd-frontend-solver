// export const createQuoteGroup;

import { eq } from "drizzle-orm";
import {
  InsertQuoteGroup,
  InsertQuoteSingle,
  QuoteGroup,
  QuoteSingle,
} from "./schema";
import { db } from "./db";

type CreateGroupArgs = {
  group: InsertQuoteGroup;
  quotes: InsertQuoteSingle[];
};
export async function createQuoteGroup(data: CreateGroupArgs) {
  const groupId = generateRandomNumber(0, 1_000_000_000);
  data.group.id = groupId;
  data.quotes.forEach((quote) => {
    quote.quoteGroupId = groupId;
  });

  await db.transaction(async (tx) => {
    await tx.insert(QuoteGroup).values(data.group);
    await tx.insert(QuoteSingle).values(data.quotes);
  });

  return {
    quoteGroupId: groupId,
  };
}

export async function getQuoteGroup(id: number) {
  const res = await db.query.QuoteGroup.findFirst({
    where: (quoteGroup, { eq }) => eq(quoteGroup.id, id),
    with: {
      quotes: true,
    },
  });

  return res;
}

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
