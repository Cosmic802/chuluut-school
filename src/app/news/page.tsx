import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Мэдээ · Чулуут сумын ЕБС" };

export default async function NewsPage() {
  const posts = await prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Мэдээ</h1>
      {posts.length === 0 && <p className="text-neutral-500">Одоогоор мэдээ байхгүй байна.</p>}
      {posts.map((p) => (
        <article key={p.id} className="border-b border-neutral-200 pb-8">
          <p className="text-xs text-neutral-500">{formatDate(p.publishedAt)}</p>
          <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
          <div className="mt-3 max-w-2xl space-y-3 text-neutral-800">
            {p.body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>
      ))}
    </section>
  );
}
