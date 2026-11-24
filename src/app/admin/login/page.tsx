import { login } from "../actions";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-sm space-y-6 pt-10">
      <h1 className="text-2xl font-semibold">Админ нэвтрэх</h1>
      {searchParams.error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Имэйл эсвэл нууц үг буруу байна.
        </p>
      )}
      <form action={login} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Имэйл</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Нууц үг</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        <button type="submit" className="btn-accent w-full justify-center">Нэвтрэх</button>
      </form>
    </div>
  );
}
