import { redirect } from "next/navigation";

interface PartnersPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPartnersPage({ searchParams }: PartnersPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    }
  });
  const queryString = query.toString();
  redirect(`/dashboard/suppliers${queryString ? `?${queryString}` : ""}`);
}
