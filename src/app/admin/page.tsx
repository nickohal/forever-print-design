import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminEditor from './AdminEditor';

async function login(formData: FormData) {
  'use server';
  const password = formData.get('password');
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
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
  const isAuth = cookieStore.get('admin_auth')?.value === 'true';

  if (isAuth) {
    return <AdminEditor />;
  }

  const params = await searchParams;
  const hasError = params.error === '1';

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        {/* Brand */}
        <p className="font-serif font-light tracking-[0.2em] uppercase text-warm-black text-sm mb-1">
          Forever Print Design
        </p>
        <h1 className="font-serif font-light text-warm-black text-[28px] leading-snug mb-8">
          Site Editor
        </h1>

        <form action={login} className="w-full flex flex-col gap-3">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="w-full font-sans font-light text-[14px] text-warm-black placeholder:text-muted/40 bg-white border border-muted/25 focus:border-sage focus:outline-none rounded-lg px-4 py-3 text-center transition-colors duration-150"
          />

          {hasError && (
            <p className="font-sans font-light text-[12px] text-red-500">
              Incorrect password.
            </p>
          )}

          <button
            type="submit"
            className="font-sans font-light text-[12px] uppercase tracking-[0.18em] text-white bg-sage rounded-lg px-4 py-3 hover:bg-sage/85 transition-colors duration-150"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
