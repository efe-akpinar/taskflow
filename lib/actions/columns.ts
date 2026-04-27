"use server";

import { generateKeyBetween } from "fractional-indexing";
import { createClient } from "@/lib/supabase/server";
import type { Column } from "@/lib/types";

export async function addColumnAction(
  boardId: string,
  title: string
): Promise<{ ok: true; column: Column } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!boardId || !trimmed) return { ok: false, error: "Eksik alan." };

  const supabase = await createClient();

  const { data: last, error: lastErr } = await supabase
    .from("columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastErr) return { ok: false, error: lastErr.message };

  const position = generateKeyBetween(last?.position ?? null, null);

  const { data, error } = await supabase
    .from("columns")
    .insert({ board_id: boardId, title: trimmed, position })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };

  return { ok: true, column: data as Column };
}

export async function renameColumnAction(
  id: string,
  title: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!id || !trimmed) return { ok: false, error: "Eksik alan." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("columns")
    .update({ title: trimmed })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteColumnAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("columns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function moveColumnAction(
  columnId: string,
  newPosition: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("columns")
    .update({ position: newPosition })
    .eq("id", columnId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
