import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export const photoMetaSchema = z.object({
  title: z.string().trim().min(1, "Гарчиг оруулна уу").max(120),
  description: z.string().trim().max(500),
});

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Гарчиг оруулна уу").max(200),
  body: z.string().trim().min(1, "Агуулга оруулна уу").max(20000),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Огноо буруу байна"),
  isPublished: z.boolean(),
});

export const schoolSchema = z.object({
  body: z.string().trim().max(20000),
});

export const userSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10, "Нууц үг хамгийн багадаа 10 тэмдэгт").max(200),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function matchesMagic(b: Buffer, ext: string): boolean {
  if (ext === "jpg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (ext === "png") return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === "webp") return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

/** Validates an uploaded image by MIME type, size, and file signature. */
export async function readImage(file: FormDataEntryValue | null): Promise<{ buffer: Buffer; ext: string }> {
  if (!(file instanceof File) || file.size === 0) throw new Error("Файл сонгоогүй байна");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Файлын хэмжээ 10MB-аас хэтэрсэн байна");
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error("Зөвхөн JPG, PNG, WEBP формат зөвшөөрнө");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesMagic(buffer, ext)) throw new Error("Файлын агуулга таарахгүй байна");
  return { buffer, ext };
}
