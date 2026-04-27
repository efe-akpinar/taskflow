"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
