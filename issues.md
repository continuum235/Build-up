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