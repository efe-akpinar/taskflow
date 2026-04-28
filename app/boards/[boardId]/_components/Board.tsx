"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { generateKeyBetween } from "fractional-indexing";

import type {
  BoardWithChildren,
  Card as CardT,
  Column as ColumnT,
} from "@/lib/types";
import {
  addCardAction,
  updateCardAction,
  deleteCardAction,
  reorderCardsAction,
} from "@/lib/actions/cards";
import {
  addColumnAction,
  renameColumnAction,
  deleteColumnAction,
  reorderColumnsAction,
} from "@/lib/actions/columns";

import { Column } from "./Column";
import { CardPreview } from "./Card";
import { AddColumnForm } from "./AddColumnForm";

type ColumnState = ColumnT & { cards: CardT[] };

export function Board({ initialBoard }: { initialBoard: BoardWithChildren }) {
  const [columns, setColumnsState] = useState<ColumnState[]>(
    initialBoard.columns
  );
  const [activeCard, setActiveCard] = useState<CardT | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mirror state in a ref so drag handlers can read fresh state synchronously,
  // without waiting for React's batched updater to run.
  const columnsRef = useRef<ColumnState[]>(initialBoard.columns);

  const setColumns = useCallback(
    (next: ColumnState[] | ((prev: ColumnState[]) => ColumnState[])) => {
      const value =
        typeof next === "function"
          ? (next as (prev: ColumnState[]) => ColumnState[])(columnsRef.current)
          : next;
      columnsRef.current = value;
      setColumnsState(value);
    },
    []
  );

  // Track the column the dragged card started in. We can't trust
  // active.data.current.columnId because dnd-kit updates it live as the card
  // moves to a new column during dragOver.
  const dragOriginColumnRef = useRef<string | null>(null);
  const dragOriginIndexRef = useRef<number | null>(null);

  // Re-seed when the server data identity changes (after navigation/refresh).
  const seededRef = useRef(initialBoard);
  useEffect(() => {
    if (seededRef.current !== initialBoard) {
      seededRef.current = initialBoard;
      setColumns(initialBoard.columns);
    }
  }, [initialBoard, setColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // When a column is being dragged, restrict drop targets to other columns —
  // closestCorners gets confused with mixed horizontal/vertical sortables.
  const collisionDetection: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "column") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === "column"
        ),
      });
    }
    return closestCorners(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setError(null);
    const cols = columnsRef.current;

    if (active.data.current?.type === "card") {
      const cardId = active.id as string;
      const col = cols.find((c) => c.cards.some((cd) => cd.id === cardId));
      const card = col?.cards.find((c) => c.id === cardId);
      if (card) {
        setActiveCard(card);
        dragOriginColumnRef.current = col!.id;
        dragOriginIndexRef.current =
          col?.cards.findIndex((c) => c.id === cardId) ?? null;
      }
    } else if (active.data.current?.type === "column") {
      const col = cols.find((c) => c.id === active.id);
      if (col) setActiveColumn(col);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type !== "card") return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    const prev = columnsRef.current;
    const sourceCol = prev.find((c) =>
      c.cards.some((cd) => cd.id === activeCardId)
    );
    if (!sourceCol) return;

    const overColumnId =
      over.data.current?.type === "column"
        ? overId
        : (over.data.current?.columnId as string | undefined);
    if (!overColumnId) return;

    if (sourceCol.id === overColumnId) {
      if (over.data.current?.type !== "card" || overId === activeCardId) return;

      const oldIdx = sourceCol.cards.findIndex((c) => c.id === activeCardId);
      const newIdx = sourceCol.cards.findIndex((c) => c.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      setColumns((cols) =>
        cols.map((col) =>
          col.id === sourceCol.id
            ? { ...col, cards: arrayMove(col.cards, oldIdx, newIdx) }
            : col
        )
      );
      return;
    }

    const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
    const sourceColNext = next.find((c) => c.id === sourceCol.id)!;
    const destColNext = next.find((c) => c.id === overColumnId);
    if (!destColNext) return;

    const cardIdx = sourceColNext.cards.findIndex((c) => c.id === activeCardId);
    if (cardIdx === -1) return;

    const [card] = sourceColNext.cards.splice(cardIdx, 1);
    let insertAt = destColNext.cards.length;
    if (over.data.current?.type === "card") {
      const idx = destColNext.cards.findIndex((c) => c.id === overId);
      if (idx >= 0) insertAt = idx;
    }
    destColNext.cards.splice(insertAt, 0, {
      ...card,
      column_id: overColumnId,
    });
    setColumns(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const originColumnId = dragOriginColumnRef.current;
    const originIndex = dragOriginIndexRef.current;
    setActiveCard(null);
    setActiveColumn(null);
    dragOriginColumnRef.current = null;
    dragOriginIndexRef.current = null;

    if (!over) return;

    const prev = columnsRef.current;

    // ── Card drop ────────────────────────────────────────────────────────
    if (active.data.current?.type === "card") {
      const cardId = active.id as string;
      const currentCol = prev.find((c) =>
        c.cards.some((cd) => cd.id === cardId)
      );
      if (!currentCol) return;

      const reorderedCards = currentCol.cards;
      const finalIdx = reorderedCards.findIndex((c) => c.id === cardId);
      if (finalIdx === -1) return;

      const sameColumn = originColumnId === currentCol.id;
      // No-op: never left original column AND ended at the original index.
      if (sameColumn && originIndex === finalIdx) return;

      const cardsWithFreshPositions: CardT[] = [];
      const updates: { id: string; columnId: string; position: string }[] = [];
      let lastPosition: string | null = null;

      try {
        for (const card of reorderedCards) {
          const position = generateKeyBetween(lastPosition, null);
          lastPosition = position;
          cardsWithFreshPositions.push({
            ...card,
            position,
            column_id: currentCol.id,
          });
          const movedBetweenColumns =
            card.id === cardId && originColumnId !== currentCol.id;
          if (
            movedBetweenColumns ||
            card.position !== position ||
            card.column_id !== currentCol.id
          ) {
            updates.push({ id: card.id, columnId: currentCol.id, position });
          }
        }
      } catch (e) {
        console.error("position generation failed", e);
        return;
      }

      const newCols = prev.map((c) =>
        c.id === currentCol.id ? { ...c, cards: cardsWithFreshPositions } : c
      );
      setColumns(newCols);

      reorderCardsAction(updates).then((result) => {
        if (!result.ok) {
          setColumns(prev);
          setError(`Kart kaydedilemedi: ${result.error}`);
        }
      });
      return;
    }

    // ── Column drop ──────────────────────────────────────────────────────
    if (active.data.current?.type === "column") {
      const activeId = active.id as string;
      const overId =
        over.data.current?.type === "card"
          ? (over.data.current?.columnId as string)
          : (over.id as string);
      if (!overId || activeId === overId) return;

      const oldIdx = prev.findIndex((c) => c.id === activeId);
      const newIdx = prev.findIndex((c) => c.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      const reordered = arrayMove(prev, oldIdx, newIdx);
      const updates: { id: string; position: string }[] = [];
      let lastPosition: string | null = null;

      let newCols: ColumnState[];
      try {
        newCols = reordered.map((column) => {
          const position = generateKeyBetween(lastPosition, null);
          lastPosition = position;
          if (column.position !== position) {
            updates.push({ id: column.id, position });
          }
          return { ...column, position };
        });
      } catch (e) {
        console.error("position generation failed", e);
        return;
      }

      setColumns(newCols);

      reorderColumnsAction(updates).then((result) => {
        if (!result.ok) {
          setColumns(prev);
          setError(`Sütun kaydedilemedi: ${result.error}`);
        }
      });
    }
  };

  // ── Mutation handlers (called by child components) ────────────────────
  const handleAddCard = async (columnId: string, title: string) => {
    const result = await addCardAction(initialBoard.id, columnId, title);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, cards: [...c.cards, result.card] } : c
      )
    );
  };

  const handleUpdateCard = async (
    id: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string
  ) => {
    const snapshot = columns;
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === id
            ? {
                ...c,
                title: title.trim(),
                description: description.trim() || null,
                start_date: startDate || null,
                due_date: dueDate || null,
              }
            : c
        ),
      }))
    );
    const result = await updateCardAction(
      id,
      title,
      description,
      startDate,
      dueDate
    );
    if (!result.ok) {
      setColumns(snapshot);
      setError(result.error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    const snapshot = columns;
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== id),
      }))
    );
    const result = await deleteCardAction(id);
    if (!result.ok) {
      setColumns(snapshot);
      setError(result.error);
    }
  };

  const handleAddColumn = async (title: string) => {
    const result = await addColumnAction(initialBoard.id, title);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setColumns((prev) => [...prev, { ...result.column, cards: [] }]);
  };

  const handleRenameColumn = async (id: string, title: string) => {
    const snapshot = columns;
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: title.trim() } : c))
    );
    const result = await renameColumnAction(id, title);
    if (!result.ok) {
      setColumns(snapshot);
      setError(result.error);
    }
  };

  const handleDeleteColumn = async (id: string) => {
    const snapshot = columns;
    setColumns((prev) => prev.filter((c) => c.id !== id));
    const result = await deleteColumnAction(id);
    if (!result.ok) {
      setColumns(snapshot);
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-4 py-2 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="hover:underline text-xs"
          >
            Kapat
          </button>
        </div>
      )}

      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-4 p-4 sm:p-6 items-start min-h-full">
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </SortableContext>
            <AddColumnForm onAdd={handleAddColumn} />
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <CardPreview card={activeCard} />
          ) : activeColumn ? (
            <div className="w-72 rounded-lg border border-black/30 dark:border-white/40 bg-zinc-50 dark:bg-zinc-900 p-3 shadow-xl rotate-1">
              <div className="text-sm font-semibold">{activeColumn.title}</div>
              <div className="mt-2 text-xs text-zinc-500">
                {activeColumn.cards.length} kart
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
