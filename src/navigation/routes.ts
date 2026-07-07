const routes = {
  welcome: "welcome",
  languageSelection: "languageSelection",
  login: "login",
  signup: "signup",
  roleType: "roleType",
  upload: "upload",
  roleTitle: "roleTitle",
  employerRoleTitle: "employerRoleTitle",
  languages: "languages",
  skills: "skills",
  bio: "bio",
  enterDetails: "enterDetails",
  findJobs: "findJobs",
  jobDetails: "jobDetails",
  yourJobs: "yourJobs",
  profile: "profile",
  messages: "messages",
  jobBoard: "jobBoard",
} as const;

export type RouteName = (typeof routes)[keyof typeof routes];

export type ParameterlessRouteName = Exclude<RouteName, typeof routes.jobDetails>;

export type RootStackParamList = {
  [routes.welcome]: undefined;
  [routes.languageSelection]: { next?: ParameterlessRouteName } | undefined;
  [routes.login]: undefined;
  [routes.signup]: undefined;
  [routes.roleType]: undefined;
  [routes.upload]: undefined;
  [routes.roleTitle]: undefined;
  [routes.employerRoleTitle]: undefined;
  [routes.languages]: undefined;
  [routes.skills]: undefined;
  [routes.bio]: undefined;
  [routes.enterDetails]: undefined;
  [routes.findJobs]: undefined;
  [routes.jobDetails]: { jobId: string | number };
  [routes.yourJobs]: undefined;
  [routes.profile]: undefined;
  [routes.messages]: undefined;
  [routes.jobBoard]: undefined;
};

export default routes;
