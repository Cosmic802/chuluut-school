import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Архангай аймгийн Чулуут сумын ЕБС",
  description: "Архангай аймгийн Чулуут сумын ерөнхий боловсролын сургууль",
};

const nav = [
  { href: "/", label: "Нүүр" },
  { href: "/gallery", label: "Галерей" },
  { href: "/about", label: "Сургуулийн тухай" },
  { href: "/news", label: "Мэдээ" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="font-sans" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' }}>
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <Link href="/" className="text-sm font-semibold">Чулуут сумын ЕБС</Link>
            <nav className="flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-neutral-600 hover:text-ink">{n.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
        <footer className="mt-16 border-t border-neutral-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 text-xs text-neutral-500">
            <span>© Архангай аймгийн Чулуут сумын ЕБС</span>
            <Link href="/admin" className="hover:text-ink">Админ</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
