import { redirect } from "next/navigation";

interface OverviewPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardOverviewPage({ searchParams }: OverviewPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  query.set("section", "overview");
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (key !== "section") {
      if (typeof value === "string") {
        query.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      }
    }
  });
  redirect(`/dashboard?${query.toString()}`);
}
