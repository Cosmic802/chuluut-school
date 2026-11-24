import Link from "next/link";
import { requireUser } from "@/lib/roles";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isSuper = user.role === "SUPER_ADMIN";
  const links = [
    { href: "/admin", label: "Удирдлага" },
    { href: "/admin/photos", label: "Зураг" },
    { href: "/admin/school", label: "Танилцуулга" },
    { href: "/admin/news", label: "Мэдээ" },
    ...(isSuper
      ? [
          { href: "/admin/users", label: "Хэрэглэгчид" },
          { href: "/admin/audit", label: "Үйл явдлын бүртгэл" },
        ]
      : []),
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-neutral-600 hover:text-ink">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">{user.name} · {isSuper ? "Ерөнхий админ" : "Админ"}</span>
          <form action={logout}>
            <button type="submit" className="btn">Гарах</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
