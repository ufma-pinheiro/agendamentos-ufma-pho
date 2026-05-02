# Concerns & Technical Debt

## Architectural Concerns
- **Fat Controller**: `app.js` is over 1,000 lines long. While modularization has begun, it still orchestrates too many disparate concerns.
- **Global Scope Dependency**: Reliance on `window` for event handlers (`onclick`) makes the code harder to track and refactor compared to modern event listener patterns.
- **Library Loading**: Heavy reliance on CDN-loaded scripts in `index.html` creates performance bottlenecks and external dependencies that could break if the CDN is unavailable.

## Security
- **Hardcoded Keys**: The Supabase URL and Anon Key are hardcoded in `supabaseClient.js`. While common for public clients, this requires absolute trust in Row Level Security (RLS) policies.
- **CSP Maintenance**: The Content Security Policy is complex and might break when adding new external integrations.

## Maintainability
- **Lack of Types**: Being a Vanilla JS project, there is no type safety (TypeScript), which increases the risk of runtime errors as the codebase grows.
- **Implicit Database Schema**: The frontend assumes a specific database schema without formal models or validation layers.

## Performance
- **Dashboard Calculations**: Analytics metrics are calculated on the fly in the frontend, which may become slow as the volume of bookings increases.
- **DOM Manipulations**: Direct DOM manipulation is used extensively, which is prone to state-syncing bugs (hydration-like issues).
