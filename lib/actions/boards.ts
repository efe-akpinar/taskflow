"use server";

import { generateKeyBetween } from "fractional-indexing";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_COLUMNS = ["Yapılacak", "Devam Ediyor", "Bitti"];

export async function createBoardAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("boards")
    .insert({ title, owner_id: user.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  let lastPosition: string | null = null;
  const defaultColumns = DEFAULT_COLUMNS.map((columnTitle) => {
    const position = generateKeyBetween(lastPosition, null);
    lastPosition = position;
    return {
      board_id: data.id,
      title: columnTitle,
      position,
    };
  });

  const { error: columnsError } = await supabase
    .from("columns")
    .insert(defaultColumns);

  if (columnsError) throw new Error(columnsError.message);

  revalidatePath("/boards");
  redirect(`/boards/${data.id}`);
}

export async function deleteBoardAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/boards");
}
