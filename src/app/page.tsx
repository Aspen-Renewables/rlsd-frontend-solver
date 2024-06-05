import Image from "next/image";
import View, { Estimate } from "./view";
import { db } from "@/db/db";
import { getQuoteGroup } from "@/db/queries";
export default async function Home({
  searchParams,
}: {
  searchParams: {
    groupId?: string;
  };
}) {
  let estimates: Estimate[] | null = null;
  if (searchParams.groupId) {
    const groupId = parseInt(searchParams.groupId);
    const group = await getQuoteGroup(groupId);
    if (!group) return;
    const _estimates = group.quotes.map((quote) => ({
      timestamp: parseInt(quote.timestampToBenchmark),
      estimate: parseFloat(quote.quote!),
    }));
    estimates = _estimates;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <View estimates={estimates} />
    </main>
  );
}
