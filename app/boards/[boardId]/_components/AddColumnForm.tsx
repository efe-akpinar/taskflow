"use client";

import { useState } from "react";

export function AddColumnForm({
  onAdd,
}: {
  onAdd: (title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 w-72 rounded-lg border border-black/15 dark:border-white/20 p-3 text-sm text-zinc-600 dark:text-zinc-400 hover:border-black/40 dark:hover:border-white/40"
      >
        + Sütun ekle
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim() || busy) return;
        setBusy(true);
        await onAdd(title);
        setBusy(false);
        setTitle("");
        setOpen(false);
      }}
      className="shrink-0 w-72 rounded-lg border border-black/15 dark:border-white/20 bg-zinc-50 dark:bg-zinc-900 p-3 space-y-2"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        placeholder="Sütun başlığı"
        maxLength={120}
        className="w-full rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm outline-none focus:border-black/40 dark:focus:border-white/50"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || busy}
          className="rounded bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black disabled:opacity-50"
        >
          {busy ? "Ekleniyor..." : "Ekle"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setOpen(false);
          }}
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
