import { Suspense } from "react";
import { AuthorizedDashboard } from "@/components/dashboard-shell";

export default function AdvisorDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="dashboard-main">Memuat...</div>}>
      <AuthorizedDashboard dashboard="advisor">
        {children}
      </AuthorizedDashboard>
    </Suspense>
  );
}
