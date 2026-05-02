# Technical Stack

## Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+ ESM)
- **Frameworks**: None (Vanilla JS)
- **Styling**: Vanilla CSS with CSS Variables for theme support (Light/Dark mode)
- **Modules**: ESM imports via `https://esm.sh`

## Backend & Infrastructure
- **Provider**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (RBAC: leitor, editor, dono)
- **Storage**: Supabase (referenced in code)
- **Hosting**: Likely Vercel (implied by CSP)

## Libraries & Tools
- **Calendar**: FullCalendar 6.1.11
- **Charts**: Chart.js
- **UI Components**:
  - SweetAlert2 (Modals and Alerts)
  - Flatpickr (Date/Time Picker)
  - Tippy.js / Popper.js (Tooltips)
- **Icons**: FontAwesome 6.5.0
- **Typography**: Google Fonts (Plus Jakarta Sans, Inter)
- **Export**:
  - SheetJS / xlsx (Excel)
  - jsPDF / jsPDF-AutoTable (PDF)
- **Utilities**: 
  - `https://esm.sh` for module loading
  - `serve` for local development
