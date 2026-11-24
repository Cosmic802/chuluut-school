"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { clearSession, setSession, requireUser, requireSuperAdmin } from "@/lib/session";
import { readImage, loginSchema, photoMetaSchema, newsSchema, schoolSchema, userSchema } from "@/lib/validate";
import { saveImage, deleteUpload } from "@/lib/storage";

// Used to keep timing similar when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

function firstError(issues: { message: string }[]): Error {
  return new Error(issues[0]?.message ?? "Буруу оруулга");
}

/* ---------- auth ---------- */

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/admin/login?error=1");
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.isActive) redirect("/admin/login?error=1");
  await setSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin/login");
}

/* ---------- photos (ADMIN + SUPER_ADMIN) ---------- */

export async function uploadPhotos(formData: FormData) {
  const user = await requireUser();
  const files = formData.getAll("files");
  if (files.length === 0) throw new Error("Зураг сонгоно уу");
  if (files.length > 30) throw new Error("Нэг удаад 30-аас их зураг оруулах боломжгүй");
  const title = String(formData.get("title") ?? "").trim() || "Гарчиггүй";
  if (title.length > 120) throw new Error("Гарчиг 120 тэмдэгтээс хэтэрсэн");

  const last = await prisma.photo.aggregate({ _max: { sortOrder: true } });
  let order = last._max.sortOrder ?? 0;
  for (const file of files) {
    const { buffer, ext } = await readImage(file);
    const filePath = await saveImage(buffer, ext, "photos");
    order += 1;
    const photo = await prisma.photo.create({ data: { filePath, title, sortOrder: order } });
    await audit(user, "CREATE", "Photo", photo.id);
  }
  revalidatePath("/gallery");
  revalidatePath("/admin/photos");
}

export async function updatePhoto(id: string, formData: FormData) {
  const user = await requireUser();
  const parsed = photoMetaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) throw firstError(parsed.error.issues);
  await prisma.photo.update({ where: { id }, data: parsed.data });
  await audit(user, "UPDATE", "Photo", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/photos");
}

export async function deletePhoto(id: string) {
  const user = await requireUser();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id } });
  await deleteUpload(photo.filePath);
  await audit(user, "DELETE", "Photo", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/photos");
}

export async function movePhoto(id: string, direction: "up" | "down") {
  const user = await requireUser();
  const photos = await prisma.photo.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const idx = photos.findIndex((p) => p.id === id);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= photos.length) return;
  const a = photos[idx];
  const b = photos[swapWith];
  await prisma.$transaction([
    prisma.photo.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.photo.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  await audit(user, "REORDER", "Photo", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/photos");
}

/* ---------- school introduction (ADMIN + SUPER_ADMIN) ---------- */

export async function saveSchool(formData: FormData) {
  const user = await requireUser();
  const parsed = schoolSchema.safeParse({ body: formData.get("body") ?? "" });
  if (!parsed.success) throw firstError(parsed.error.issues);

  const current = await prisma.schoolInfo.findUnique({ where: { id: "singleton" } });
  let logoPath = current?.logoPath ?? null;
  let imagePath = current?.imagePath ?? null;

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const { buffer, ext } = await readImage(logo);
    const newPath = await saveImage(buffer, ext, "school");
    await deleteUpload(logoPath);
    logoPath = newPath;
  }
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const { buffer, ext } = await readImage(image);
    const newPath = await saveImage(buffer, ext, "school");
    await deleteUpload(imagePath);
    imagePath = newPath;
  }

  await prisma.schoolInfo.upsert({
    where: { id: "singleton" },
    update: { body: parsed.data.body, logoPath, imagePath },
    create: { id: "singleton", body: parsed.data.body, logoPath, imagePath },
  });
  await audit(user, "UPDATE", "SchoolInfo", "singleton");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/school");
}

/* ---------- news (ADMIN + SUPER_ADMIN) ---------- */

function parseNews(formData: FormData) {
  const parsed = newsSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    publishedAt: formData.get("publishedAt"),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) throw firstError(parsed.error.issues);
  return { ...parsed.data, publishedAt: new Date(`${parsed.data.publishedAt}T00:00:00Z`) };
}

function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function createNews(formData: FormData) {
  const user = await requireUser();
  const post = await prisma.newsPost.create({ data: parseNews(formData) });
  await audit(user, "CREATE", "NewsPost", post.id);
  revalidateNews();
}

export async function updateNews(id: string, formData: FormData) {
  const user = await requireUser();
  await prisma.newsPost.update({ where: { id }, data: parseNews(formData) });
  await audit(user, "UPDATE", "NewsPost", id);
  revalidateNews();
}

export async function deleteNews(id: string) {
  const user = await requireUser();
  await prisma.newsPost.delete({ where: { id } }).catch(() => null);
  await audit(user, "DELETE", "NewsPost", id);
  revalidateNews();
}

/* ---------- user accounts (SUPER_ADMIN only) ---------- */

async function assertNotLastSuperAdmin(targetId: string) {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (target?.role !== "SUPER_ADMIN" || !target.isActive) return;
  const count = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
  if (count <= 1) throw new Error("Хамгийн сүүлийн ерөнхий админыг устгах, идэвхгүй болгох, эрхийг нь бууруулах боломжгүй");
}

export async function createUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) throw firstError(parsed.error.issues);
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) throw new Error("Энэ имэйлтэй хэрэглэгч аль хэдийн бүртгэгдсэн");
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });
  await audit(actor, "CREATE", "User", user.id);
  revalidatePath("/admin/users");
}

export async function setUserActive(id: string, active: boolean) {
  const actor = await requireSuperAdmin();
  if (id === actor.id) throw new Error("Өөрийгөө идэвхгүй болгох боломжгүй");
  if (!active) await assertNotLastSuperAdmin(id);
  await prisma.user.update({ where: { id }, data: { isActive: active } });
  await audit(actor, active ? "ENABLE" : "DISABLE", "User", id);
  revalidatePath("/admin/users");
}

export async function setUserRole(id: string, formData: FormData) {
  const actor = await requireSuperAdmin();
  const role = formData.get("role");
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") throw new Error("Буруу эрх");
  if (id === actor.id) throw new Error("Өөрийн эрхийг өөрчлөх боломжгүй");
  if (role === "ADMIN") await assertNotLastSuperAdmin(id);
  await prisma.user.update({ where: { id }, data: { role } });
  await audit(actor, "ROLE_CHANGE", "User", id);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const actor = await requireSuperAdmin();
  if (id === actor.id) throw new Error("Өөрийгөө устгах боломжгүй");
  await assertNotLastSuperAdmin(id);
  await prisma.user.delete({ where: { id } }).catch(() => null);
  await audit(actor, "DELETE", "User", id);
  revalidatePath("/admin/users");
}
