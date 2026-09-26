# Report and block implementation

## Manual database setup

Run the exact SQL in [backend/sql/report-block.sql](backend/sql/report-block.sql) in Supabase SQL Editor **before starting the updated backend**. It creates both tables, constraints, indexes, private RLS configuration, and revokes direct access from Supabase browser roles. It is a one-time migration. No SQL was executed as part of this implementation.

The existing Express database connection must use the table owner or a role with BYPASSRLS. Authorization uses the existing Express JWT middleware, not Supabase browser authentication. No Supabase configuration or authentication flows were changed.

## Endpoints

All five routes require `Authorization: Bearer <JWT>` and derive identity only from `req.user.id`.

| Endpoint | Behavior |
| --- | --- |
| `POST /api/reports/users/:userId` | Allowed reason and optional details up to 500 characters; rejects self/missing target. |
| `POST /api/reports/jobs/:jobId` | Same validation with work-specific reasons; rejects own/missing work. |
| `POST /api/blocks/:userId` | Creates own block and rejects pending applications in both directions in one transaction. |
| `DELETE /api/blocks/:userId` | Removes only caller-owned block; never restores applications. |
| `GET /api/blocks` | Only caller's blocked users: user_id, name, profile_picture_url, created_at. |

New reports return 201; duplicates return 200 with `alreadyReported: true` and a friendly message. Blocks/unblocks are idempotent for existing targets. Invalid inputs/self-actions return 400, missing targets 404, missing/invalid authentication 401. Database errors return generic messages. Reports remain pending for future review and do not hide jobs or punish users. Safety actions create no notifications.

## Enforcement and retained history

- `usersBlockedBetween(db, userA, userB)` checks both block directions.
- Apply route checks before inserting applications. Application acceptance also checks blocks to prevent accepting a block-rejected application through the status endpoint.
- Message POST checks after participant authorization and before insertion. Message GET retains its existing participant/history authorization. Chat shows a neutral unavailable state and disables sending, while retaining history.
- Public profiles mask email/phone across either block direction regardless of accepted/completed status. Applicant-list email and My Applications poster email/phone are also masked in their SQL projections.
- Blocking only updates `pending` applications in either direction. Accepted/completed applications, reviews and messages remain untouched. Existing accepted work can still be completed normally. Unblocking does not undo earlier rejections; a reverse block still prevents interaction.
- Public profiles disclose only whether the viewer personally blocked that profile, never who blocked/reported the viewer. Chat uses a neutral messaging availability flag.
- NearbyJobs already carries owner IDs as `postedBy.id`; it filters those in the viewer's own blocked list. Anonymous browsing remains unchanged. Backend enforcement remains authoritative if loading/filtering fails.
- Short safety-write transactions share a PostgreSQL advisory lock before existing job locks. This orders blocks/unblocks, apply, acceptance and message sends, preventing check/insert races. This conservative MVP approach serializes these writes across users; pair-specific locking can be considered if traffic warrants it.

## Files

Modified:

- `backend/server.js`: route registration, interaction enforcement, contact masking.
- `src/pages/UserProfile.jsx`: subtle safety actions, own-block state, contact refresh.
- `src/pages/JobDetails.jsx`: Report Work below details.
- `src/pages/Profile.jsx`: compact blocked-users section.
- `src/pages/Chat.jsx`: neutral send restriction, history retained, separate send errors.
- `src/components/NearbyJobs.jsx`: filter personally blocked posters.

Added:

- `backend/safety.js`: validation, routes, shared relationship/transaction helpers.
- `backend/safety.test.js`: isolated backend route tests with a mocked database.
- `backend/sql/report-block.sql`: exact manual migration.
- `src/api/safety.js`: authenticated safety API requests and change event.
- `src/components/SafetyActions.jsx`: report dialogs and block confirmation using native modal dialog focus handling.
- `src/components/SafetyActions.css`: scoped modal and secondary-action styling.
- `src/components/BlockedUsers.jsx`: safe list and unblock controls.
- `REPORT_BLOCK.md`: setup, implementation and validation notes.

## Validation

Commands:

```text
node --check backend/server.js
node --check backend/safety.js
node --check backend/safety.test.js
node --test backend/safety.test.js
npm.cmd run build
npx.cmd eslint src/components/SafetyActions.jsx src/components/BlockedUsers.jsx src/api/safety.js src/pages/UserProfile.jsx src/pages/JobDetails.jsx src/pages/Profile.jsx src/pages/Chat.jsx src/components/NearbyJobs.jsx
```

The tests exercise actual registered Express handlers in isolation with scripted database responses. They cover authentication, trusted identity, target/reason/details validation, self/duplicate reports, own-job reports, block/unblock/list, block rollback, pending-only SQL in both directions, denied application/message/acceptance writes, authorized chat history, contact masking, and allowed interactions when unblocked. They do not execute SQL or prove live PostgreSQL constraints/concurrency behavior. Browser interaction and live Supabase checks remain to be performed after manual migration.

Use two test accounts A and B after migration:

1. Report B as A; retry and check the friendly duplicate message. Try self-reporting through the API and confirm 400.
2. Report B's work; repeat; try A's own work and confirm 400. Work should remain listed.
3. Prepare pending applications in both directions plus separate accepted/completed records and chat history.
4. Block B as A. Verify both pending directions become rejected, accepted/completed records stay unchanged, and no safety notifications appear.
5. Attempt new applications and messages in both directions, including direct API requests. Verify neutral 403 responses. Attempt acceptance of a block-rejected application and confirm denial.
6. Confirm both participants can read accepted/completed chat history; a third account cannot.
7. Confirm email/phone are absent from public-profile, applicants and My Applications responses, even for accepted/completed work.
8. Confirm A's blocked-users section shows only safe fields and A no longer sees B's jobs in NearbyJobs. Check report/block modals on mobile and with keyboard navigation.
9. Unblock B. Check list refresh and restored eligible contact/messaging access; previous rejected applications must remain rejected. Repeat with B also blocking A to verify one-sided unblocking does not remove the reverse restriction.
10. Check network errors and expired sessions show friendly messages. Confirm ordinary login, photos, work completion, reviews and notifications still work.

Next safety feature: an authenticated admin moderation page to review pending reports and deliberately mark them reviewed, dismissed or actioned.
