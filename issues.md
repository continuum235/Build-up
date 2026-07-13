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



1. What's Implemented
Frontend (Expo/React Native) — ~18 screens, fully built UI:
- Onboarding: Welcome, Language Selection, Login, Signup, Role Type (job seeker vs hirer), Role Title (free-text for seeker, dropdown for hirer)
- Profile Setup (7 screens): Document upload toggles, Languages (up to 3), Skills (up to 3), Bio (min 100 chars), Hourly Rate, Address Details — all feeding into a single ProfileContext
- Main App (5 screens): FindJobs (search + filter + like + broadcast modal), JobDetails, YourJobs (proposals/active/completed tabs), JobBoard (employer posts + manages), Messages (dummy inbox + chat), Profile
- Infrastructure: i18n (EN/HI with 178 keys each), typed navigation (20 routes), reusable components (Button, TextInput, JobDetails, BottomNavigation), responsive styling via react-native-responsive-screen


Backend (Express + Prisma + PostgreSQL/Neon) — full marketplace API:
- Auth: Clerk JWT verification, POST /auth/sync (upserts user from Clerk into DB), GET /auth/me
- Job CRUD: GET /jobs (paginated, filterable), GET /jobs/:id, POST/PATCH/DELETE /jobs (hirer-only with ownership checks)
- Worker Choice (Uber model): POST /jobs/:jobId/accept (creates Engagement, fills job), POST /jobs/:jobId/reject (creates JobDismissal), GET /workers/me/jobs, GET /hirers/me/jobs
- Engagements & Reviews: PATCH /engagements/:id (complete/cancel), POST /engagements/:id/review (rating 1-5, prevents self-review), GET /users/:id/reviews
- DB Schema (5 models): User, Job (with Decimal budget, enums for status/category/budgetType), Engagement (1:1 with Job), JobDismissal (unique per worker+job), Review (unique per engagement+author+subject)
Key gap: The frontend and backend are completely disconnected. The frontend reads from jobsSeedData.json and stores everything in local context. The backend has a production-quality API that nothing calls.


2. Code Rating: 7/10
Backend: ~8.5/10 — Clean separation (routes/controllers/middleware/lib), proper TypeScript, Clerk middleware, Prisma with Neon adapter, error handling, role-based access. Minor nits: manual validation instead of Zod, some redundant null checks after middleware guarantees.
Frontend: ~6/10 — Good navigation and i18n setup, decent component extraction (JobDetails, Button, TextInput). But screens are too large (FindJobsScreen is 735 lines), all data is static from a JSON file, no loading/error states, navigation: any in places, module-level side effects in LanguageContext, password stored in ProfileContext.

3. Suggested Improvements (Priority Order)
Priority	Improvement
P0	Connect frontend to backend (see section 4)
P0	Integrate Clerk on frontend (@clerk/clerk-expo)
P0	Replace seed data with real API calls
P0	Submit profile to backend on EnterDetailsScreen
P1	Split large screens into components
P1	Add loading/error states across screens
P1	Add Zod validation on backend
P1	Remove password from ProfileContext
P2	Add tests
P2	Fix LanguageContext module-level side effects
P2	Add real file upload (UploadScreen)
P3	Add WebSocket for real-time messaging
P3	Compute average rating on User


4. How to Connect Frontend ↔ Backend
Here's the step-by-step plan:
Step 1: Add Clerk to Frontend
npm install @clerk/clerk-expo
Wrap App.tsx with <ClerkProvider publishableKey="...">. Replace LoginScreen/SignupScreen with Clerk's <SignIn /> / <SignUp /> components (or use their hooks: useSignIn, useSignUp).
Step 2: Create an API Service Layer
Create src/services/api.ts with a base fetcher that attaches the Clerk JWT:
import { useAuth } from "@clerk/clerk-expo";

const BASE_URL = "http://YOUR_MACHINE_IP:3000"; // or ngrok/ deployed URL

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = async (path: string, options?: RequestInit) => {
    const token = await getToken();
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  };

  return { apiFetch };
}
Step 3: Sync Auth on Login
After Clerk signs in, call:
await apiFetch("/auth/sync", {
  method: "POST",
  body: JSON.stringify({ role: profile.roleType === "employer" ? "HIRER" : "WORKER" }),
});
Step 4: Swap Seed Data for API Calls
Replace useJobs hook to call the API instead of reading JSON:
export function useJobs() {
  const { apiFetch } = useApi();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/jobs?status=OPEN")
      .then(res => res.json())
      .then(data => setJobs(data.jobs))
      .finally(() => setIsLoading(false));
  }, []);

  return { jobs, categories, isLoading, error: null, ... };
}
Step 5: Submit Profile on EnterDetailsScreen
Replace console.log(payload) with:
await apiFetch("/auth/sync", {  // or a dedicated PATCH /users/me
  method: "PATCH",
  body: JSON.stringify({
    name: profile.auth.name,
    languages: profile.languages,
    skills: profile.skills,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    location: `${profile.details.city}, ${profile.details.country}`,
  }),
});
Step 6: Wire Worker Actions
- Accept job → POST /jobs/:id/accept (FindJobsScreen → on like/accept)
- Reject job → POST /jobs/:id/reject
- Fetch worker's jobs → GET /workers/me/jobs (YourJobsScreen)
- Post a job (hirer) → POST /jobs (JobBoardScreen)


Step 7: Network Config
For development, set BASE_URL to your machine's LAN IP (Expo on phone needs this). Use @expo/ngrok (already in deps) for tunneling. The server's CORS is already configured via app.use(cors()) — no changes needed there.
Bottom line: The backend is production-ready and well-structured. The frontend is pixel-complete but has zero real data flow. The #1 priority is connecting them via Clerk auth + the API service layer outlined above. That unlocks the entire marketplace flow end-to-end.




Plan: Connect Frontend ↔ Backend with Clerk Auth + Onboarding
Overview
Currently: Two disconnected apps. Frontend stores everything in local state, backend has a production API that nothing calls.
Goal: Real auth via Clerk, onboarding that persists to DB, then role-based main tabs.
Phase 1 — Backend: Extend User Model & API
Schema changes (server/prisma/schema.prisma):
- Make role nullable (Role?)
- Add profile fields: roleTitle, bio, hourlyRate (Int), languages (Json), skills (Json), documents (Json), country, addressLine1, addressLine2, city, onboardingComplete (Boolean, default false)
Modified endpoints:
- POST /auth/sync — make role optional (creates user without role initially), return all fields including onboardingComplete
- GET /auth/me — return all new profile fields + onboardingComplete
New endpoint:
- PATCH /users/me — update any profile field (role, roleTitle, bio, hourlyRate, languages, skills, documents, address fields, onboardingComplete). No requireRole — just requireAuth, since role might not be set yet.
Generate migration:
cd server && npx prisma migrate dev --name add_onboarding_fields
Phase 2 — Frontend: Clerk Auth Integration
Install:
npm install @clerk/clerk-expo expo-secure-store
Files to create:
File	Purpose
src/services/api.ts	Authenticated fetch wrapper using Clerk's getToken(), base URL config
src/services/authService.ts	syncUser(), getMe(), updateProfile() methods
Files to modify:
File	What changes
App.tsx	Wrap with <ClerkProvider publishableKey={...}>, add token cache via expo-secure-store
WelcomeScreen.tsx	On mount, check useAuth().isSignedIn. If signed in, call GET /auth/me. If onboardingComplete, skip to main tabs by role. If not, go to RoleTypeScreen. If not signed in, show existing welcome UI.
LoginScreen.tsx	Replace fake auth with useSignIn() hook. Email/password → signIn.create(). Google → useOAuth("oauth_google").startOAuthFlow(). On success → call /auth/sync, check onboarding status, redirect.
SignupScreen.tsx	Replace fake signup with useSignUp() hook. Same Google OAuth + email/password flow.
ProfileContext.tsx	Remove password from Auth interface and state
Clerk flow for Google OAuth:
const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
// In button handler:
const { createdSessionId, setActive } = await startOAuthFlow();
if (createdSessionId) {
  await setActive({ session: createdSessionId });
  // → redirect to onboarding or main tabs
}
Phase 3 — Wire Onboarding to Backend
Strategy: accumulate locally (existing ProfileContext), submit at end.
This minimizes changes to the 7 onboarding screens — they still just update ProfileContext and navigate forward, exactly as they do now.
The only screen that changes is EnterDetailsScreen (final onboarding step):
// Replace console.log with:
const payload = {
  role: profile.roleType === "employer" ? "HIRER" : "WORKER",
  roleTitle: profile.roleTitle,
  bio: profile.bio,
  hourlyRate: parseInt(profile.hourlyRate),
  languages: profile.languages,
  skills: profile.skills,
  documents: profile.documents,
  country: profile.details.country,
  addressLine1: profile.details.addressLine1,
  addressLine2: profile.details.addressLine2,
  city: profile.details.city,
  onboardingComplete: true,
};
await apiFetch("/users/me", {
  method: "PATCH",
  body: JSON.stringify(payload),
});
What about document upload? Currently upload is just boolean toggles. We keep it as-is for now (store booleans in DB). Real file upload can be added later.
Phase 4 — Role-Based Routing After Onboarding
WelcomeScreen as auth gate:
App opens → WelcomeScreen loads
  ├─ Clerk useAuth().isSignedIn = false → show login/signup buttons (existing UI)
  └─ Clerk useAuth().isSignedIn = true → call GET /auth/me
       ├─ onboardingComplete = true → navigate to main tabs
       │    ├─ role = "HIRER" → jobBoard
       │    └─ role = "WORKER" → findJobs
       └─ onboardingComplete = false → navigate to RoleTypeScreen
BottomNavigation already has role-aware tabs — just verify it uses the right role source (DB, not local context).
Key Decisions (need your input):
1. Submit strategy: Submit all onboarding data at once on the final screen (simpler, existing screens barely change) OR submit per-screen as the user goes (data persists if app closes)?
2. Email/password signup: Do you want Clerk-hosted email/password signup AND Google, or just Google OAuth?
3. Custom UI vs Clerk UI: Keep your existing custom Login/Signup screen designs but wire them to Clerk hooks, or use Clerk's pre-built <SignIn /> / <SignUp /> components?
4. Document upload: Keep the boolean toggle approach for now, or integrate real file upload (expo-image-picker + upload to storage)?
My recommendation: batch submit at end + keep custom UI + both email/password and Google + booleans for now. This gives you the fastest path to a working integrated app with minimal UI disruption



Complete Implementation Plan
File Inventory — Every File That Changes
🔧 Backend (4 files + 1 migration)
1. server/prisma/schema.prisma — Extend User model
model User {
  id      String @id @default(cuid())
  clerkId String @unique
  name    String
  email   String @unique
  role    Role?                    // ← made nullable

  // New onboarding fields:
  roleTitle        String?
  bio              String?
  hourlyRate       Int?
  languages        Json?
  skills           Json?
  documents        Json?
  country          String?
  addressLine1     String?
  addressLine2     String?
  city             String?
  onboardingComplete Boolean @default(false)

  // ... existing relations unchanged
}
Then: cd server && npx prisma migrate dev --name add_onboarding_fields
2. server/src/controllers/auth.controller.ts — Role optional
- syncUser: Make role optional. If not provided, create user with role: null. Return all new fields (roleTitle, bio, hourlyRate, languages, skills, documents, country, addressLine1, addressLine2, city, onboardingComplete).
- getMe: Same expanded select — return all fields.
3. server/src/controllers/user.controller.ts — Add patchUser
New controller:
export async function patchUser(req: Request, res: Response) {
  // requireAuth already guarantees req.auth.userId
  // Accept any subset: role, roleTitle, bio, hourlyRate, 
  //   languages, skills, documents, country, addressLine1, 
  //   addressLine2, city, onboardingComplete
  // Validate role if provided (must be HIRER or WORKER)
  // Validate hourlyRate if provided (positive int)
  // Prisma upsert update with only provided fields
  // Return updated user
}
4. server/src/routes/user.routes.ts — Add route
userRouter.patch("/me", requireAuth, patchUser);
5. server/src/types/express.d.ts — No changes needed
patchUser only needs req.auth.userId (from requireAuth), not req.currentUser. The requireRole middleware provides currentUser but patchUser doesn't use it.
🎨 Frontend (17 files)
New file 1: src/services/api.ts
Creates the bridge between frontend and backend:
// Uses Clerk's useAuth().getToken() to get JWT
// Provides:
//   apiFetch(path, options)  — raw fetch with auth headers
//   syncUser(role?)          — POST /auth/sync
//   getMe()                  — GET /auth/me
//   updateProfile(data)      — PATCH /users/me
//   getJobs(params)          — GET /jobs
//   acceptJob(jobId)         — POST /jobs/:jobId/accept
//   rejectJob(jobId)         — POST /jobs/:jobId/reject
//   ... (more as needed)
Base URL configured via process.env.EXPO_PUBLIC_API_URL or hardcoded dev IP.
Modified 1: App.tsx
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  getToken(key) { return SecureStore.getItemAsync(key); },
  saveToken(key, value) { return SecureStore.setItemAsync(key, value); },
};

export default function App() {
  return (
    <ClerkProvider 
      publishableKey="pk_test_..." 
      tokenCache={tokenCache}
    >
      <LanguageProvider>
        <ProfileProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}
Also add "scheme": "build-up" to app.json for OAuth redirect.
Modified 2: src/screens/WelcomeScreen.tsx — Auth gate
Add to the top of the component:
const { isSignedIn, isLoaded } = useAuth();
const { getMe } = useApi();

useEffect(() => {
  if (!isLoaded) return;
  if (isSignedIn) {
    getMe().then(({ user }) => {
      if (user.onboardingComplete) {
        const dest = user.role === "HIRER" ? routes.jobBoard : routes.findJobs;
        navigation.reset({ index: 0, routes: [{ name: dest }] });
      } else {
        navigation.replace(routes.roleType);
      }
    });
  }
}, [isLoaded, isSignedIn]);
While loading (!isLoaded), show nothing or a splash screen. If not signed in, show existing welcome UI.
Modified 3: src/screens/LoginScreen.tsx — Clerk hooks
Replace login logic:
const { signIn, setActive } = useSignIn();
const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
const { syncUser } = useApi();
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setLoading(true);
  try {
    const result = await signIn.create({ identifier: email, password });
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      await syncUser(); // create user in DB (no role yet)
      navigation.replace(routes.roleType);
    }
  } catch (err) {
    alert(err.errors?.[0]?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

const handleGoogle = async () => {
  try {
    const { createdSessionId, setActive: setActive_ } = await startOAuthFlow();
    if (createdSessionId) {
      await setActive_({ session: createdSessionId });
      await syncUser();
      navigation.replace(routes.roleType);
    }
  } catch (err) {
    alert(err.errors?.[0]?.message || "Google login failed");
  }
};
Keep the existing UI. Wire handleLogin to the Login button's onPress. Wire handleGoogle to the Google button's onPress. Disable buttons and show ActivityIndicator while loading is true.
Modified 4: src/screens/SignupScreen.tsx — Clerk hooks
Same pattern using useSignUp():
const { signUp, setActive } = useSignUp();
const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

const handleSignup = async () => {
  setLoading(true);
  try {
    const result = await signUp.create({
      emailAddress: email,
      password,
      firstName: name,
    });
    // Depending on Clerk strategy, may need email verification.
    // For dev, could use "email_link" or skip verification.
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      await syncUser();
      navigation.replace(routes.roleType);
    } else {
      // Handle verification if needed (e.g., send email code)
    }
  } catch (err) {
    alert(err.errors?.[0]?.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};
Same Google OAuth handler as LoginScreen.
Modified 5-12: All 8 onboarding screens — Add API call on submit
Pattern (add to every screen's "next" handler):
const { updateProfile } = useApi();
const [saving, setSaving] = useState(false);

// In existing handleNext / handleSelect / handleContinue:
const handler = async () => {
  // Existing validation...
  
  setSaving(true);
  try {
    await updateProfile({ fieldName: value });
    // Navigate on success
  } catch {
    // API failed — still navigate (optimistic). 
    // Data is safe in ProfileContext; final screen re-syncs.
  } finally {
    setSaving(false);
  }
  // Navigate regardless (optimistic UI)
  navigation.navigate(nextRoute);
};
Screens and their API payloads:
Screen	Handler
RoleTypeScreen	handleSelect
RoleTitleScreen	handleNext
EmployerRoleTitleScreen	handleAddExpertise
UploadScreen	handleContinue
LanguageScreen	handleNext
SkillsScreen	handleNext
BioScreen	handleNext
HourlyRateScreen	handleNext
Each call is fire-and-forget (optimistic — navigate immediately, API in background). If any fails, it'll be re-sent on the next screen's call (since ProfileContext still has the latest state and the final screen does a full sync).
Modified 13: src/screens/EnterDetailsScreen.tsx — Final submission
This is the critical sync point:
const { updateProfile } = useApi();
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (!isValidDetails(...)) return alert(...);
  
  setDetails(updatedDetails);
  setSubmitting(true);
  
  try {
    // Send ALL accumulated profile data + complete onboarding
    await updateProfile({
      country: updatedDetails.country,
      addressLine1: updatedDetails.addressLine1,
      addressLine2: updatedDetails.addressLine2,
      city: updatedDetails.city,
      onboardingComplete: true,
    });
    
    // Navigate to role-appropriate main screen
    const dest = profile.roleType === "employer" ? routes.jobBoard : routes.profile;
    navigation.reset({ index: 0, routes: [{ name: dest }] });
  } catch (err) {
    alert("Failed to save profile. Check your connection and try again.");
  } finally {
    setSubmitting(false);
  }
};
This is pessimistic — shows loading, blocks navigation until API succeeds, with retry on failure.
Modified 14: src/context/ProfileContext.tsx — Remove password
- Delete password from Auth interface
- Delete password from initialProfile.auth
- Remove password from any references (LoginScreen, SignupScreen no longer store it since Clerk handles it)
🔄 Data Flow Diagram
WelcomeScreen
  ├─ Not signed in → LoginScreen / SignupScreen
  │    ├─ Clerk email/password auth
  │    ├─ Clerk Google OAuth
  │    └─ POST /auth/sync → creates user in DB (no role)
  │
  └─ Signed in → GET /auth/me
       ├─ onboardingComplete = true → main tabs (HIRER→jobBoard, WORKER→findJobs)
       └─ onboardingComplete = false → RoleTypeScreen
            │
            ├─ RoleTypeScreen → PATCH /users/me { role }
            ├─ RoleTitle → PATCH /users/me { roleTitle }
            ├─ Upload → PATCH /users/me { documents }
            ├─ Language → PATCH /users/me { languages }
            ├─ Skills → PATCH /users/me { skills }
            ├─ Bio → PATCH /users/me { bio }
            ├─ HourlyRate → PATCH /users/me { hourlyRate }
            └─ EnterDetails → PATCH /users/me { address + onboardingComplete: true }
                              └─ → main tabs (role-based)
⚠️ Key Design Decisions
Decision	Choice	Rationale
Submission timing	Optimistic per-screen, pessimistic at end	Per-screen is instant (save to context + fire API). Final screen waits for API before marking complete. Best UX + data safety.
Auth persistence	expo-secure-store via Clerk's tokenCache	Industry standard for mobile token storage
OAuth redirect	Custom scheme build-up:// in app.json	Required for Clerk OAuth to return to app
Error handling	Toast/alert on failure, retry via final screen	Simple, user-visible, no data loss
Password storage	Clerk only — never in ProfileContext	Security best practice
📦 Dependencies to Add
npm install @clerk/clerk-expo expo-secure-store expo-web-browser expo-auth-session
Want me to start implementing? I'll go in this order:
1. Backend schema + migration + controllers/routes
2. Frontend: add Clerk deps + api.ts + App.tsx
3. Frontend: LoginScreen + SignupScreen
4. Frontend: WelcomeScreen auth gate
5. Frontend: all 9 onboarding screens
6. Cleanup: remove password from ProfileContext


Build-Up App: Feature Implementation Plan
Overview
This plan addresses the following 7 feature requests based on a thorough analysis of the build-up monorepo (Expo/React Native frontend + Express/Prisma/PostgreSQL backend in /server):

One account → one locked role (no re-selection after onboarding)
Smart login redirect (onboarded users skip to their main tabs)
Remove unnecessary screens/tabs
Zod validation (server-side, replace manual checks)
City dropdown (replace free-text location with a curated dropdown)
Location-based job sorting (jobs nearest to the user's city shown first)
Server repo decision
User Review Required
IMPORTANT

One-role enforcement: Once a user completes onboarding with a role (HIRER or WORKER), that role is permanent. They cannot switch roles. Is this the intended behavior, or should there be a "contact support to change role" path?

IMPORTANT

LanguageSelectionScreen: This screen currently gates users before login/signup. Since the app is now India-focused, do you still want multilingual support (EN/HI), or can language selection be removed entirely?

IMPORTANT

Server repository: The server currently lives in /build-up/server. See the Server Repo Decision section at the bottom for the full recommendation. Please confirm before deployment-related changes are made.

Open Questions
WARNING

City dataset scope: For now, should the dropdown have ~20 major Indian cities (hardcoded), or should it load from a static JSON of 350+ cities (Simplemaps data) at launch? The plan uses hardcoded major cities for the MVP and proposes an upgrade path.

NOTE

Tabs to remove: Based on the analysis, the following are redundant or confusing:

LanguageSelectionScreen — Language can be a setting in Profile, not a login gate
"Broadcasted Jobs" tab in FindJobsScreen — The radar/globe UI is non-functional; this tab should be replaced with a proper proximity-sorted feed
"Best Matches" tab in FindJobsScreen — This is currently identical to the All jobs feed; should be collapsed or made the primary view
YourJobsScreen — Only relevant for workers; should be hidden from hirers
Please confirm before deletion.

Proposed Changes
Component 1: Server — Zod Validation
[MODIFY] 
job.controller.ts
Replace all manual field-by-field validation (typeof body.budget !== "number", etc.) with a Zod schema. This removes ~60 lines of manual checks and gives consistent error shapes across all routes.

[MODIFY] 
user.controller.ts
Add Zod schema for PATCH /users/me. Currently the controller accepts any payload with minimal checks.

[MODIFY] 
auth.controller.ts
Add Zod schema for POST /auth/sync body (currently only has a manual isRole type guard).

[MODIFY] 
engagement.controller.ts
Add Zod schema for PATCH /engagements/:id.

[NEW] 
validate.middleware.ts
Generic validate(schema) middleware factory that parses req.body through Zod and returns a formatted 400 with all field errors if invalid.

Install: npm install zod in /server.

Component 2: Server — One-Role Enforcement
[MODIFY] 
user.controller.ts
In patchUser: if the user already has a non-null role, reject any request that tries to change role with 403 Forbidden: "Role cannot be changed after onboarding".

[MODIFY] 
auth.controller.ts
In syncUser upsert: the update block should not overwrite role if it is already set in the DB. This prevents accidental role reset on re-login.

Component 3: Server — City & Location Infrastructure
[MODIFY] 
schema.prisma
No schema changes needed. The city field (String?) on User and location field (String) on Job are already present. We will standardize their values to match the curated city list.

[NEW] 
cities.ts
A static data file embedding the top ~40 Indian cities with their coordinates (lat/lon). This is the approach chosen over an external API because:

No rate limits, no API key, works offline
Haversine formula in pure TypeScript is trivial and accurate enough for city-level sorting
The simplemaps dataset can be swapped in later for full coverage
Sample city list (at minimum): Mumbai, Pune, Bangalore, Delhi, Hyderabad, Chennai, Kolkata, Ahmedabad, Surat, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Bhopal, Patna, Vadodara, Ghaziabad, Ludhiana, Agra, Nashik, Faridabad, Meerut, Rajkot, Varanasi, Srinagar, Aurangabad, Dhanbad, Amritsar, Navi Mumbai, Allahabad, Visakhapatnam, Coimbatore, Kochi, Guwahati, Chandigarh, Mysuru, Mangaluru, Thane.

[MODIFY] 
job.controller.ts
Update listJobs endpoint to accept an optional userCity query param and sort results:

Jobs in userCity first
Then jobs in cities sorted by Haversine distance to userCity
Then remaining jobs
This is a pure server-side Haversine sort on the result set — no SQL geo-extensions needed since the dataset is small.

GET /jobs?userCity=Mumbai&status=OPEN
→ returns jobs sorted: Mumbai → Pune → Nashik → Thane → ...
The location field on Job must be validated against the city list on creation.

Component 4: Frontend — City Dropdown Component
[NEW] 
CityDropdown.tsx
A reusable <CityDropdown> component for the React Native app:

Shows a TouchableOpacity trigger with the selected city name
Opens a Modal with a FlatList of all cities (searchable via text input)
Uses the same curated city list as the server
Shared constant from src/data/cities.ts (mirrors server data)
[NEW] 
cities.ts
Frontend mirror of the cities list (name only, no coords needed client-side).

[MODIFY] 
SignupScreen.tsx
Replace the free-text location TextInput with <CityDropdown>. The chosen city is stored as-is (e.g., "Mumbai").

NOTE

The location field on Signup is currently only stored in local state and not submitted to the backend at signup time. It should be forwarded via syncUser() call or removed from signup (city is captured in EnterDetailsScreen anyway). Recommend removing from signup to avoid duplication.

[MODIFY] 
EnterDetailsScreen.tsx
Replace the free-text city TextInput with <CityDropdown>. This is the critical field because it feeds directly into updateProfile() → backend User.city which powers job sorting.

[MODIFY] 
JobBoardScreen.tsx
 (hirer post job form)
Replace the free-text Location TextInput in the "Post a New Job" modal with <CityDropdown>. This ensures all posted jobs have a standardized city name.

Component 5: Frontend — Zod Validation (Frontend Forms)
Install zod in the frontend project root as well:

bash
npm install zod
[NEW] 
schemas.ts
Zod schemas for all forms:

loginSchema — email + password (min 6 chars)
signupSchema — name, email, password (min 8), city (must be in city list)
detailsSchema — addressLine1, city (required)
jobPostSchema — title, description, city, budget (positive), budgetType, experience, category, startDate
[MODIFY] 
LoginScreen.tsx
Replace isValidEmail() && isValidPassword() with loginSchema.safeParse(). Show per-field inline errors below inputs instead of a global alert().

[MODIFY] 
SignupScreen.tsx
Replace manual canSubmit logic with signupSchema.safeParse(). Inline field errors.

[MODIFY] 
EnterDetailsScreen.tsx
Replace isValidDetails() with detailsSchema.safeParse(). Inline field errors.

[MODIFY] 
JobBoardScreen.tsx
Replace if (!newJob.title.trim()) + manual budget check with jobPostSchema.safeParse().

Component 6: Frontend — Navigation Overhaul (One Role, Smart Redirect)
This is the core UX change. The current flow has a problem: after login, users always land on RoleTypeScreen regardless of whether they've already completed onboarding. This is fixed.

Current broken flow:
Login success → navigation.replace(routes.roleType)  ← WRONG
New correct flow:
Login success → POST /auth/sync → GET /auth/me
  ├─ onboardingComplete = true, role = HIRER  → jobBoard
  ├─ onboardingComplete = true, role = WORKER → findJobs  
  └─ onboardingComplete = false               → roleType
[MODIFY] 
LoginScreen.tsx
After setActive({ session }) + syncUser(), call getMe() and redirect based on onboardingComplete + role. Replace the current hardcoded navigation.replace(routes.roleType).

[MODIFY] 
SignupScreen.tsx
Same pattern — new user will have onboardingComplete = false → navigate to roleType.

[MODIFY] 
RoleTypeScreen.tsx
Add a guard: if user already has a role (from getMe()), immediately redirect to their main screen without showing the role selection UI. This prevents a signed-in user navigating back to change their role.

[MODIFY] 
AppNavigator.tsx
No structural changes needed — all routing is handled imperatively via navigation.replace/navigation.reset. The initialRouteName remains routes.welcome as the auth gate.

Component 7: Frontend — Remove Unnecessary Tabs/Screens
[MODIFY] 
FindJobsScreen.tsx
Remove tabs: Replace the 3-tab layout ("Best Matches", "Broadcasted Jobs", "Liked Jobs") with a single, sorted job list — jobs are pre-sorted by proximity to the user's city (fetched from the API with userCity param). Keep the search bar and category filter chips.

The "Broadcasted Jobs" radar/globe UI is the most confusing feature — it shows a non-functional modal with a placeholder map. Remove it entirely. Replace with a proximity-sorted "Recommended Jobs" heading.

The useJobs() hook (and jobsSeedData.json) should be replaced with a real API call in this screen once the backend proximity sorting is wired up.

[MODIFY] 
JobBoardScreen.tsx
Remove "Add Job" tab from the tab bar. Instead, add a prominent + FAB (Floating Action Button) that opens the post job modal. The tab bar becomes: ["Jobs Posted", "Active Contracts"].

Screens to keep but conditionally show:
YourJobsScreen — only accessible to WORKER role (hide from BottomNavigation for HIRERs)
FindJobsScreen — only accessible to WORKER role
JobBoardScreen — only accessible to HIRER role
[MODIFY] 
BottomNavigation component
Conditionally render tabs based on role (read from the API response / stored in context). Worker tabs: findJobs, yourJobs, messages, profile. Hirer tabs: jobBoard, messages, profile.

Component 8: Frontend — Location-Aware Job Feed
[MODIFY] 
FindJobsScreen.tsx
On mount, call getMe() to retrieve user.city. Pass userCity=<city> as a query param to listJobs(). The API returns jobs pre-sorted by proximity. No client-side sorting needed.

[MODIFY] 
api.ts
Update listJobs to accept userCity as an optional param in the query string.

Server Repo Decision
IMPORTANT

Recommendation: Keep server in the same repo (/build-up/server) during development. Split to a separate repo only at production deployment.

Rationale:

Monorepo benefits now: Shared types, single git pull, easier to develop both sides simultaneously, no cross-repo PR complexity.
No benefit to splitting yet: The server has no independent CI/CD pipeline, no separate team, no need for independent deployments.
Split trigger: When you're ready to deploy — the server can be deployed to Railway/Render/Fly.io and the frontend to Expo EAS, at which point a GitHub Actions workflow can deploy from the same repo's /server subfolder. No split needed even then.
If you insist on splitting: Use a Git subtree or simply copy /server to a new repo at that point. The only shared code is currently zero (no shared TypeScript types between frontend and backend — they duplicate types independently). So a split is clean whenever you want it.
Decision for this plan: No changes to the repo structure. The server stays in /build-up/server.

Verification Plan
Automated (after implementation)
cd server && npx tsc --noEmit — TypeScript compiles
cd server && npm run lint — ESLint passes
cd && npm run lint (root) — Frontend ESLint passes
cd server && curl http://localhost:3000/jobs?userCity=Mumbai — Returns jobs sorted by proximity
cd server && curl -X POST http://localhost:3000/jobs -d '{"invalid": true}' — Zod returns structured errors
Manual verification
Sign up as a new user → complete onboarding as WORKER → log out → log back in → should land on FindJobsScreen (not RoleTypeScreen)
Sign up as a new user → complete onboarding as HIRER → log out → log back in → should land on JobBoardScreen
Try to update role on PATCH /users/me after onboarding → should get 403
Open EnterDetailsScreen → city field shows dropdown, not text input
Post a job as hirer with Mumbai → open FindJobs as worker with Mumbai → Mumbai job appears first
Implementation Order
Server: Install Zod, add cities.ts data file, add validate.middleware.ts
Server: Apply Zod to job.controller.ts, user.controller.ts, auth.controller.ts
Server: One-role enforcement in user.controller.ts + auth.controller.ts
Server: Add Haversine sort to listJobs with userCity query param
Frontend: Add src/data/cities.ts and CityDropdown.tsx component
Frontend: Replace city text inputs in EnterDetailsScreen, SignupScreen, JobBoardScreen
Frontend: Add Zod schemas.ts, apply to Login, Signup, EnterDetails, JobBoard forms
Frontend: Fix login/signup redirect logic in LoginScreen + SignupScreen
Frontend: Add role guard in RoleTypeScreen
Frontend: Refactor FindJobsScreen (remove tabs, add proximity-sorted API call)
Frontend: Refactor JobBoardScreen (remove "Add Job" tab, add FAB)
Frontend: Update BottomNavigation to be role-aware

Codebase Rating: 5 / 10
Frontend (7,848 lines across 37 files)
Critical bugs:
- Navigation proceeds after failed saves — UploadScreen, SkillsScreen, LanguageScreen, RoleTitleScreen, BioScreen, EmployerRoleTitleScreen all navigate forward even when updateProfile() throws. Users think data saved when it didn't.
- LoginScreen.tsx:7 imports SafeAreaView from "react-native" instead of "react-native-safe-area-context" — breaks on devices with notch/Dynamic Island.
Major issues:
- 3 identical copies of relativeTime() across screens
- ProfileContext recreates all setter functions on every state change, causing unnecessary re-renders of all consumers
- 8+ onboarding screens duplicate ~800 lines of identical header/progress-bar/button styles
- FindJobsScreen renders 50 jobs via ScrollView.map() — should be FlatList
- MessagesScreen replaced FlatList with .map() inside KeyboardSafeWrapper — loses virtualization
- 15+ unsafe as casts and Record<string, unknown> everywhere instead of proper types
- Zero accessibilityLabel on any interactive element
- ~30 hardcoded English strings despite an i18n system existing
Server (1,813 lines across 24 files)
Critical bugs:
- engagement.controller.ts:75-82 — cancelling an engagement sets job back to OPEN but doesn't decrement filledCount. Cancelled positions are permanently lost and new workers can't accept.
- 14 of 15 async controllers have zero try/catch — any DB or Clerk error crashes the process. No express-async-errors or async wrapper exists.
Security gaps:
- cors() wide open — no origin restriction
- No rate limiting anywhere
- POST /conversations and POST /conversations/:id/messages have no Zod validation, no content length limits
- No message content sanitization (XSS vector)
Code smells:
- validate.middleware.ts exists but is never used — every controller duplicates inline safeParse + error formatting (6 copies)
- USER_SELECT constant duplicated identically in auth.controller.ts and user.controller.ts
- asString() helper duplicated in worker.controller.ts and conversation.controller.ts
- 6 conversation controller functions all manually look up user from DB despite requireAuth already doing it
- requireRole adds a DB query to every protected request — user could be resolved once in requireAuth
Design issues:
- Proximity sort runs after pagination — page 1 results may miss closer jobs on page 2
- No pagination on 4 of 5 list endpoints
- Inconsistent response shapes ({ user }, { job }, { jobs, pagination }, { engagements, openJobs, dismissedJobIds })
- Two endpoints can modify user profile (PATCH /users/me and POST /auth/sync)
Top Changes Suggested (by priority)
Immediate (bugs + security)
1. Fix filledCount bug — decrement when engagement is cancelled
2. Add try/catch or async wrapper to all server controllers
3. Move navigation inside try blocks in 6 onboarding screens
4. Add Zod validation + max length to conversation/message endpoints
5. Add rate limiting middleware
6. Restrict CORS to frontend origin
High impact (architecture)
 7. Resolve user once in middleware — eliminate 6+ redundant DB lookups
 8. Use the validate middleware already written instead of 6 inline copies
 9. Extract shared components — OnboardingLayout, ProgressBar, PrimaryButton (eliminates ~800 lines)
10. Add proper API response types — replace all as casts and Record<string, unknown>
11. Use FlatList in FindJobsScreen, YourJobsScreen, MessagesScreen instead of ScrollView.map()
Medium impact (quality)
12. Extract relativeTime to shared utility
13. Memoize JobDetails, BottomNavigation, and ProfileContext value
14. Add pagination to unbounded list endpoints
15. Add accessibilityLabel to all interactive elements
16. Internationalize hardcoded strings
17. Parallelize independent DB queries in getMyWorkerJobs
Want me to start implementing any of these?