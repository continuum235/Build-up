import { useAuth } from "@clerk/clerk-expo";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];
  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      const responseText = await res.text();
      let data = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = null;
        }
      }
      if (!res.ok) {
        throw new ApiError(data?.message ?? "Request failed", res.status, data?.errors);
      }
      return data;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        throw new ApiError("Request timed out", 408);
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }
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

  const createOrFindConversation = (jobId: string, workerId?: string) =>
    apiFetch("/conversations", {
      method: "POST",
      body: JSON.stringify(workerId ? { jobId, workerId } : { jobId }),
    });

  const listConversations = () => apiFetch("/conversations");

  const getConversationMessages = (conversationId: string, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch(`/conversations/${conversationId}/messages${qs}`);
  };

  const sendMessage = (conversationId: string, content: string) =>
    apiFetch(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });

  const getMyHirerJobs = () => apiFetch("/hirers/me/jobs");
  const getJob = (id: string) => apiFetch(`/jobs/${id}`);
  const updateJob = (id: string, data: Record<string, unknown>) =>
    apiFetch(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  const deleteJob = (id: string) => apiFetch(`/jobs/${id}`, { method: "DELETE" });
  const createReview = (engagementId: string, data: { rating: number; comment?: string }) =>
    apiFetch(`/engagements/${engagementId}/review`, { method: "POST", body: JSON.stringify(data) });
  const getUserReviews = (userId: string) => apiFetch(`/users/${userId}/reviews`);

  return {
    apiFetch,
    syncUser,
    getMe,
    updateProfile,
    listJobs,
    createJob,
    acceptJob,
    rejectJob,
    getMyWorkerJobs,
    updateEngagement,
    createOrFindConversation,
    listConversations,
    getConversationMessages,
    sendMessage,
    getMyHirerJobs,
    getJob,
    updateJob,
    deleteJob,
    createReview,
    getUserReviews,
  };
}
