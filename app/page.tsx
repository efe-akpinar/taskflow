import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">TaskFlow</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sürükle-bırak ile çalışan basit bir Kanban board uygulaması.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Giriş yap
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-black/15 dark:border-white/20 px-4 py-2 text-sm hover:border-black/40 dark:hover:border-white/40"
          >
            Kayıt ol
          </Link>
        </div>
      </div>
    </div>
  );
}
