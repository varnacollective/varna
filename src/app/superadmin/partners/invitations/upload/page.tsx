import Link from "next/link";
import { FileUp, ListChecks } from "lucide-react";
import HotelNav from "@/components/ListUpload/HotelNav";
import HotelOverview from "@/components/ListUpload/HotelOverview";
import HotelTabs from "@/components/ListUpload/HotelTabs";
import PageHeader from "@/components/ListUpload/PageHeader";
import ReviewView from "@/components/ListUpload/ReviewView";
import UploadList from "@/components/ListUpload/UploadList";
import { formatWhen } from "@/components/ListUpload/format";
import { getHotelSuppliers, listHotels, listUploads } from "@/lib/list-uploads/hotel-queries";
import { NO_HOTEL, newListHref, readSelection, summariseHotels } from "@/lib/list-uploads/hotels";

export const metadata = { title: "Supplier lists" };

export default async function SupplierListsPage({ searchParams }: PageProps<"/superadmin/partners/invitations/upload">) {
  const [hotelOptions, uploads] = await Promise.all([listHotels(), listUploads()]);
  const hotels = summariseHotels(hotelOptions, uploads);
  const { hotel, tab } = readSelection(await searchParams, hotels);

  const hotelUploads = hotel ? uploads.filter((u) => (u.hotelId ?? NO_HOTEL) === hotel.id) : [];
  const suppliers = hotel && tab === "suppliers" ? await getHotelSuppliers(hotel.id, uploads) : [];
  // Each supplier shows which list it came from: "vendors.xlsx (27 Nov 2026)".
  const sources = new Map(
    hotelUploads.map((u) => [u.id, `${u.fileNames.join(", ") || "List"} (${formatWhen(u.createdAt, false)})`]),
  );
  const canUpload = hotel !== null && hotel.id !== NO_HOTEL;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        icon={ListChecks}
        title={hotel ? hotel.name : "Supplier Lists"}
        subtitle={
          !hotel
            ? "Each hotel's supplier lists: upload a list, check the suppliers found, then invite them."
            : hotel.id === NO_HOTEL
              ? "Lists uploaded before a hotel had to be chosen."
              : `Hotel code ${hotel.id} · all suppliers from this hotel's lists`
        }
        actions={
          hotel?.id === NO_HOTEL ? undefined : (
            <Link href={newListHref(canUpload ? hotel.id : null)} className="sa-btn-primary">
              <FileUp className="h-4 w-4" aria-hidden /> Upload a list
            </Link>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <HotelNav hotels={hotels} selectedId={hotel?.id ?? null} />

        <div className="flex min-w-0 flex-col gap-4">
          {!hotel ? (
            <HotelOverview hotels={hotels} />
          ) : (
            <>
              <HotelTabs hotel={hotel} tab={tab} />
              {tab === "lists" ? (
                <UploadList uploads={hotelUploads} />
              ) : (
                <ReviewView
                  key={hotel.id}
                  initialSuppliers={suppliers}
                  failedParts={[]}
                  sources={sources}
                  emptyText={
                    hotelUploads.length === 0
                      ? "No lists uploaded for this hotel yet. Use “Upload a list” to add one."
                      : "No suppliers to review yet. Open “Uploaded lists” to see each list."
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
