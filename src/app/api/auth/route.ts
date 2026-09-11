import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    // Check for hardcoded Super Admin credentials
    if (clientId.trim().toLowerCase() === "superadmin" && password === "Varna") {
      const response = NextResponse.json({
        success: true,
        isSuperAdmin: true,
        redirectUrl: "/superadmin",
        client: {
          clientId: "Superadmin",
          clientName: "Super Administrator",
          industry: "Platform Administration",
        },
      });

      // Set secure HTTP-only cookie for superadmin session
      response.cookies.set("varna_superadmin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      response.cookies.set("varna_session", JSON.stringify({
        clientId: "Superadmin",
        clientName: "Super Administrator",
        role: "superadmin",
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    const supabase = await createClient();

    // Check for Group ID login fast-path / fallback
    const cleanId = clientId.trim().toUpperCase();
    if (cleanId === "GRP-001" && password === "1234") {
      const response = NextResponse.json({
        success: true,
        isGroup: true,
        redirectUrl: "/group-dashboard",
        client: {
          clientId: "GRP-001",
          clientName: "Meridian Hospitality Group (DEMO)",
          industry: "Hospitality Group",
          isGroup: true,
          parentGroup: "Meridian Hospitality Group (DEMO)",
        },
      });

      response.cookies.set("varna_session", JSON.stringify({
        clientId: "GRP-001",
        clientName: "Meridian Hospitality Group (DEMO)",
        isGroup: true,
        parentGroup: "Meridian Hospitality Group (DEMO)",
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    // 1. Check custom credentials managed in client_credentials table
    const { data: credClient } = await supabase
      .from("client_credentials")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (credClient) {
      if (credClient.password !== password) {
        return NextResponse.json(
          { error: "Invalid password for client account." },
          { status: 401 }
        );
      }

      const isGroup = Boolean(credClient.is_group) || credClient.client_id.startsWith("GRP-");
      const redirectUrl = isGroup ? "/group-dashboard" : "/dashboard";

      const response = NextResponse.json({
        success: true,
        isGroup,
        redirectUrl,
        client: {
          clientId: credClient.client_id,
          clientName: credClient.client_name || credClient.client_id,
          industry: isGroup ? "Hospitality Group" : "Hospitality",
          isGroup,
          parentGroup: credClient.parent_group || null,
        },
      });

      response.cookies.set("varna_session", JSON.stringify({
        clientId: credClient.client_id,
        clientName: credClient.client_name || credClient.client_id,
        isGroup,
        parentGroup: credClient.parent_group || null,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    // 2. Fallback to client_master with prototype password
    if (password !== "1234") {
      return NextResponse.json(
        { error: "Invalid password. Please check and try again." },
        { status: 401 }
      );
    }

    // Authenticate client by checking client_master table.
    const { data: client, error } = await supabase
      .from("client_master")
      .select("client_id, client_name, property_type, city, country, parent_group")
      .eq("client_id", clientId)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { error: "Invalid Client ID. Please check and try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      redirectUrl: "/dashboard",
      client: {
        clientId: client.client_id,
        clientName: client.client_name,
        industry: client.property_type,
        parentGroup: client.parent_group || null,
      },
    });

    response.cookies.set("varna_session", JSON.stringify({
      clientId: client.client_id,
      clientName: client.client_name,
      parentGroup: client.parent_group || null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
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
