import { ADMIN_PASSWORD_HEADER_KEY } from "@/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = request.headers.get(ADMIN_PASSWORD_HEADER_KEY);
  console.log(password);
  if (password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  } else {
    return new Response("Authorized", { status: 200 });
  }
}
