export type Board = {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
};

export type Column = {
  id: string;
  board_id: string;
  title: string;
  position: string;
  created_at: string;
};

export type Card = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: string;
  created_at: string;
  updated_at: string;
};

export type BoardWithChildren = Board & {
  columns: (Column & { cards: Card[] })[];
};
