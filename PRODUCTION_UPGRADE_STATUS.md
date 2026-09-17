# Asian News Bureau — Production Release Status

This archive is the current production-hardened source release. It intentionally excludes `.env` files, `node_modules`, `.git`, build caches, and runtime logs.

## Completed in this source release

### Security and authentication
- Removed embedded production credentials from deployment configuration.
- Removed automatic/default admin creation from server startup.
- Added explicit admin creation command: `npm run admin:create`.
- Added server-side refresh-token sessions with hashed tokens, expiry, rotation, and revocation.
- Standardized refresh requests on `{ refreshToken }` across clients/API.
- Revoked all active sessions after password reset and account deactivation.
- Hardened user serialization so password hashes, reset tokens, and push-token data are not exposed.
- Added consistent password validation to password reset.
- Restricted CORS to configured origins and enabled proxy-aware rate limiting.
- Added validation/rate limits to sensitive mutation endpoints.

### Data integrity and moderation
- Added transaction-backed, idempotent credit awards and a credit ledger.
- Fixed admin credit adjustment semantics: positive amount + explicit `credit`/`debit` action.
- Added atomic credit deductions.
- Made submission approval transactional and duplicate-safe.
- Added submission claim, under-review, request-changes, revision, and resubmission support.
- Added admin audit logging for sensitive operations.
- Added soft-delete/archive semantics for published news.
- Added separate `NewsLike`, `Comment`, `Report`, `SavedStory`, `Session`, `PushToken`, `HighlightSeen`, `SubmissionRevision`, `AdminAuditLog`, `PlatformSetting`, and `PushDelivery` models.
- Added unique constraints/idempotency for social actions and push-delivery records.
- Added Cloudinary cleanup/error handling for failed media persistence.

### Notifications and push delivery
- Added real Expo push notification delivery.
- Added mobile push permission/token registration and logout-time device deregistration.
- Added Android notification channel configuration.
- Added Expo ticket persistence and scheduled receipt processing.
- Deactivates `DeviceNotRegistered` tokens after ticket/receipt failures.
- Added unread-count synchronization and OS badge updates.
- Added notification-tap navigation to related stories/submissions.
- Added per-user contributor-highlight visibility instead of a global "shown" flag.

### Uploads and media
- Replaced large in-memory multipart buffers with disk-backed temporary uploads.
- Added per-type size/MIME restrictions and profile-image-only validation.
- Added video thumbnail generation for feed cards.
- Reduced mobile feed video initialization by showing thumbnails and opening real video playback on detail.
- Added cleanup paths for cloud assets when downstream persistence fails.

### Mobile app
- Fixed refresh-token persistence/rotation.
- Fixed like-count state to use server-derived `likesCount` and `liked` rather than the legacy embedded likes array.
- Added saved stories in Search/News Detail.
- Added debounced search.
- Added deep-link-aware sharing.
- Added notification badge/tap handling.
- Added real My Submissions / status / resubmission UI.
- Added Profile shortcuts for submissions and saved stories.
- Added proper credit transaction sign semantics.
- Added media thumbnails for video selections.

### Admin panel
- Added moderation claim/request-changes/reject workflow UI.
- Added Reports workflow UI.
- Added Audit Log UI.
- Added explicit credit adjustment UI.
- Added persisted platform settings for branding and credit configuration.
- Removed placeholder settings behaviour.
- Corrected dashboard calendar-period handling and removed misleading hard-coded analytics changes.

### Operational readiness
- Server startup now waits for database readiness.
- Added `/health` and `/ready` endpoints.
- Added graceful shutdown handling.
- Added syntax-check and legacy migration tooling.
- Corrected weekly/monthly contributor-period calculations.
- Added mutation-specific rate limiting instead of throttling normal admin reads.

## Not claimed as complete

### Verification that requires real infrastructure/devices
1. A full integration run against a staging MongoDB Atlas replica set has not been executed in this environment. MongoDB transactions and index behaviour therefore still need real staging verification.
2. Real Cloudinary upload/delete behaviour has not been exercised against the production Cloudinary account.
3. Expo push delivery has not been exercised on a physical EAS-built iOS/Android device in this environment. The implementation records tickets and processes Expo receipts, but actual device delivery still depends on the deployment's Expo/EAS credentials, APNs/FCM configuration, and device permissions.
4. Full Jest integration/concurrency coverage has not been executed because the uploaded dependency tree was corrupted and a clean dependency install could not complete in the available execution environment.
5. Full Vite admin build and Expo native build need to be run after a clean `npm ci` in their respective directories.
6. `npm run migrate:legacy` must be run once against a backed-up production/staging database if legacy embedded likes/comments/reports data exists.

### Product extensions intentionally not included in this release
These were proposed as optional "crazy MVP" extensions rather than bug fixes, and are therefore not falsely presented as finished:

- AI-assisted duplicate-story detection.
- AI-assisted moderation/evidence summarization.
- Contributor trust/reputation scoring beyond existing contribution counters.
- An in-app map-based news explorer.
- Full multilingual translation workflow.
- Contributor achievement/badge system.
- Preference-driven personalized feed ranking.
- Full NGO impact analytics dashboard.
- A richer source/evidence attachment workflow beyond the existing media/submission data.

These require additional product decisions and, in some cases, external services/provider configuration. They are deliberately separated from the production-hardening work so the core release remains deterministic and maintainable.

## Verification performed on source

- All server JavaScript files pass `node --check`.
- All TypeScript/TSX source files parse successfully with the available TypeScript compiler.
- `git diff --check` passes.
- The release package is validated with `unzip -t` before delivery.
- Dependencies are intentionally not packaged; install them from the committed lockfiles with `npm ci`.

A clean source build plus staging integration/device verification is still required before calling a deployment production-certified. This archive is the current hardened source release, not a mathematical guarantee of zero defects.
