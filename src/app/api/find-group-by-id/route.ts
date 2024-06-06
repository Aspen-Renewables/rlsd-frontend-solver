import { getQuoteGroup } from "@/db/queries";
export async function GET(request: Request) {
  //Delete and return
  // await db.delete(QuoteGroup);
  // return Response.json({ message: "Deleted" });
  const { searchParams } = new URL(request.url);

  const groupId = searchParams.get("groupId");
  if (!groupId) throw new Error("groupId is required");
  if (isNaN(parseInt(groupId))) throw new Error("groupId must be a number");
  const data = await getQuoteGroup(parseInt(groupId));
  return Response.json({ ...data });
}
