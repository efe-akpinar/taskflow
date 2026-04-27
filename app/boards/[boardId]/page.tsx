import { notFound } from "next/navigation";
import Link from "next/link";
import { getBoardWithChildren } from "@/lib/db/boards";
import { Board } from "./_components/Board";

export default async function BoardPage(
  props: PageProps<"/boards/[boardId]">
) {
  const { boardId } = await props.params;
  const board = await getBoardWithChildren(boardId);
  if (!board) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3">
        <Link
          href="/boards"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          ← Board'lar
        </Link>
        <h1 className="text-lg font-semibold truncate">{board.title}</h1>
      </div>
      <Board initialBoard={board} />
    </div>
  );
}
