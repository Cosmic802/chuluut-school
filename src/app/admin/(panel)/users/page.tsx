import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/roles";
import { createUser, deleteUser, setUserActive, setUserRole } from "../../actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const actor = await requireSuperAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-10">
      <form action={createUser} className="card grid gap-3 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Шинэ хэрэглэгч</h2>
        <input name="name" required maxLength={100} placeholder="Нэр" className="input" />
        <input name="email" type="email" required placeholder="Имэйл" className="input" />
        <input name="password" type="password" required minLength={10} placeholder="Нууц үг (10+ тэмдэгт)" className="input" autoComplete="new-password" />
        <select name="role" className="input" defaultValue="ADMIN">
          <option value="ADMIN">Админ</option>
          <option value="SUPER_ADMIN">Ерөнхий админ</option>
        </select>
        <button type="submit" className="btn-accent md:col-span-2 md:w-max">Үүсгэх</button>
      </form>

      <div className="space-y-3">
        {users.map((u) => {
          const self = u.id === actor.id;
          return (
            <div key={u.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{u.name} {self && <span className="text-xs text-neutral-500">(та)</span>}</p>
                <p className="text-sm text-neutral-500">{u.email} · {u.isActive ? "Идэвхтэй" : "Идэвхгүй"}</p>
              </div>
              {!self && (
                <div className="flex flex-wrap gap-2">
                  <form action={setUserRole.bind(null, u.id)} className="flex gap-2">
                    <select name="role" defaultValue={u.role} className="input w-auto">
                      <option value="ADMIN">Админ</option>
                      <option value="SUPER_ADMIN">Ерөнхий админ</option>
                    </select>
                    <button type="submit" className="btn">Эрх солих</button>
                  </form>
                  <form action={setUserActive.bind(null, u.id, !u.isActive)}>
                    <button type="submit" className="btn">{u.isActive ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}</button>
                  </form>
                  <form action={deleteUser.bind(null, u.id)}><button className="btn-danger">Устгах</button></form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
