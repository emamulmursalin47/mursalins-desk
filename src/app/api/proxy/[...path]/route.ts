import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

async function proxyRequest(req: NextRequest, method: string) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Extract the path from the URL: /api/proxy/users/profile → /users/profile
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/proxy", "");
  const search = url.search;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  let body: BodyInit | undefined;

  if (method !== "GET" && method !== "DELETE") {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Forward FormData (file uploads) as-is
      body = await req.arrayBuffer();
      headers["Content-Type"] = contentType;
    } else {
      try {
        body = JSON.stringify(await req.json());
        headers["Content-Type"] = "application/json";
      } catch {
        // No body — that's fine
      }
    }
  }

  try {
    const res = await fetch(`${API_URL}${path}${search}`, {
      method,
      headers,
      body,
    });

    // Handle empty responses (204 No Content, etc.)
    const resContentType = res.headers.get("content-type");
    if (res.status === 204 || !resContentType?.includes("application/json")) {
      return new NextResponse(null, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST");
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, "PATCH");
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, "PUT");
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, "DELETE");
}
