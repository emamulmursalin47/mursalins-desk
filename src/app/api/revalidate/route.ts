import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Body: { "tag": "experiences" }
 *
 * Auth: either x-revalidate-secret header OR a valid admin session cookie.
 */
export async function POST(req: NextRequest) {
  // Check secret header (for external webhooks)
  const secret = req.headers.get("x-revalidate-secret");
  const hasSecret =
    secret && process.env.REVALIDATE_SECRET && secret === process.env.REVALIDATE_SECRET;

  // Check admin session cookie (for dashboard calls)
  const cookieStore = await cookies();
  const hasSession = !!cookieStore.get("accessToken")?.value;

  if (!hasSecret && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag } = await req.json();
  if (!tag || typeof tag !== "string") {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
