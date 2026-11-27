import { FileUp } from "lucide-react";
import PageHeader from "@/components/ListUpload/PageHeader";
import UploadForm from "@/components/ListUpload/UploadForm";
import { listHotels } from "@/lib/list-uploads/hotel-queries";
import { hotelHref } from "@/lib/list-uploads/hotels";

export const metadata = { title: "Upload a supplier list" };

export default async function NewListPage({ searchParams }: PageProps<"/superadmin/partners/invitations/upload/new">) {
  const [hotels, params] = await Promise.all([listHotels(), searchParams]);
  const chosen = hotels.find((h) => h.id === params.hotel);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        icon={FileUp}
        title="Upload a Supplier List"
        subtitle="Add the hotel's list as it came: a spreadsheet, a PDF, photos of the pages, or text pasted from an email. The suppliers are found for you, and nothing is sent until you approve it."
        back={chosen ? { href: hotelHref(chosen.id), label: `Back to ${chosen.name}` } : { href: hotelHref(), label: "Back to supplier lists" }}
      />
      <UploadForm hotels={hotels} {...(chosen ? { initialHotelId: chosen.id } : {})} />
    </div>
  );
}
