import { NextRequest, NextResponse } from "next/server";
import { validateClient } from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, password } = body;

    if (!clientId || !password) {
      return NextResponse.json(
        { error: "Client ID and password are required." },
        { status: 400 }
      );
    }

    const client = await validateClient(clientId, password);

    if (!client) {
      return NextResponse.json(
        { error: "Invalid Client ID. Please check and try again." },
        { status: 401 }
      );
    }

    // In production, you'd set a signed JWT/session cookie here
    const response = NextResponse.json({
      success: true,
      client: {
        clientId: client.clientId,
        clientName: client.clientName,
        industry: client.industry,
      },
    });

    // Set a simple session cookie (in production, use a signed JWT)
    response.cookies.set("varna_session", JSON.stringify({
      clientId: client.clientId,
      clientName: client.clientName,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
