import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthProfile } from "@/lib/auth/session";
import { dashboardForRole } from "@/lib/auth/roles";

async function RedirectProtectedUser(): Promise<never> {
  const profile = await getAuthProfile();
  if (!profile) {
    redirect("/auth/login");
  }
  if (!profile.role) {
    redirect("/auth/access-denied");
  }
  redirect(dashboardForRole(profile.role));
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="dashboard-main">Memuat...</div>}>
      <RedirectProtectedUser />
    </Suspense>
  );
}
