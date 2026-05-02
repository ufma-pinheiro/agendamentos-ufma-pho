# Testing

## Current State
- **Automated Tests**: None identified. The `test` script in `package.json` is a placeholder.
- **Manual Verification**: Features are verified manually through the browser interface.

## Critical Paths for Manual Testing
1. **Authentication**: Login flow and RBAC persistence.
2. **Bookings**: Creating, editing, and deleting events (single and recurring).
3. **Conflicts**: Detection of overlapping bookings in the same physical space.
4. **Admin**: User permission management and dashboard metric accuracy.
5. **Exports**: Correct generation of Excel and PDF files.

## Future Recommendations
- Implement E2E tests for the booking flow using Playwright or Cypress.
- Add unit tests for utility functions in `js/utils.js`.
- Verify Supabase RLS (Row Level Security) policies to ensure RBAC is enforced at the database level.
