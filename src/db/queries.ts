// export const createQuoteGroup;

import { eq } from "drizzle-orm";
import {
  ApprovedQuoteGroup,
  InsertQuoteGroup,
  InsertQuoteSingle,
  QuoteGroup,
  QuoteSingle,
  TotalBudgetGranted,
} from "./schema";
import { db } from "./db";
import { sql } from "drizzle-orm";

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
export type ReturnTypeOfGetQuoteGroup = Awaited<
  ReturnType<typeof getQuoteGroup>
>;
export async function getApprovedQuoteGroups() {
  const res = await db.query.ApprovedQuoteGroup.findMany({
    with: {
      quoteGroup: {
        with: {
          quotes: true,
        },
      },
    },
  });
  return res;
}

export type ReturnTypeOfGetApprovedQuoteGroups = Awaited<
  ReturnType<typeof getApprovedQuoteGroups>
>;

export async function approveQuoteGroup(id: number) {
  await db.transaction(async (tx) => {
    const quoteGroupId = await tx.query.QuoteGroup.findFirst({
      where: (quoteGroup, { eq }) => eq(quoteGroup.id, id),
      with: {
        quotes: true,
      },
    });
    if (!quoteGroupId) throw new Error("Quote group not found");
    const firstQuoteAmount = parseFloat(quoteGroupId.quotes[0].quote!);

    await tx.insert(ApprovedQuoteGroup).values({
      quoteGroupId: id,
    });
    await tx
      .insert(TotalBudgetGranted)
      .values({
        amount: `${firstQuoteAmount}`,
        id: 1,
      })
      .onConflictDoUpdate({
        target: TotalBudgetGranted.id,
        set: {
          amount: sql`${TotalBudgetGranted.amount} + ${firstQuoteAmount}`,
        },
      });
  });
  return { success: true };
}
export type ReturnTypeOfApproveQuoteGroup = Awaited<
  ReturnType<typeof approveQuoteGroup>
>;

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
