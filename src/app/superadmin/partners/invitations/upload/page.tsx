import Link from "next/link";
import { FileUp, ListChecks, UserPlus } from "lucide-react";
import HotelDirectory from "@/components/ListUpload/HotelDirectory";
import HotelTabs from "@/components/ListUpload/HotelTabs";
import PageHeader from "@/components/ListUpload/PageHeader";
import ReviewView from "@/components/ListUpload/ReviewView";
import UploadList from "@/components/ListUpload/UploadList";
import { formatWhen } from "@/components/ListUpload/format";
import { getHotelSuppliers, listHotels, listUploads } from "@/lib/list-uploads/hotel-queries";
import { addSupplierHref, hotelHref, NO_HOTEL, newListHref, readSelection, summariseHotels } from "@/lib/list-uploads/hotels";

export const metadata = { title: "Supplier lists" };

export default async function SupplierListsPage({ searchParams }: PageProps<"/superadmin/partners/invitations/upload">) {
  const [hotelOptions, uploads] = await Promise.all([listHotels(), listUploads()]);
  const hotels = summariseHotels(hotelOptions, uploads);
  const params = await searchParams;
  const { hotel, tab } = readSelection(params, hotels);
  // Opened after adding a supplier: show it straight away.
  const openId = typeof params.open === "string" ? params.open : undefined;

  const hotelUploads = hotel ? uploads.filter((u) => (u.hotelId ?? NO_HOTEL) === hotel.id) : [];
  const hotelLists = hotelUploads.filter((u) => u.source === "file");
  const suppliers = hotel && tab === "suppliers" ? await getHotelSuppliers(hotel.id, uploads) : [];
  // Each supplier shows where it came from: "vendors.xlsx (27 Nov 2026)" or "Added by hand (…)".
  const sources = new Map(
    hotelUploads.map((u) => [
      u.id,
      `${u.source === "manual" ? "Added by hand" : u.fileNames.join(", ") || "List"} (${formatWhen(u.createdAt, false)})`,
    ]),
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        icon={ListChecks}
        title={hotel ? hotel.name : "Supplier Lists"}
        subtitle={
          !hotel
            ? "Which hotel is the list for? Choose it to upload a list and see its suppliers."
            : hotel.id === NO_HOTEL
              ? "Suppliers not linked to a hotel."
              : `Hotel code ${hotel.id} · every supplier of this hotel`
        }
        {...(hotel ? { back: { href: hotelHref(), label: "All hotels" } } : {})}
        actions={
          hotel ? (
            <>
              <Link href={addSupplierHref(hotel.id)} className="sa-btn-secondary">
                <UserPlus className="h-4 w-4" aria-hidden /> Add a supplier
              </Link>
              <Link href={newListHref(hotel.id)} className="sa-btn-primary">
                <FileUp className="h-4 w-4" aria-hidden /> Upload a list
              </Link>
            </>
          ) : undefined
        }
      />

      {!hotel ? (
        <HotelDirectory hotels={hotels} />
      ) : (
        <div className="flex min-w-0 flex-col gap-4">
          <HotelTabs hotel={hotel} tab={tab} />
          {tab === "lists" ? (
            <UploadList uploads={hotelLists} />
          ) : (
            <ReviewView
              key={hotel.id}
              initialSuppliers={suppliers}
              failedParts={[]}
              sources={sources}
              {...(openId ? { initialOpenId: openId } : {})}
              emptyText={
                hotelUploads.length === 0
                  ? "No suppliers yet. Use “Upload a list” or “Add a supplier”."
                  : "No suppliers to review yet. Open “Uploaded lists” to see each list."
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
