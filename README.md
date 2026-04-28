# TaskFlow

TaskFlow is a Trello-style Kanban project management board. Users can create an account, create boards, add columns and cards, edit card details, and move cards or columns with drag-and-drop. Ordering is saved in Supabase, so the board keeps its state after refresh.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth and Postgres
- dnd-kit
- Tailwind CSS
- Vercel

## Features

- User registration, login, and logout
- Board creation and deletion
- Column creation, renaming, deletion, and reordering
- Card creation, editing, deletion, and reordering
- Drag-and-drop cards within a column and between columns
- Persistent card and column order after refresh
- Responsive layout with touch drag support
- Supabase row-level security for owner-only board access

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the SQL schema in Supabase:

```text
db/schema.sql
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Data Model

The main relationship is:

```text
boards -> columns -> cards
```

Each board belongs to a Supabase auth user. Columns belong to a board. Cards belong to both a board and a column.

Important fields:

- `boards.owner_id`: board owner
- `columns.board_id`: parent board
- `columns.position`: persisted column order
- `cards.board_id`: parent board, denormalized for RLS checks
- `cards.column_id`: parent column
- `cards.position`: persisted card order

## Ordering Strategy

Ordering is stored with text-based fractional position keys, not numeric indexes. The app uses `fractional-indexing` to create sortable position values.

For simple inserts, a new position can be generated after the last item. For drag-and-drop reordering, the app saves the final visible order with fresh fractional positions for the affected list. This avoids invalid neighbor-key cases and keeps ordering stable after refresh.

## Drag-and-Drop Choice

`dnd-kit` was selected because it is actively maintained, flexible, and works well with React sortable interfaces. It also supports pointer and touch sensors, which helps with desktop and mobile usage.

Compared with alternatives:

- `dnd-kit`: modern, flexible, good React support, touch sensor support
- `@hello-pangea/dnd`: familiar list-based API, but less flexible for mixed column/card behavior
- `SortableJS`: mature and lightweight, but less React-native
- Browser drag-and-drop: no extra dependency, but weaker mobile/touch experience

## Mobile Usability

The board uses a touch sensor with a short press delay for mobile drag-and-drop. The layout allows horizontal scrolling across columns. This is not a native mobile app, but the board remains usable on smaller screens.

## Scope Decisions

For a 48-hour project, the focus was the core Kanban workflow:

- authentication
- board/column/card CRUD
- reliable drag-and-drop
- persistent ordering
- clean responsive UI

Features intentionally left out:

- labels
- due dates
- assignees
- board sharing
- activity history
- real-time collaboration

These would be useful next steps, but they were not prioritized over making the main drag-and-drop and persistence flow reliable.

## Deployment

The app is designed to run on Vercel. Required Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Before deploying, make sure the Supabase schema from `db/schema.sql` has been applied and authentication is configured in the Supabase project.
