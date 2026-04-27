"use server";

import { generateKeyBetween } from "fractional-indexing";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export async function addCardAction(
  boardId: string,
  columnId: string,
  title: string
): Promise<{ ok: true; card: Card } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!boardId || !columnId || !trimmed) return { ok: false, error: "Eksik alan." };

  const supabase = await createClient();

  const { data: last, error: lastErr } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastErr) return { ok: false, error: lastErr.message };

  const position = generateKeyBetween(last?.position ?? null, null);

  const { data, error } = await supabase
    .from("cards")
    .insert({ column_id: columnId, board_id: boardId, title: trimmed, position })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };

  return { ok: true, card: data as Card };
}

export async function updateCardAction(
  id: string,
  title: string,
  description: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!id || !trimmed) return { ok: false, error: "Eksik alan." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({ title: trimmed, description: description.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteCardAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function moveCardAction(
  cardId: string,
  newColumnId: string,
  newPosition: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({ column_id: newColumnId, position: newPosition })
    .eq("id", cardId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
