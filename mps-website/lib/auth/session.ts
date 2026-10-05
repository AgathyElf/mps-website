import "server-only";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessDashboard,
  dashboardForRole,
  isUserRole,
  type Dashboard,
  type UserRole,
} from "@/lib/auth/roles";

export type AuthProfile = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  role: UserRole | null;
};

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.status === 401 || error.name === "AuthSessionMissingError") {
      return null;
    }
    throw error;
  }

  if (!user) {
    return null;
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return {
      id: user.id,
      email: user.email,
      fullName: null,
      role: null,
    };
  }

  if (!isUserRole(profile.role)) {
    throw new Error(`Unsupported profile role for user ${user.id}.`);
  }

  return {
    id: user.id,
    email: user.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function requireDashboardAccess(
  dashboard: Dashboard,
): Promise<AuthProfile & { role: UserRole }> {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (!profile.role) {
    redirect("/auth/access-denied");
  }

  if (!canAccessDashboard(profile.role, dashboard)) {
    redirect(dashboardForRole(profile.role));
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };
}
