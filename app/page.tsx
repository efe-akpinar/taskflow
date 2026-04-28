import Link from "next/link";
import { ArrowRight, Kanban, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 overflow-hidden bg-white text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm">
              <Kanban className="size-4" />
            </span>
            TaskFlow
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <LogIn className="size-4" />
            Giriş yap
          </Link>
        </nav>

        <section className="flex flex-1 items-center justify-center py-20 text-center sm:py-28">
          <div className="max-w-3xl space-y-7">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              TaskFlow
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg leading-8 text-zinc-600">
              Boardlarını oluştur, işleri sütunlara ayır ve kartları
              sürükleyerek ekibinin akışını canlı tut.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800 sm:w-auto"
              >
                <UserPlus className="size-4" />
                Hemen başla
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto"
              >
                <LogIn className="size-4" />
                Giriş yap
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
