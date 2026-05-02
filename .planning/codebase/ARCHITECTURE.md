# Architecture

## System Overview
The system is a **Tabbed Single-Page Application (SPA)** built with Vanilla JavaScript and Supabase. It manages physical space bookings (rooms, auditoriums, labs) for UFMA Pinheiro.

## Core Design Patterns
- **Modular Monolith**: Logic is partitioned into ES modules based on domain (auth, calendar, db, etc.).
- **Global State**: A central `estado` object in `app.js` tracks application-wide state (user, filters, active charts).
- **Tabbed Routing**: Instead of URL-based routing, the app uses a `switchTab` mechanism to toggle visibility of content sections (`.tab-content`).
- **Data Mapping**: A dedicated `js/db.js` layer handles translation between database snake_case and frontend camelCase.

## Security & Auth
- **RBAC (Role-Based Access Control)**: Three roles defined:
  - `leitor`: View-only access.
  - `editor`: Can create and edit their own events.
  - `dono`: Full administrative access (delete any event, manage users, view dashboard).
- **Client-Side Guarding**: UI elements are shown/hidden based on roles in `js/auth.js`.

## Real-time Sync
The app is designed to stay in sync with the database, triggering UI updates across all "tabs" when data changes (`atualizarTodasTelas`).

## Components
- **Dashboard**: Analytic views using Chart.js.
- **Calendar**: Interactive schedule management via FullCalendar.
- **Admin**: User management, conflict resolution, and cancellation history.
- **Export**: Generates reports in Excel and PDF formats locally.
