"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Kanban, LockKeyhole, LogIn, Mail } from "lucide-react";
import { loginAction } from "@/app/auth/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          <span className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Kanban className="size-4" />
          </span>
          TaskFlow
        </Link>

        <form
          action={action}
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="space-y-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <LogIn className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Giriş yap</h1>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Boardlarına dön ve görev akışını kaldığın yerden yönet.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-medium">E-posta</span>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-10 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 dark:focus:bg-zinc-950"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Parola</span>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-10 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 dark:focus:bg-zinc-950"
              />
            </div>
          </label>

          {state?.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {pending ? "Giriş yapılıyor..." : "Giriş yap"}
            <ArrowRight className="size-4" />
          </button>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Hesabın yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-white"
            >
              Kayıt ol
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
