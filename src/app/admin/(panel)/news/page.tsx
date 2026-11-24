import { prisma } from "@/lib/db";
import { formatDate, toDateInput } from "@/lib/format";
import { createNews, deleteNews, updateNews } from "../../actions";

export const dynamic = "force-dynamic";

function NewsFields({ defaults }: { defaults?: { title: string; body: string; publishedAt: Date; isPublished: boolean } }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <input name="title" required maxLength={200} defaultValue={defaults?.title} placeholder="Гарчиг" className="input md:col-span-2" />
      <input name="publishedAt" type="date" required defaultValue={defaults ? toDateInput(defaults.publishedAt) : toDateInput(new Date())} className="input" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isPublished" type="checkbox" defaultChecked={defaults ? defaults.isPublished : true} /> Нийтлэх
      </label>
      <textarea name="body" required rows={6} maxLength={20000} defaultValue={defaults?.body} placeholder="Агуулга" className="input md:col-span-2" />
    </div>
  );
}

export default async function NewsAdminPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div className="space-y-10">
      <form action={createNews} className="card space-y-4">
        <h2 className="font-semibold">Шинэ мэдээ</h2>
        <NewsFields />
        <button type="submit" className="btn-accent">Хадгалах</button>
      </form>

      {posts.map((p) => (
        <div key={p.id} className="card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {formatDate(p.publishedAt)} · {p.isPublished ? "Нийтлэгдсэн" : "Ноорог"}
            </span>
            <form action={deleteNews.bind(null, p.id)}><button className="btn-danger">Устгах</button></form>
          </div>
          <form action={updateNews.bind(null, p.id)} className="space-y-4">
            <NewsFields defaults={p} />
            <button type="submit" className="btn">Хадгалах</button>
          </form>
        </div>
      ))}
    </div>
  );
}
