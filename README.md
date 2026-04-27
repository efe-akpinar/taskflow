Project Name: TaskFlow

Description:
TaskFlow is a Kanban-style project management board where users can create boards, columns, and task cards. Cards can be moved between columns using drag-and-drop, and the order is persisted in the database.

Tech Stack:
Next.js, TypeScript, Supabase, dnd-kit, Tailwind CSS, Vercel

Main Features:
- Authentication
- Board creation
- Column and card management
- Drag-and-drop card movement
- Persistent card ordering
- Responsive interface

Design Decisions:
- dnd-kit was selected because it is modern, flexible, and supports sortable drag-and-drop interfaces.
- Supabase was used for authentication and persistent relational data.
- Card ordering is stored using a numeric position field.