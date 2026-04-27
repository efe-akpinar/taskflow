"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/auth/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        action={action}
        className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold">Kayıt ol</h1>

        <label className="block">
          <span className="text-sm">E-posta</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:focus:border-white/40"
          />
        </label>

        <label className="block">
          <span className="text-sm">Parola (en az 6 karakter)</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:focus:border-white/40"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state?.info && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.info}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Kaydediliyor..." : "Kayıt ol"}
        </button>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="underline">
            Giriş yap
          </Link>
        </p>
      </form>
    </div>
  );
}
