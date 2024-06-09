import React from "react";
import {
  getApprovedQuoteGroups,
  ReturnTypeOfGetApprovedQuoteGroups,
} from "@/db/queries";
import View from "./view";
import { db } from "@/db/db";
export const dynamic = "force-dynamic";
export const revalidate = 1;
const Page = async () => {
  const approvedQuoteGroups: ReturnTypeOfGetApprovedQuoteGroups =
    await getApprovedQuoteGroups();

  const totalApproved = await db.query.TotalBudgetGranted.findFirst({});
  return (
    <View
      totalApproved={parseFloat(totalApproved?.amount!) || 0}
      data={approvedQuoteGroups}
    />
  );
};

export default Page;
