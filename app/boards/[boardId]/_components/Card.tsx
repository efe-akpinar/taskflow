"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardT } from "@/lib/types";

type Props = {
  card: CardT;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function Card({ card, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [saving, setSaving] = useState(false);

  const { setNodeRef, listeners, attributes, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "card", columnId: card.column_id },
      disabled: editing,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (editing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-zinc-900 p-2 shadow-sm space-y-2"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          maxLength={240}
          className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-black/40 dark:focus:border-white/50"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
          rows={3}
          className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-black/40 dark:focus:border-white/50 resize-y"
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!title.trim() || saving) return;
              setSaving(true);
              await onUpdate(card.id, title, description);
              setSaving(false);
              setEditing(false);
            }}
            className="rounded bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black disabled:opacity-50"
            disabled={!title.trim() || saving}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTitle(card.title);
                setDescription(card.description ?? "");
                setEditing(false);
              }}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm("Kart silinsin mi?")) {
                  await onDelete(card.id);
                }
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setEditing(true)}
      className="group rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-black/30 dark:hover:border-white/30 touch-none"
    >
      <div className="text-sm break-words">{card.title}</div>
      {card.description && (
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 whitespace-pre-wrap">
          {card.description}
        </div>
      )}
    </div>
  );
}

export function CardPreview({ card }: { card: CardT }) {
  return (
    <div className="rounded-md border border-black/30 dark:border-white/40 bg-white dark:bg-zinc-900 p-2 shadow-lg rotate-2">
      <div className="text-sm break-words">{card.title}</div>
      {card.description && (
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 whitespace-pre-wrap">
          {card.description}
        </div>
      )}
    </div>
  );
}
