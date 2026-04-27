import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Board, BoardWithChildren } from "@/lib/types";

export async function listBoards(): Promise<Board[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBoardWithChildren(
  boardId: string
): Promise<BoardWithChildren | null> {
  const supabase = await createClient();

  const [boardRes, columnsRes, cardsRes] = await Promise.all([
    supabase.from("boards").select("*").eq("id", boardId).single(),
    supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true }),
    supabase
      .from("cards")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true }),
  ]);

  if (boardRes.error) {
    if (boardRes.error.code === "PGRST116") return null; // not found
    throw new Error(boardRes.error.message);
  }
  if (columnsRes.error) throw new Error(columnsRes.error.message);
  if (cardsRes.error) throw new Error(cardsRes.error.message);

  const cardsByColumn = new Map<string, typeof cardsRes.data>();
  for (const card of cardsRes.data ?? []) {
    const arr = cardsByColumn.get(card.column_id) ?? [];
    arr.push(card);
    cardsByColumn.set(card.column_id, arr);
  }

  return {
    ...boardRes.data,
    columns: (columnsRes.data ?? []).map((col) => ({
      ...col,
      cards: cardsByColumn.get(col.id) ?? [],
    })),
  };
}
