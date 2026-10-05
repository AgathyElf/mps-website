import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireDashboardAccess } from "@/lib/auth/session";
import type { Dashboard } from "@/lib/auth/roles";
import type { AuthProfile } from "@/lib/auth/session";

const roleLabels = {
  student: "Siswa",
  admin: "Administrator",
  advisor: "Pembina",
  super_admin: "Super administrator",
} as const;

export function DashboardShell({
  profile,
  children,
}: {
  profile: AuthProfile & { role: keyof typeof roleLabels };
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/" aria-label="MPS Adyaveda">
          <Image
            src="/mps-adyaveda-logo.jpeg"
            width={42}
            height={42}
            alt="Logo MPS Adyaveda"
          />
          <span>
            <strong>MPS Adyaveda</strong>
            <small>Majelis Permusyawaratan Siswa</small>
          </span>
        </Link>
        <div className="dashboard-user">
          <span>
            {profile.fullName ?? profile.email} · {roleLabels[profile.role]}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
      <footer className="dashboard-footer">
        MPS Adyaveda · Area akun
      </footer>
    </div>
  );
}

export async function AuthorizedDashboard({
  dashboard,
  children,
}: {
  dashboard: Dashboard;
  children: React.ReactNode;
}) {
  const profile = await requireDashboardAccess(dashboard);
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
