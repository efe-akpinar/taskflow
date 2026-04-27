import Link from "next/link";
import { listBoards } from "@/lib/db/boards";
import { createBoardAction, deleteBoardAction } from "@/lib/actions/boards";

export default async function BoardsPage() {
  const boards = await listBoards();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold mb-4">Board'larım</h1>

        <form action={createBoardAction} className="flex gap-2">
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            placeholder="Yeni board başlığı"
            className="flex-1 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:focus:border-white/40"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Oluştur
          </button>
        </form>
      </section>

      <section>
        {boards.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Henüz board'un yok. Yukarıdan ilkini oluştur.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {boards.map((b) => (
              <li
                key={b.id}
                className="group flex items-center justify-between rounded-lg border border-black/10 dark:border-white/15 p-4 hover:border-black/30 dark:hover:border-white/30"
              >
                <Link href={`/boards/${b.id}`} className="flex-1 font-medium">
                  {b.title}
                </Link>
                <form action={deleteBoardAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    aria-label="Board'u sil"
                    className="ml-3 text-sm text-zinc-400 hover:text-red-600"
                  >
                    Sil
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
