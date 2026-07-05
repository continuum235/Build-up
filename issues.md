## Here's my analysis:

Issues Found
❌ LanguageContext — Module-Level Side Effects (Anti-Pattern)
src/context/LanguageContext.tsx:21-22 calls setI18nConfig(initialLanguage) at module scope. This runs on import, not on Provider mount. Same issue in src/localization/i18n.ts:12 where i18n.locale is set at module level. Move these into the Provider or a useEffect.
❌ t Function from i18n.ts is Static
The t exported from src/localization/i18n.ts:18 is a closure over the module-level i18n instance — it won't reflect locale changes. Only t from useLanguage() context is reactive. Any direct import of t from i18n.ts is a bug waiting to happen.
❌ Seed Data Imported Directly in 4 Screens
jobsSeedData.json is imported raw in FindJobsScreen.tsx, YourJobsScreen.tsx, EmployerRoleTitleScreen.tsx, JobDetailsScreen.tsx. Couples screens to raw JSON. Should go through a service/hook layer.
⚠️ ProfileContext — Single Massive State Object
All profile fields in one useState<Profile> object means any field change re-renders all consumers. Acceptable for this app size, but splitting into smaller contexts (e.g., AuthContext, ProfileFormContext) would scale better.
⚠️ Redundant prop-drilling


Suggested Folder Structure
src/
├── components/
│ ├── ui/ # Reusable primitives (Button, TextInput)
│ ├── layout/ # BottomNavigation, KeyboardSafeWrapper
│ └── jobs/ # JobDetails, BroadcastJobsEmptyState
├── screens/
│ ├── onboarding/ # Welcome, LanguageSelection, Login, Signup
│ ├── profile-setup/ # RoleType, Upload, RoleTitle, Skills, Bio, HourlyRate, EnterDetails
│ └── main/ # FindJobs, YourJobs, JobDetails, Messages, Profile
├── context/ # LanguageContext, ProfileContext
├── hooks/ # useJobs, useTranslation, etc.
├── services/ # jobsService, profileService
├── navigation/ # AppNavigator, types.ts, routes.ts
├── localization/ # i18n.ts, translations/
├── types/ # Shared TypeScript types
├── utils/ # validation.ts
└── data/ # Seed data
Quick Wins

1. Delete BroadcastJobsEmptyState.tsx (dead file)
2. Type the navigator: Add RootStackParamList type and pass to createNativeStackNavigator<RootStackParamList>()
3. Type navigation props: Replace navigation: any with the proper navigator type
4. Move module-level side effects: Put setI18nConfig() inside the LanguageProvider component
5. Remove NativeWind if you're not using it (or migrate to it consistently)
6. Create a useJobs hook to wrap seed data access, making it easy to swap with a real API later


• Folder structure is decent for the current size. src/screens, src/components, src/context, src/hooks, src/services, src/navigation, src/localization is a good React Native base. The bigger issue is that
  some files are starting to mix UI, mock data rules, state transitions, and formatting logic.

  Highest Impact

  1. Move job/application/business logic out of screens.
      - src/screens/FindJobsScreen.tsx:75 filters jobs inline.
      - src/screens/JobBoardScreen.tsx:48 maps seed jobs and creates custom jobs inline.
      - src/screens/YourJobsScreen.tsx:69 hardcodes proposal/active/completed jobs.

     Suggested structure:

     src/features/jobs/
       components/
       hooks/
       services/
       types.ts
       utils.ts
     src/features/profile/
     src/features/applications/
     src/features/engagements/

  2. Introduce shared domain types.
     Right now frontend job states like "standby" / "Accepted" and Prisma enums like PENDING, ACCEPTED, ACTIVE can drift. Add shared frontend types in something like:

     src/types/domain.ts

     Use ApplicationStatus, EngagementStatus, JobStatus, Role consistently.

  3. Do not keep passwords in profile state.
     src/context/ProfileContext.tsx:12 stores password. Once Clerk/auth is connected, remove this from app state entirely. Auth credentials should not live in a reusable profile context.

  4. Split large screens into smaller components.
     FindJobsScreen and JobBoardScreen are doing too much. Extract:

     JobTabs.tsx
     JobFilterChips.tsx
     JobSearchBar.tsx
     AddJobModal.tsx
     BroadcastJobModal.tsx
     EmptyState.tsx

  5. Add an API/server structure before backend grows.
     Since Prisma now exists, server should move beyond only prisma/:

     server/src/
       app.ts
       db.ts
       routes/
         jobs.routes.ts
         applications.routes.ts
         engagements.routes.ts
       services/
         jobs.service.ts
         applications.service.ts
         engagements.service.ts
       validators/

  Good So Far

  - npm run lint passes.
  - npx tsc --noEmit passes.
  - Navigation and localization are organized clearly.
  - JobDetails is a good reusable component foundation.
  - Prisma schema is now a better fit for the marketplace model.

  Next Quality Step
  The best next move is to create src/features/jobs/ and migrate the job-related screen logic there first. That will make it much easier to later replace jobsSeedData.json with real API calls without
  rewriting the screens.


  From server/, start the backend:

  npm run dev

  Then verify in two steps.

  1. Public health check:

  curl http://localhost:3000/health

  Expected:

  {"status":"ok"}

  2. Clerk-protected route:

  Get a Clerk session token from the Expo app using getToken(), then call:


  Expected success response:

  {
    "user": {
      "id": "...",
      "clerkId": "user_...",
      "email": "...",
    }
  }

  You can also check the current synced user:

  curl http://localhost:3000/auth/me \
    -H "Authorization: Bearer YOUR_CLERK_TOKEN"

  If you call /auth/me or /auth/sync without the bearer token, you should get:

  {"message":"Unauthorized"}

  That confirms Clerk middleware is protecting the route.

 Implemented so far in the backend:

  - Express server entrypoint: server/src/server.ts
  - Clerk middleware mounted globally with clerkMiddleware()
  - Prisma client setup using Neon adapter for Prisma 7
  - Auth routes:
      - GET /health
      - POST /auth/sync
      - GET /auth/me

  - Auth middleware:
      - requireAuth
      - reads Clerk auth from bearer token
      - sets req.auth.userId

  - Role middleware:
      - requireRole(role)
      - finds local user by clerkId
      - checks HIRER or WORKER
      - sets req.currentUser

  - Auth controller:
      - syncs Clerk user into PostgreSQL using Prisma
      - trusts Clerk for clerkId, email, and name
      - accepts only app-specific role from client

  - Server TypeScript config
  - Server ESLint config
  - Scripts:
      - npm run dev
      - npm run build
      - npm run lint
      - npm run lint:fix
      - npm start

  Not implemented yet:

  - Job CRUD routes/controllers
  - Application routes/controllers
  - Engagement/review routes
  - Frontend Clerk integration
  - Calling /auth/sync from Expo after login

  So right now the backend can verify Clerk tokens and create/update your local User row. Full marketplace CRUD is the next backend step.


  Code Quality Assessment
This is a clean, well-structured implementation. Here's the breakdown:
Aspect	Grade	Notes
File organization	✅	Controllers, middleware, routes, lib — proper separation
TypeScript usage	✅	Proper types, global augmentation, isRole type guard
Error handling	✅	401/400/404/403/500 responses, error middleware at app level
Security	✅	Clerk middleware globally, requireAuth on protected routes, role-based access
DB layer	✅	Prisma with Neon adapter, upsert pattern for sync, proper selects (no leaks)
Overall: Production-quality starter. No blockers.
Minor Improvements (optional)
1. Redundant auth checks — auth.controller.ts:25 and auth.controller.ts:69 check req.auth?.userId which is already guaranteed by requireAuth middleware. Remove them to keep controllers "skinny" and trust your middleware.
2. Add input validation — Consider Zod for POST /auth/sync body validation instead of the manual isRole check. Scales better as more routes are added.
3. Prisma client singleton — Already done in lib/prisma.ts 👍. Just ensure it's not re-created on hot reloads in dev (fine since tsx watch re-runs the module).


How to Proceed (Backend First)
The natural order, each building on the previous:
Phase 1 — Job CRUD (/jobs)
- Create routes/job.routes.ts → controllers/job.controller.ts
- GET /jobs — list with filters (status, category, location) — public 
- GET /jobs/:id — public
- POST /jobs — HIRER only (requireAuth + requireRole("HIRER")) 
- PATCH /jobs/:id — HIRER only (owns the job) 
- DELETE /jobs/:id — HIRER only (owns the job) 
- Implement pagination and query params for filtering
Phase 2 — Application CRUD (/applications)
- POST /jobs/:jobId/apply — WORKER only, checks job is OPEN, prevents duplicate
- GET /jobs/:jobId/applications — HIRER who owns the job
- PATCH /applications/:id — HIRER accepts/rejects
- GET /workers/me/applications — WORKER sees their own
Phase 3 — Engagements & Reviews
- POST /applications/:id/engage — HIRER creates engagement from accepted application
- PATCH /engagements/:id — complete/cancel
- POST /engagements/:id/review — both parties can review, prevents self-review
- GET /users/:id/reviews — public reviews for a user
Phase 4 — Frontend Clerk Integration
- Add @clerk/clerk-expo to the Expo project
- Wrap root with <ClerkProvider publishableKey={...}>
- Add sign-in/sign-up screens using Clerk components
- Call /auth/sync after successful auth (in useEffect after useAuth().isSignedIn)
- Protect routes with Clerk's useAuth() or <SignedIn> component
Suggested File Structure for Phases 1–3
src/
  routes/
    auth.routes.ts     (existing)
    job.routes.ts      ← new
    application.routes.ts  ← new
    engagement.routes.ts   ← new
    review.routes.ts       ← new
  controllers/
    auth.controller.ts     (existing)
    job.controller.ts      ← new
    application.controller.ts  ← new
    engagement.controller.ts   ← new
    review.controller.ts       ← new
  middleware/
    auth.ts              (existing)
    requireRole.ts       (existing)
    validate.ts          ← new (optional Zod helper)
Start now?
I can begin implementing Phase 1 (Job CRUD) as soon as you're ready. It follows the exact same patterns as the auth routes — new router, new controller, requireAuth + requireRole middleware, Prisma queries. Want me to start?




Start the server first:
cd server && npm run dev
Then verify each endpoint in another terminal:
# 1. Public list
curl http://localhost:3000/jobs

# 2. Pagination + filters
curl "http://localhost:3000/jobs?page=1&limit=5&category=PLUMBER&location=Mumbai"

# 3. Single job (replace :id with an actual ID)
curl http://localhost:3000/jobs/JOB_ID

# 4. Create job (HIRER only — needs a Clerk token)
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix sink",
    "description": "Kitchen sink leaking",
    "location": "Mumbai",
    "budget": 5000,
    "budgetType": "FIXED",
    "experience": 2,
    "category": "PLUMBER",
    "startDate": "2026-07-10"
  }'

# 5. Update job (HIRER owner only)
curl -X PATCH http://localhost:3000/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix kitchen sink"}'

# 6. Delete job (HIRER owner only)
curl -X DELETE http://localhost:3000/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# 7. Unauthorized access
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}'
# → {"message":"Unauthorized"}
For the HIRER-only routes, you first need a Clerk session token. Get one from:
- Your Expo app after implementing Clerk (not yet done), or
- Clerk dashboard → Users → your test user → copy a session token, or
- Use Clerk's API key directly to create a test token
Want me to start the server and run the checks now?

Here's the screen breakdown by category:
Onboarding (pre-role selection):
Screen
WelcomeScreen
LanguageSelectionScreen
LoginScreen
SignupScreen
RoleTypeScreen
Employee (jobSeeker) flow — after selecting "jobSeeker":
- RoleTitleScreen → UploadScreen → LanguageScreen → SkillsScreen → BioScreen → HourlyRateScreen → EnterDetailsScreen
Hirer (employer) flow — after selecting "employer":
- EmployerRoleTitleScreen → then merges into the same shared screens: UploadScreen → LanguageScreen → SkillsScreen → BioScreen → HourlyRateScreen → EnterDetailsScreen
Post-onboarding (shared by both roles):
- FindJobsScreen — Browse jobs
- JobDetailsScreen — Job detail view
- YourJobsScreen — User's jobs (applied/posted)
- JobBoardScreen — Job board listing
- ProfileScreen — Profile management
- MessagesScreen — Messaging
The two flows diverge only at the first step after role selection (RoleTitleScreen vs EmployerRoleTitleScreen), then converge through the rest of profile setup. Want me to detail what any of these screens contain?


Based on your goal, here are the redefined phases for a worker-choice marketplace (Uber/Zomato model), not a hirer-controlled job portal:
Phase 1 — Job CRUD ✅ (Already exists)
GET /jobs, GET /jobs/:id, POST /jobs, PATCH /jobs/:id, DELETE /jobs/:id
- Hirer posts jobs with wage, location, category
- Workers browse open jobs publicly
Phase 2 — Refactor: Remove Applications → Worker Choice
This is the core shift. Tear out the Application model entirely:
- POST /jobs/:jobId/accept — Worker claims a job → creates Engagement directly, marks Job as FILLED
- POST /jobs/:jobId/reject — Worker dismisses a job → creates JobDismissal so it doesn't reappear
- GET /workers/me/jobs — Worker sees their active engagements + available open jobs (minus dismissed)
- GET /hirers/me/jobs — Hirer sees their posted jobs and which worker took them
Schema changes: drop Application, add JobDismissal, simplify Engagement (no applicationId/activeWorkerId — just a direct link from Job to Engagement).
Phase 3 — Engagements & Reviews
- PATCH /engagements/:id — Complete or cancel an engagement
- POST /engagements/:id/review — Both parties rate each other (no self-review)
- GET /users/:id/reviews — Public profile reviews
Phase 4 — Frontend with Clerk
- Add @clerk/clerk-expo to Expo project
- Sign-in/sign-up screens
- POST /auth/sync after successful auth
- Worker-facing job board (see open jobs, accept/reject)
- Hirer-facing job management (post, edit, see who took the job)
The key difference from the original plan: Phase 2 is not "Application CRUD" — it's "Worker Accept/Reject", putting the power to choose in the worker's hands, exactly like Uber/Zomato. Want me to start implementing Phase 2?


Phase 2 is implemented and verified (TypeScript compiles, lint passes, migration applied). Here's what changed:
Schema changes (server/prisma/schema.prisma)
- Removed Application model and ApplicationStatus enum
- Removed applications relation from User and Job
- Simplified Engagement — dropped applicationId, activeWorkerId, startDate, endDate; now a clean 1:1 with Job via jobId @unique
- Added JobDismissal model with @@unique([workerId, jobId]) — one dismissal per worker per job
New files
File	Purpose
src/controllers/worker.controller.ts	acceptJob, rejectJob, getMyWorkerJobs
src/controllers/hirer.controller.ts	getMyHirerJobs
src/routes/worker.routes.ts	GET /workers/me/jobs
src/routes/hirer.routes.ts	GET /hirers/me/jobs
Modified files
File	Change
src/routes/job.routes.ts	Added POST /jobs/:jobId/accept and POST /jobs/:jobId/reject (both require WORKER role)
src/server.ts	Registered /workers and /hirers routers
prisma/migrations/	Fresh migration 20260705181600_worker_choice_marketplace
Final API surface
Method	Endpoint	Auth	Role
GET	/jobs	—	Public
GET	/jobs/:id	—	Public
POST	/jobs	✓	HIRER
PATCH	/jobs/:id	✓	HIRER
DELETE	/jobs/:id	✓	HIRER
POST	/jobs/:jobId/accept	✓	WORKER
POST	/jobs/:jobId/reject	✓	WORKER
GET	/workers/me/jobs	✓	WORKER
GET	/hirers/me/jobs	✓	HIRER
POST	/auth/sync	✓	—
GET	/auth/me	✓	—
Worker flow
1. Worker calls GET /workers/me/jobs — gets their active engagement + all open jobs (minus dismissed)
2. Worker calls POST /jobs/:jobId/accept — creates Engagement, marks job FILLED (fails if they already have an active engagement or previously rejected it)
3. Worker calls POST /jobs/:jobId/reject — creates JobDismissal, hides it from their feed
The hirer's only power is posting the job with clear terms — they never select/reject workers. Ready for Phase 3 whenever you are.