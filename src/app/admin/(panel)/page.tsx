import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/roles";

export default async function DashboardPage() {
  const user = await requireUser();
  const [photos, news] = await Promise.all([prisma.photo.count(), prisma.newsPost.count()]);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Link href="/admin/photos" className="card hover:border-accent">
        <p className="text-sm text-neutral-500">Зураг</p>
        <p className="text-3xl font-semibold">{photos}</p>
      </Link>
      <Link href="/admin/news" className="card hover:border-accent">
        <p className="text-sm text-neutral-500">Мэдээ</p>
        <p className="text-3xl font-semibold">{news}</p>
      </Link>
      <Link href="/admin/school" className="card hover:border-accent">
        <p className="text-sm text-neutral-500">Сургуулийн танилцуулга</p>
        <p className="mt-1 text-sm">Засах →</p>
      </Link>
      {user.role === "SUPER_ADMIN" && <p className="text-sm text-neutral-500 md:col-span-3">Та ерөнхий админ эрхтэй байна.</p>}
    </div>
  );
}
