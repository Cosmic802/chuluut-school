import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireSuperAdmin();
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs uppercase text-neutral-500">
          <tr><th className="py-2 pr-4">Огноо</th><th className="pr-4">Хэрэглэгч</th><th className="pr-4">Үйлдэл</th><th className="pr-4">Төрөл</th><th>ID</th></tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4 whitespace-nowrap">{l.createdAt.toISOString().replace("T", " ").slice(0, 16)}</td>
              <td className="pr-4">{l.userEmail}</td>
              <td className="pr-4">{l.action}</td>
              <td className="pr-4">{l.entity}</td>
              <td className="font-mono text-xs">{l.entityId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
