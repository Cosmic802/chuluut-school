import { prisma } from "@/lib/db";
import { saveSchool } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SchoolAdminPage() {
  const info = await prisma.schoolInfo.findUnique({ where: { id: "singleton" } });
  return (
    <form action={saveSchool} encType="multipart/form-data" className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="body">Танилцуулга (кабзаа хооронд хоосон мөр тавина)</label>
          <textarea id="body" name="body" rows={14} defaultValue={info?.body ?? ""} className="input" />
        </div>
        <button type="submit" className="btn-accent">Хадгалах</button>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="label" htmlFor="logo">Эмблем (лого)</label>
          {info?.logoPath && <img src={info.logoPath} alt="" className="h-24 w-24 object-contain" />}
          <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </div>
        <div className="space-y-2">
          <label className="label" htmlFor="image">Зураг</label>
          {info?.imagePath && <img src={info.imagePath} alt="" className="w-full object-cover" />}
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </div>
      </div>
    </form>
  );
}
