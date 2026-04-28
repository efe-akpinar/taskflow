import Link from "next/link";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";
import { listBoards } from "@/lib/db/boards";
import { createBoardAction, deleteBoardAction } from "@/lib/actions/boards";

export default async function BoardsPage() {
  const boards = await listBoards();

  return (
    <div className="flex flex-1 bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-zinc-400">TaskFlow</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-semibold tracking-tight">
              <LayoutGrid className="size-7 text-blue-300" />
              Boardlarım
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}

            <form
              action={createBoardAction}
              className="flex min-h-36 flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Plus className="size-4" />
                  Yeni board
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  maxLength={120}
                  placeholder="Board başlığı"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="mt-4 rounded-md bg-blue-300 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-blue-200"
              >
                Oluştur
              </button>
            </form>
          </div>

          {boards.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-5 text-sm text-zinc-400">
              Henüz board yok. İlk boardunu oluşturarak başlayabilirsin.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function BoardCard({
  board,
}: {
  board: {
    id: string;
    title: string;
    created_at: string;
  };
}) {
  const createdAt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(new Date(board.created_at));

  return (
    <li className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-zinc-700">
      <Link href={`/boards/${board.id}`} className="block">
        <div className="h-20 bg-[linear-gradient(135deg,#2563eb,#a855f7_55%,#ec4899)]" />
        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-1 font-semibold text-zinc-100">
              {board.title}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">Oluşturuldu: {createdAt}</p>
          </div>
        </div>
      </Link>
      <form action={deleteBoardAction} className="px-4 pb-4">
        <input type="hidden" name="id" value={board.id} />
        <button
          type="submit"
          aria-label="Board sil"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="size-3.5" />
          Sil
        </button>
      </form>
    </li>
  );
}
