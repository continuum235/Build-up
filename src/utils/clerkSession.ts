/**
 * Clerk refuses to start a new sign-in/sign-up while another account's
 * session is live (error code `session_exists`). That is what made switching
 * accounts impossible: the previous session had to be ended first.
 */

export function isSessionExistsError(err: unknown): boolean {
  const errors = (err as { errors?: { code?: string; message?: string }[] })
    ?.errors;
  const first = Array.isArray(errors) ? errors[0] : undefined;
  if (first?.code === "session_exists") return true;
  const msg = first?.message ?? (err instanceof Error ? err.message : "");
  return /already signed in/i.test(msg);
}

/**
 * Ends any active session and wipes the cached profile so a different
 * account can take over. Safe to call when nobody is signed in.
 */
export async function endCurrentSession(signOut: () => Promise<unknown>) {
  try {
    await signOut();
  } catch {
    // Already signed out, or offline — the next call surfaces the failure
  }
}
