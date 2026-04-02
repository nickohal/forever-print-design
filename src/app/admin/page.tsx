import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminEditor from './AdminEditor';

async function login(formData: FormData) {
  'use server';
  const password = formData.get('password');
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    redirect('/admin');
  } else {
    redirect('/admin?error=1');
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('admin_auth')?.value === '1';

  if (isAuth) {
    return <AdminEditor />;
  }

  const params = await searchParams;
  const hasError = params.error === '1';

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif font-light text-warm-black text-[32px] leading-snug mb-2">
          Site Editor
        </h1>
        <p className="font-sans font-light text-[13px] text-muted mb-8">
          Enter your admin password to continue.
        </p>

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-sans font-light text-[11px] uppercase tracking-[0.18em] text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="font-sans font-light text-[14px] text-warm-black bg-white border border-muted/25 focus:border-sage focus:outline-none rounded-lg px-4 py-3 transition-colors duration-150"
            />
          </div>

          {hasError && (
            <p className="font-sans font-light text-[12px] text-red-500">
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            className="font-sans font-light text-[12px] uppercase tracking-[0.18em] text-white bg-sage rounded-lg px-4 py-3 hover:bg-sage/85 transition-colors duration-150"
          >
            Sign in →
          </button>
        </form>
      </div>
    </main>
  );
}
