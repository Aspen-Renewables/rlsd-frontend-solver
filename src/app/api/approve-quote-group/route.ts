import { ADMIN_PASSWORD_HEADER_KEY } from "@/constants";
import { approveQuoteGroup } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get(ADMIN_PASSWORD_HEADER_KEY);
  console.log(`password: ${password}`);
  if (!password) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    console.log("Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }
  const groupId = searchParams.get("groupId");
  if (!groupId) throw new Error("groupId is required");
  if (isNaN(parseInt(groupId))) throw new Error("groupId must be a number");

  const data = await approveQuoteGroup(parseInt(groupId));
  return Response.json({ ...data });
}
