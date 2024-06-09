import { db } from "@/db/db";
import {
  getApprovedQuoteGroups,
  ReturnTypeOfGetApprovedQuoteGroups,
} from "@/db/queries";
export async function GET(request: Request) {
  const approvedQuoteGroups: ReturnTypeOfGetApprovedQuoteGroups =
    await getApprovedQuoteGroups();

  const totalApproved = await db.query.TotalBudgetGranted.findFirst({});
  return Response.json({
    totalApproved,
    approvedQuoteGroups,
  });
}
