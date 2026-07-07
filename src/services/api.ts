import { useAuth } from "@clerk/clerk-expo";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = async (path: string, options?: RequestInit) => {
    const token = await getToken();
    const body = options?.body;
    const extraHeaders = options?.headers as Record<string, string> | undefined;
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? "Request failed");
    }
    return data;
  };

  const syncUser = (role?: string) =>
    apiFetch("/auth/sync", {
      method: "POST",
      body: JSON.stringify(role ? { role } : {}),
    });

  const getMe = () => apiFetch("/auth/me");

  const updateProfile = (data: Record<string, unknown>) =>
    apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

  const listJobs = (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/jobs${qs}`);
  };

  const createJob = (data: {
    title: string;
    description: string;
    location: string;
    budget: number;
    budgetType: string;
    experience: number;
    category: string;
    startDate: string;
    endDate?: string;
    minWage: number;
    positions: number;
  }) =>
    apiFetch("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });

  const acceptJob = (jobId: string) =>
    apiFetch(`/jobs/${jobId}/accept`, {
      method: "POST",
      body: JSON.stringify({}),
    });

  const rejectJob = (jobId: string) =>
    apiFetch(`/jobs/${jobId}/reject`, {
      method: "POST",
      body: JSON.stringify({}),
    });

  const getMyWorkerJobs = () => apiFetch("/workers/me/jobs");

  const updateEngagement = (engagementId: string, data: { status: string; cancellationReason?: string }) =>
    apiFetch(`/engagements/${engagementId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

  return { apiFetch, syncUser, getMe, updateProfile, listJobs, createJob, acceptJob, rejectJob, getMyWorkerJobs, updateEngagement };
}
