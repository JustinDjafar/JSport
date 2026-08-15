# JSport deployment progress

Last updated: 2026-08-15

## Completed

- Created and linked the Google Cloud project `jsport-production` to the Google Cloud Free Trial billing account.
- Installed Google Cloud CLI locally and authenticated it with the project.
- Created the production Cloud SQL instance:
  - Instance ID: `jsport-prod-db`
  - Database engine: PostgreSQL 17
  - Region: `asia-southeast2` (Jakarta)
  - Machine type: `db-g1-small` (1 shared vCPU, 1.7 GB RAM)
  - Storage: 10 GB SSD
  - Availability: single zone
  - Public IP enabled
  - Automated backups and point-in-time recovery enabled
  - Connection name: `jsport-production:asia-southeast2:jsport-prod-db`
- Confirmed the Cloud SQL instance reached `RUNNABLE`.
- Created the production application database and login:
  - Database: `jsport`
  - Login: `jsport_app`
- Stored the production database connection string in Google Secret Manager:
  - Secret: `jsport-db-connection`
  - Active version: `1`
- Installed Cloud SQL Auth Proxy v2 locally and applied the existing EF Core migrations:
  - `20260812161227_InitialBookingSchema`
  - `20260812173216_AddThirdCourt`
- Simplified the production booking schema:
  - Removed the single `venues` table.
  - Reduced `courts` to `id`, `name`, and `is_active` while preserving all three court IDs.
  - Moved the hourly rate to server configuration (`Booking:PricePerHour`).
  - Added `users` with Firebase UID, username, phone number, and email.
  - Linked `bookings` to `users` through `user_id`.
  - Applied migration `20260814031746_SimplifyCourtsAndAddUsers` and verified the production columns.
- Added Firebase Authentication integration to the API and customer UI:
  - Email/password signup and login.
  - Google sign-in.
  - Required username and phone profile completion.
  - Authenticated booking creation and ownership checks.
- Added Firebase to the existing `jsport-production` Google Cloud project and configured its web app.
- Enabled Firebase Authentication providers:
  - Email/password
  - Google
- Deployed the ASP.NET Core API to Cloud Run:
  - Service: `jsport-api`
  - Region: `asia-southeast2`
  - Revision: `jsport-api-00001-rvj`
  - URL: `https://jsport-api-490123100639.asia-southeast2.run.app`
  - Runtime identity: `jsport-api@jsport-production.iam.gserviceaccount.com`
  - Dedicated build identity: `jsport-builder@jsport-production.iam.gserviceaccount.com`
  - Cloud SQL and Secret Manager access configured with least-privilege IAM roles.
- Deployed the React/Vite customer site to Firebase Hosting:
  - URL: `https://jsport-production.web.app`
  - Frontend configured to call the production Cloud Run API.
  - Verified the homepage, `/events` route, availability API, Cloud SQL response, and production CORS.
- Successfully tested the live customer website end to end at `https://jsport-production.web.app`, including Firebase authentication and the production API/database connection.
- Added migration `20260815114520_AddUserRole` and applied it to production:
  - Added `users.role` with a database default of `member`.
  - Role promotion is not exposed by the API and must be performed manually in Cloud SQL.
  - Firebase identities are matched to database users server-side and the database role is added as a trusted authorization claim.
- Added account and recovery features:
  - Initial-based signed-in profile button and account dropdown.
  - Booking history and logout actions with logout confirmation.
  - Password visibility control inside the password input.
  - `/forgot-password` and `/reset-password` Firebase reset-code screens.
  - Neutral account placeholder while Firebase restores a session, preventing login/profile flashing.
- Added authenticated booking history:
  - `/history` returns and displays all bookings belonging to the signed-in user's `user_id`.
  - `/bookings` displays all customer bookings for database-verified administrators.
  - Admin bookings can be sorted by customer name, booking date, or court number.
  - Admin API endpoints reject unauthenticated and non-admin access server-side.
- Expanded the customer site navigation and content:
  - Shared global navigation for Home, Events, Facilities, and Rules.
  - `/facilities` with locally hosted court, sauna, prayer-room, and café imagery.
  - `/rules` with compact visual signs for footwear, food, hydration, timing, safety, and etiquette.
  - Client-side header navigation to avoid stale per-route browser cache snapshots.
  - Playfair Display replaces Italiana for clearer display headings while retaining an elegant serif style.
- Fixed responsive header overflow, native button-border artifacts, booking-status rendering crashes, and route-to-route layout movement.
- Current production API revision before the latest frontend-only release: `jsport-api-00006-qv9`.

## Paused here

The production customer website, authentication, user/admin booking history, API, and database flow are live. The latest pending frontend release adds stable scrollbar geometry and smooth header view transitions between routes.

Next session, connect the custom domains in this order:

- `jsport.com` to Firebase Hosting.
- `api.jsport.com` to Cloud Run.
- Add `jsport.com` to Firebase Authentication authorized domains.
- Update Cloud Run production CORS to allow `https://jsport.com`.
- Change `VITE_API_URL` to `https://api.jsport.com`, rebuild, redeploy Firebase Hosting, and verify login plus booking on the custom domain.

After the customer domains are stable, continue with the separate admin React site at `admin.jsport.com`, including application authentication and server-side admin-role enforcement.

Do not put database passwords, connection strings, API keys, or other secrets in this file or in source control.

## Deferred deployment work

- Connect the live customer Firebase Hosting site to `jsport.com`.
- Connect the live Cloud Run API to `api.jsport.com`.
- Build and deploy the separate admin React site at `admin.jsport.com`, with application authentication and server-side admin-role enforcement.

## Later environment work

- Create sandbox resources in a separate Google Cloud/Firebase project.
- Ensure sandbox never reads or writes production booking data.
