import { createClient } from "@supabase/supabase-js";

/**
 * @param {Request} request
 * @returns {Promise<{ user: import("@supabase/supabase-js").User | null, error: string | null }>}
 */
export async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { user: null, error: "Missing or invalid authorization." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { user: null, error: "Server misconfigured." };
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Invalid or expired session." };
  }

  return { user, error: null };
}
