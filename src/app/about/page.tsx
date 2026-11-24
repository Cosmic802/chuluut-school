import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Сургуулийн тухай · Чулуут сумын ЕБС" };

export default async function AboutPage() {
  const info = await prisma.schoolInfo.findUnique({ where: { id: "singleton" } });
  const paragraphs = (info?.body ?? "").split(/\n\n+/).filter(Boolean);
  return (
    <article className="space-y-8">
      <div className="flex items-center gap-6">
        {info?.logoPath && <img src={info.logoPath} alt="Сургуулийн эмблем" className="h-24 w-24 object-contain" />}
        <h1 className="text-2xl font-semibold">Сургуулийн тухай</h1>
      </div>
      {info?.imagePath && <img src={info.imagePath} alt="" className="w-full object-cover" />}
      <div className="max-w-2xl space-y-4 leading-relaxed text-neutral-800">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
}
