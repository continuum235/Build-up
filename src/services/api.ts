import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useRef } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const REQUEST_TIMEOUT_MS = 15000;
// A cold Render instance can take ~45s to boot, so the wake ping outlives a
// normal request timeout on purpose.
const WAKE_TIMEOUT_MS = 60000;

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

/** Best-effort human message from an API error body (JSON or plain text). */
function extractServerMessage(data: unknown): string | null {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof data === "string") {
    const trimmed = data.trim();
    // Proxies often reply with a short plain-text body instead of JSON
    if (trimmed && trimmed.length < 200 && !trimmed.startsWith("<")) {
      return trimmed;
    }
  }
  return null;
}

function extractFieldErrors(data: unknown): { field: string; message: string }[] | undefined {
  if (data && typeof data === "object" && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors)) return errors as { field: string; message: string }[];
  }
  return undefined;
}

/** Fallback wording per status so users see an actionable message. */
function fallbackMessageFor(status: number): string {
  if (status === 0) return "Can't reach the server. Check your connection and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "That item could not be found.";
  if (status === 408) return "The server took too long to respond. Please try again.";
  if (status === 429) return "Too many requests. Please wait a minute and try again.";
  if (status >= 500) {
    return "The server is having trouble right now. Please try again in a few seconds.";
  }
  return `Request failed (HTTP ${status})`;
}

export function useApi() {
  const { getToken } = useAuth();

  // Clerk hands back a new getToken wrapper on every render. Screens keep
  // these API functions inside useCallback/useEffect deps, so an unstable
  // identity re-runs those effects on every render — an endless refetch loop
  // that eventually trips the backend rate limiter. Hold the latest getter in
  // a ref so the functions below keep one identity for the component's life.
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const apiFetch = useCallback(async (path: string, options?: RequestInit) => {
    // Clerk writes the session token to the cache asynchronously, so a call
    // made right after sign-in/sign-up can miss it. Read defensively and
    // retry once instead of silently sending an unauthenticated request.
    const readToken = async (): Promise<string | null> => {
      try {
        const token = await getTokenRef.current();
        if (token) return token;
        await new Promise((resolve) => setTimeout(resolve, 300));
        return (await getTokenRef.current()) ?? null;
      } catch {
        return null;
      }
    };

    const token = await readToken();
    const body = options?.body;
    const extraHeaders = options?.headers as Record<string, string> | undefined;
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    // One AbortController per attempt: a shared timer would leave a retry
    // with whatever budget the first attempt had left.
    const fetchOnce = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
        const responseText = await res.text();
        // Loosely typed on purpose: callers destructure the JSON payload
        let data: any = null;
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch {
            // Non-JSON body (proxy error page, plain text, etc.)
            data = responseText;
          }
        }
        if (!res.ok) {
          throw new ApiError(
            extractServerMessage(data) ?? fallbackMessageFor(res.status),
            res.status,
            extractFieldErrors(data),
          );
        }
        return data;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        if (e instanceof Error && e.name === "AbortError") {
          throw new ApiError(fallbackMessageFor(408), 408);
        }
        // fetch failed before/while connecting: offline, DNS, refused socket
        throw new ApiError(fallbackMessageFor(0), 0);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Render's free instance sleeps after idle; the first request then gets a
    // proxy 502/503 while it boots. Hitting /health starts the boot and holds
    // until the instance answers, so the retry below has somewhere to land.
    const wakeServer = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WAKE_TIMEOUT_MS);
      try {
        await fetch(`${BASE_URL}/health`, { signal: controller.signal });
      } catch {
        // Best effort — the retry still runs either way
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const method = (options?.method ?? "GET").toUpperCase();
    const idempotent = method === "GET" || method === "HEAD";
    try {
      return await fetchOnce();
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      // 502/503 mean the origin never produced a response (sleeping or
      // restarting instance), so re-sending a write is safe here. 504/408 may
      // have reached the app, so only idempotent reads are retried for those.
      const originDown = [502, 503].includes(e.status);
      const transientRead = idempotent && [408, 504].includes(e.status);
      if (originDown) {
        await wakeServer();
        await sleep(500);
        return await fetchOnce();
      }
      if (transientRead) {
        await sleep(1500);
        return await fetchOnce();
      }
      throw e;
    }
  }, []);

  // Built inside one memo so every helper keeps a stable identity as well:
  // consumers list them in useCallback/useEffect deps.
  return useMemo(() => {
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
  }, [apiFetch]);
}
