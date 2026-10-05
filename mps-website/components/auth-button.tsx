import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { dashboardForRole } from "@/lib/auth/roles";
import type { AuthProfile } from "@/lib/auth/session";

export function AuthButton({
  profile,
  mobile = false,
}: {
  profile: AuthProfile | null;
  mobile?: boolean;
}) {
  const className = mobile
    ? "header-auth header-auth--mobile"
    : "header-auth header-auth--desktop";

  if (!profile) {
    return (
      <div className={className}>
        <Link className="header-auth-link" href="/auth/login">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="header-auth-name">
        {profile.fullName ?? profile.email ?? "Akun MPS"}
      </span>
      <div className="header-auth-controls">
        {profile.role && (
          <Link
            className="header-auth-link header-auth-dashboard"
            href={dashboardForRole(profile.role)}
          >
            Dashboard
          </Link>
        )}
        <LogoutButton className="header-auth-logout" />
      </div>
    </div>
  );
}
