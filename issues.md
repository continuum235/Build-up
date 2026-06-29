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
⚠️ Redundant bottomNav prop-drilling
BottomNavigation receives navigation as a prop from every screen. It could call useNavigation() directly.

---

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
