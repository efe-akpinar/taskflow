"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Card as CardT, Column as ColumnT } from "@/lib/types";
import { Card } from "./Card";
import { AddCardForm } from "./AddCardForm";

type Props = {
  column: ColumnT & { cards: CardT[] };
  onAddCard: (columnId: string, title: string) => Promise<void>;
  onUpdateCard: (
    id: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string
  ) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onRenameColumn: (id: string, title: string) => Promise<void>;
  onDeleteColumn: (id: string) => Promise<void>;
};

export function Column({
  column,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(column.title);

  const { setNodeRef, listeners, attributes, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      data: { type: "column" },
      disabled: renaming,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="shrink-0 w-72 flex flex-col rounded-lg border border-black/10 dark:border-white/15 bg-zinc-50 dark:bg-zinc-900/50 max-h-full"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
      >
        {renaming ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!title.trim()) return;
              await onRenameColumn(column.id, title);
              setRenaming(false);
            }}
            className="flex-1"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={async () => {
                if (title.trim() && title !== column.title) {
                  await onRenameColumn(column.id, title);
                }
                setRenaming(false);
              }}
              autoFocus
              maxLength={120}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-white dark:bg-zinc-950 px-2 py-1 text-sm outline-none focus:border-black/40 dark:focus:border-white/50"
            />
          </form>
        ) : (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              setTitle(column.title);
              setRenaming(true);
            }}
            className="flex-1 text-left text-sm font-semibold truncate"
          >
            {column.title}
          </button>
        )}
        <button
          type="button"
          aria-label="Sütunu sil"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={async () => {
            if (
              confirm(
                column.cards.length > 0
                  ? `Sütun ve içindeki ${column.cards.length} kart silinsin mi?`
                  : "Sütun silinsin mi?"
              )
            ) {
              await onDeleteColumn(column.id);
            }
          }}
          className="text-xs text-zinc-400 hover:text-red-600 px-1"
        >
          Sil
        </button>
      </div>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-12">
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </SortableContext>

      <div className="p-2">
        <AddCardForm onAdd={(t) => onAddCard(column.id, t)} />
      </div>
    </div>
  );
}
