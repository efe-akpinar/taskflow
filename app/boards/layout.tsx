import Link from "next/link";
import { Kanban, LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100">
        <Link href="/boards" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Kanban className="size-4" />
          </span>
          <span className="hidden sm:inline">TaskFlow</span>
        </Link>

        <div className="flex-1" />

        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            <LogOut className="size-4" />
            Çıkış
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
