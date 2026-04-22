import { redirect } from "next/navigation";
import { getSessionAndRole } from "@/lib/supabase-server";

/**
 * Root landing. Routes to the right surface based on session + role:
 * - no session → /sign-in (marketing site handles magic-link issuance, so
 *   we redirect to perantauglobal.com/lowongan for now)
 * - admin session → /admin
 * - candidate session → /dashboard
 */
export default async function RootPage() {
  const { session, role } = await getSessionAndRole();

  if (!session) {
    redirect("/auth/sign-in");
  }
  if (role === "admin") {
    redirect("/admin");
  }
  redirect("/dashboard");
}
