import { approveQuoteGroup } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const groupId = searchParams.get("groupId");
  if (!groupId) throw new Error("groupId is required");
  if (isNaN(parseInt(groupId))) throw new Error("groupId must be a number");

  const data = await approveQuoteGroup(parseInt(groupId));
  return Response.json({ ...data });
}
