"use client";

import { useState } from "react";
import { CalendarDays, Clock3, FileText, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardT } from "@/lib/types";

type Props = {
  card: CardT;
  onUpdate: (
    id: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function Card({ card, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [startDate, setStartDate] = useState(card.start_date ?? "");
  const [dueDate, setDueDate] = useState(card.due_date ?? "");
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
  const dateRangeInvalid = Boolean(startDate && dueDate && startDate > dueDate);

  const resetForm = () => {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setStartDate(card.start_date ?? "");
    setDueDate(card.due_date ?? "");
  };

  return (
    <>
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
        {card.due_date && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <DateBadge
              label={`Teslim: ${formatDate(card.due_date)}`}
              overdue={isOverdue(card.due_date)}
            />
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
              setEditing(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={`card-title-${card.id}`}>
                  Kart başlığı
                </label>
                <input
                  id={`card-title-${card.id}`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  maxLength={240}
                  className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-2xl font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-zinc-50 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:bg-zinc-950"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditing(false);
                }}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Kart detayını kapat"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Clock3 className="size-4" />
                  Başlangıç tarihi
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-blue-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-950"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <CalendarDays className="size-4" />
                  Son teslim tarihi
                </span>
                <input
                  type="date"
                  value={dueDate}
                  min={startDate || undefined}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-blue-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-950"
                />
              </label>
            </div>
            {dateRangeInvalid && (
              <p className="-mt-3 mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Başlangıç tarihi son teslim tarihinden sonra olamaz.
              </p>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <FileText className="size-4" />
                Açıklama
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Daha detaylı açıklama ekle..."
                rows={5}
                className="w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-950"
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Kart silinsin mi?")) {
                    await onDelete(card.id);
                    setEditing(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="size-4" />
                Sil
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditing(false);
                  }}
                  className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!title.trim() || saving) return;
                    setSaving(true);
                    await onUpdate(card.id, title, description, startDate, dueDate);
                    setSaving(false);
                    setEditing(false);
                  }}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    !title.trim() || saving || dateRangeInvalid
                  }
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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

function DateBadge({ label, overdue = false }: {
  label: string;
  overdue?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
        overdue
          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      <CalendarDays className="size-3" />
      {label}
    </span>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function isOverdue(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day) < today;
}
