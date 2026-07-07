import jobsSeedData from "../data/jobsSeedData.json";

export type JobsData = typeof jobsSeedData;
export type Job = JobsData["jobs"][number];
export type JobCategory = JobsData["categories"][number];
export type CategoryTranslations = JobsData["categoryTranslations"];
export type ProfessionalRole = JobsData["professionalRoles"][number];

export const getJobsData = (): JobsData => jobsSeedData;

export const getJobs = (): Job[] => jobsSeedData.jobs;

export const getJobById = (jobId: number | string): Job | undefined => {
  if (typeof jobId === "string") return undefined;
  return jobsSeedData.jobs.find((job) => job.id === jobId);
};

export const getJobCategories = (): JobCategory[] => jobsSeedData.categories;

export const getCategoryTranslations = (): CategoryTranslations =>
  jobsSeedData.categoryTranslations;

export const getProfessionalRoles = (): ProfessionalRole[] =>
  jobsSeedData.professionalRoles;
