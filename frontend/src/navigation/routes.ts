const routes = {
    welcome: "welcome",
    languageSelection: "languageSelection",
    login: "login",
    signup: "signup",
    roleType: "roleType",
    upload: "upload",
    roleTitle: "roleTitle",
    languages: "languages",
    skills: "skills",
    bio: "bio",
    hourlyRate: "hourlyRate",
    enterDetails: "enterDetails",
    findJobs: "findJobs",
    jobDetails: "jobDetails",
    yourJobs: "yourJobs",
} as const;

export type RouteName = typeof routes[keyof typeof routes];

export default routes;