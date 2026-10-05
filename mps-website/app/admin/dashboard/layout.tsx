import { Suspense } from "react";
import { AuthorizedDashboard } from "@/components/dashboard-shell";

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="dashboard-main">Memuat...</div>}>
      <AuthorizedDashboard dashboard="admin">
        {children}
      </AuthorizedDashboard>
    </Suspense>
  );
}
