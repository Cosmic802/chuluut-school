"use client";

import { useCallback, useEffect, useState } from "react";

export type GalleryPhoto = { id: string; filePath: string; title: string; description: string };

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((v) => (v === null ? null : (v - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((v) => (v === null ? null : (v + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, prev, next]);

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setIndex(i)} className="group text-left">
            <div className="aspect-[4/3] overflow-hidden bg-neutral-200">
              <img src={p.filePath} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:opacity-90" />
            </div>
            <p className="mt-2 text-sm font-medium">{p.title}</p>
            {p.description && <p className="text-xs text-neutral-500">{p.description}</p>}
          </button>
        ))}
      </div>

      {current && index !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white" onClick={close}>
          <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm">{index + 1} / {photos.length}</span>
            <button onClick={close} className="px-3 py-1 text-sm underline">Хаах (Esc)</button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
            <img src={current.filePath} alt={current.title} className="max-h-full max-w-full object-contain" />
            {photos.length > 1 && (
              <>
                <button onClick={prev} aria-label="Өмнөх" className="absolute left-1 px-3 py-2 text-4xl">‹</button>
                <button onClick={next} aria-label="Дараах" className="absolute right-1 px-3 py-2 text-4xl">›</button>
              </>
            )}
          </div>
          <div className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-medium">{current.title}</p>
            {current.description && <p className="mt-1 text-sm text-neutral-300">{current.description}</p>}
          </div>
        </div>
      )}
    </>
  );
}
