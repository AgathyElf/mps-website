import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { getAuthProfile } from "@/lib/auth/session";
import { dashboardForRole } from "@/lib/auth/roles";
import { hasSupabasePublicEnv } from "@/lib/utils";

async function RedirectAuthenticatedUser() {
  const profile = await getAuthProfile();
  if (profile?.role) {
    redirect(dashboardForRole(profile.role));
  }
  if (profile) {
    redirect("/auth/access-denied");
  }

  return <LoginForm />;
}

function LoginPageContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}

export default function Page() {
  if (!hasSupabasePublicEnv()) {
    return (
      <LoginPageContent>
        <LoginForm />
      </LoginPageContent>
    );
  }

  return (
    <LoginPageContent>
      <Suspense fallback={<LoginForm />}>
        <RedirectAuthenticatedUser />
      </Suspense>
    </LoginPageContent>
  );
}
