import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3">
        <Link href="/boards" className="font-semibold tracking-tight">
          TaskFlow
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Çıkış
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
