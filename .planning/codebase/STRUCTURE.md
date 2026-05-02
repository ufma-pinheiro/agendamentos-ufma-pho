# Project Structure

## Root Directory
- `index.html`: Main application entry point and UI shell.
- `app.js`: Main application controller and event orchestration.
- `style.css`: Global styling and theme variables.
- `login.html` / `login.js`: Dedicated authentication entry point.
- `supabaseClient.js`: Supabase connection initialization.
- `package.json`: Basic project configuration and scripts.

## `js/` (Logic Modules)
- `auth.js`: Authentication logic and RBAC.
- `calendar.js`: FullCalendar configuration and event loading.
- `components.js`: Reusable HTML generators (e.g., event cards).
- `conflitos.js`: Logic for detecting and displaying booking conflicts.
- `constants.js`: Shared constants (holidays, month names).
- `dashboard.js`: Analytics and Chart.js integration.
- `db.js`: Database abstraction and data transformation.
- `notifications.js`: Email notification rules and logging.
- `reservas.js`: CRUD operations for bookings and modal management.
- `utils.js`: Helper functions (formatting, debounce, UI helpers).

## `docs/` (Planning)
- `BACKLOG_ADMIN_DONO.md`: Task list for administrative features.
- `BACKLOG_USUARIO_EDITOR.md`: Task list for user-facing features.

## `.planning/` (System Intelligence)
- `codebase/`: Automated codebase mapping documents.
