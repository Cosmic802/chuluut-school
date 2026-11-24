import { prisma } from "@/lib/db";
import { deletePhoto, movePhoto, updatePhoto, uploadPhotos } from "../../actions";

export const dynamic = "force-dynamic";

export default async function PhotosAdminPage() {
  const photos = await prisma.photo.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-10">
      <section className="card space-y-4">
        <h2 className="font-semibold">Зураг нэмэх</h2>
        <form action={uploadPhotos} encType="multipart/form-data" className="space-y-3">
          <div>
            <label className="label" htmlFor="files">Зургууд (JPG, PNG, WEBP · 10MB хүртэл)</label>
            <input id="files" name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp" className="text-sm" />
          </div>
          <div>
            <label className="label" htmlFor="title">Гарчиг (бүх зурагт)</label>
            <input id="title" name="title" maxLength={120} className="input" placeholder="Гарчиггүй" />
          </div>
          <button type="submit" className="btn-accent">Оруулах</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Зургууд ({photos.length})</h2>
        {photos.length === 0 && <p className="text-sm text-neutral-500">Одоогоор зураг байхгүй.</p>}
        {photos.map((p, i) => (
          <div key={p.id} className="card flex flex-col gap-4 md:flex-row">
            <img src={p.filePath} alt="" className="h-32 w-44 shrink-0 object-cover" />
            <div className="flex-1 space-y-3">
              <form action={updatePhoto.bind(null, p.id)} className="space-y-2">
                <input name="title" defaultValue={p.title} required maxLength={120} className="input" aria-label="Гарчиг" />
                <textarea name="description" defaultValue={p.description} rows={2} maxLength={500} className="input" aria-label="Тайлбар" />
                <button type="submit" className="btn">Хадгалах</button>
              </form>
              <div className="flex flex-wrap gap-2">
                <form action={movePhoto.bind(null, p.id, "up")}><button className="btn" disabled={i === 0}>↑ Дээш</button></form>
                <form action={movePhoto.bind(null, p.id, "down")}><button className="btn" disabled={i === photos.length - 1}>↓ Доош</button></form>
                <form action={deletePhoto.bind(null, p.id)}><button className="btn-danger">Устгах</button></form>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
