import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Saves an image under public/uploads/<folder> with a random name. Returns the public URL path. */
export async function saveImage(buffer: Buffer, ext: string, folder: "photos" | "school"): Promise<string> {
  const dir = path.join(PUBLIC_DIR, "uploads", folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}

/** Deletes a file only if it lives under /uploads/ (guards against path traversal). */
export async function deleteUpload(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith("/uploads/") || publicPath.includes("..")) return;
  await unlink(path.join(PUBLIC_DIR, publicPath)).catch(() => {});
}
