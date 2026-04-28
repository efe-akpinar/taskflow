import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
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
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 sm:px-6">
        <Link
          href="/boards"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Boardlar
        </Link>
        <div className="h-6 w-px bg-zinc-800" />
        <h1 className="flex min-w-0 items-center gap-2 truncate text-xl font-semibold tracking-tight">
          <LayoutGrid className="size-5 shrink-0 text-blue-300" />
          <span className="truncate">{board.title}</span>
        </h1>
      </div>
      <Board initialBoard={board} />
    </div>
  );
}
