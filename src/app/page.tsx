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
  let zipCode: string | null = null;
  let electricityPrice: number | null = null;
  let systemOutput: number | null = null;
  let isApproved: boolean = false;
  let scoutFee: number = 0;
  if (searchParams.groupId) {
    const groupId = parseInt(searchParams.groupId);
    const group = await getQuoteGroup(groupId);
    if (!group) return;
    const _estimates = group.quotes.map((quote) => ({
      timestamp: parseInt(quote.timestampToBenchmark),
      estimate: parseFloat(quote.quote!),
    }));
    estimates = _estimates;
    scoutFee = parseFloat(group.scoutingFee);
    zipCode = group.zipCode;
    electricityPrice = parseFloat(group.electricityPrice);
    systemOutput = parseFloat(group.powerOutput);
    isApproved = group.approved;
  }
  const estimatesMinusFees = estimates?.map((estimate) => ({
    timestamp: estimate.timestamp,
    estimate: estimate.estimate * (1 - scoutFee),
  })) as Estimate[];
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <View
        isApproved={isApproved}
        zipCode={zipCode}
        electricityPrice={electricityPrice}
        systemOutput={systemOutput}
        estimates={estimatesMinusFees}
      />
    </main>
  );
}
