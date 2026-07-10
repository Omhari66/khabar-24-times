"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogIn, Newspaper } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      if (role === "REPORTER") router.push("/dashboard/reporter");
      else if (role === "EDITOR") router.push("/dashboard/editor");
      else if (role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-2xl sm:rounded-[36px] border border-slate-200 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-950 text-white shadow-lg shadow-slate-900/10">
            <Newspaper size={24} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            News Portal
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Welcome Back</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Sign in to read personalized content, comment on stories, or access the staff dashboard.
          </p>
        </div>

        {status === "loading" ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : status === "authenticated" && session?.user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {session.user.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={session.user.image} alt="Profile" className="h-12 w-12 rounded-full shadow-sm" />
                </>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-600">
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{session.user.name || "User"}</p>
                <p className="text-sm text-slate-500">{session.user.email}</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {session.user.role}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (session.user.role === "USER") router.push("/");
                  else if (session.user.role === "REPORTER") router.push("/dashboard/reporter");
                  else if (session.user.role === "EDITOR") router.push("/dashboard/editor");
                  else if (session.user.role === "ADMIN") router.push("/dashboard/admin");
                  else router.push("/dashboard");
                }}
                className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continue to {session.user.role === "USER" ? "Homepage" : "Dashboard"}
              </button>
              
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  signIn("google", { callbackUrl: "/" });
                }}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-white px-2 text-slate-400">Or continue with email</span>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="reporter@news.com"
                  className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
