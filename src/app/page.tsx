import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [info, news, photos] = await Promise.all([
    prisma.schoolInfo.findUnique({ where: { id: "singleton" } }),
    prisma.newsPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
    prisma.photo.findMany({ orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const intro = (info?.body ?? "").split("\n\n")[0];

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Архангай аймгийн Чулуут сумын ЕБС</h1>
        <p className="max-w-2xl text-neutral-700">{intro}</p>
        <Link href="/about" className="inline-block text-sm text-accent underline">Сургуулийн тухай →</Link>
      </section>

      {news.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Сүүлийн мэдээ</h2>
          <ul className="divide-y divide-neutral-200">
            {news.map((n) => (
              <li key={n.id} className="py-3">
                <Link href="/news" className="hover:underline">{n.title}</Link>
                <span className="ml-3 text-xs text-neutral-500">{formatDate(n.publishedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {photos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Галерей</h2>
            <Link href="/gallery" className="text-sm text-accent underline">Бүгдийг үзэх →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p) => (
              <img key={p.id} src={p.filePath} alt={p.title} className="aspect-[4/3] w-full object-cover" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
