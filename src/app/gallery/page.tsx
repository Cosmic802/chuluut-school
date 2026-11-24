import { prisma } from "@/lib/db";
import PhotoGallery from "@/components/PhotoGallery";

export const dynamic = "force-dynamic";

export const metadata = { title: "Галерей · Чулуут сумын ЕБС" };

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Галерей</h1>
      {photos.length === 0 ? (
        <p className="text-neutral-500">Одоогоор зураг байхгүй байна.</p>
      ) : (
        <PhotoGallery photos={photos} />
      )}
    </section>
  );
}
