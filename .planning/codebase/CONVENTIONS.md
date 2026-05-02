# Code Conventions

## JavaScript
- **Modules**: Standard ES Modules (`import`/`export`).
- **Naming**: `camelCase` for functions, variables, and file names.
- **Async**: Heavy use of `async/await` for database interactions.
- **Global Scope**: Explicitly exposing modules to `window` for inline HTML handlers (e.g., `window.switchTab`).
- **Logic Separation**: Domain-specific logic is moved out of `app.js` into files under `js/`.

## CSS
- **Methodology**: Non-strict BEM-like naming.
- **Variables**: Extensive use of `:root` variables for colors, spacing, and transitions.
- **Themes**: Support for `data-theme="light|dark"` implemented via CSS variables.

## Database (Supabase)
- **Naming**: `snake_case` for columns and tables.
- **Mapping**: Data is transformed in `js/db.js` before being used in the frontend.

## UI/UX
- **Feedback**: `SweetAlert2` used for all confirmations and errors.
- **Notifications**: `showToast` utility for ephemeral messages.
- **Loading**: Global `loadingOverlay` for initialization and state transitions.
- **Icons**: Always using `FontAwesome`.
