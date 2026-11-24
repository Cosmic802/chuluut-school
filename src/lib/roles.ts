import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Энэ үйлдлийг зөвхөн ерөнхий админ хийх боломжтой");
  return user;
}
