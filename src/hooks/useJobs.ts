import { useMemo } from "react";
import {
  getCategoryTranslations,
  getJobById,
  getJobCategories,
  getJobs,
  getProfessionalRoles,
} from "../services/jobsService";

export function useJobs() {
  return useMemo(
    () => ({
      jobs: getJobs(),
      categories: getJobCategories(),
      categoryTranslations: getCategoryTranslations(),
      professionalRoles: getProfessionalRoles(),
      getJobById,
      isLoading: false,
      error: null,
    }),
    [],
  );
}
