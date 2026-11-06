import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CalculatorClient from "./CalculatorClient";
import { resolveHotelProperty } from "@/lib/properties-data";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CalculatorServerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawClientId = resolvedSearchParams.clientId;
  const queryClientId =
    typeof rawClientId === "string"
      ? rawClientId
      : Array.isArray(rawClientId)
      ? rawClientId[0]
      : undefined;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  let session: { clientId: string; clientName: string; isGroup?: boolean } | null = null;
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      // ignore
    }
  }

  if (!session && !queryClientId) {
    redirect("/");
  }

  const clientId = queryClientId || session?.clientId || "CLT-001";
  const fallbackHotel = resolveHotelProperty(clientId);

  const supabase = await createClient();
  const { data: clientData } = await supabase
    .from("client_master")
    .select("client_name")
    .eq("client_id", clientId)
    .maybeSingle();

  const clientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";

  return <CalculatorClient clientName={clientName} clientId={clientId} />;
}

