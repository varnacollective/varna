import { UserPlus } from "lucide-react";
import AddSupplierForm from "@/components/ListUpload/AddSupplierForm";
import PageHeader from "@/components/ListUpload/PageHeader";
import { listCategories, listHotels } from "@/lib/list-uploads/hotel-queries";
import { hotelChoices, hotelHref } from "@/lib/list-uploads/hotels";

export const metadata = { title: "Add a supplier" };

export default async function AddSupplierPage({ searchParams }: PageProps<"/superadmin/partners/invitations/upload/add">) {
  const [named, categories, params] = await Promise.all([listHotels(), listCategories(), searchParams]);
  const hotels = hotelChoices(named);
  const chosen = hotels.find((h) => h.id === params.hotel);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        icon={UserPlus}
        title="Add a Supplier"
        subtitle="One supplier at a time. It goes through the same checks as a list, then you approve and invite it from the hotel's page."
        back={chosen ? { href: hotelHref(chosen.id), label: `Back to ${chosen.name}` } : { href: hotelHref(), label: "Back to supplier lists" }}
      />
      <AddSupplierForm hotels={hotels} categories={categories} {...(chosen ? { initialHotelId: chosen.id } : {})} />
    </div>
  );
}
