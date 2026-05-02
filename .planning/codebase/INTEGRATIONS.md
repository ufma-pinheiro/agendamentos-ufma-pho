# Integrations

## Supabase
- **Role**: Primary backend, database, and authentication.
- **Pattern**: Directly called from frontend via `supabase-js`.
- **Key Files**: 
  - `supabaseClient.js`: Connection configuration.
  - `js/auth.js`: Handles session and role-based access.
  - `js/db.js`: Mapping between database schema and frontend models.

## FullCalendar
- **Role**: Main UI for viewing and interacting with space schedules.
- **Integration**: Configured in `js/calendar.js`. Handles event rendering and interaction hooks.

## Chart.js
- **Role**: Visualizes usage metrics in the Admin Dashboard.
- **Integration**: Logic located in `js/dashboard.js`.

## Browser APIs
- **LocalStorage**: Used for theme persistence (`themeUFMA`) and UI state (`sidebarCollapsed`).
- **Fetch/ESM**: Extensive use of ESM imports from CDNs (jsdelivr, unpkg, esm.sh).

## CDNs
- `cdn.jsdelivr.net`: Libraries (FullCalendar, Flatpickr, SweetAlert2, Chart.js, SheetJS).
- `cdnjs.cloudflare.com`: FontAwesome, jsPDF.
- `unpkg.com`: Tippy.js, Popper.js.
- `esm.sh`: Supabase JS client.
