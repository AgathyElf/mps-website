import { redirect } from "next/navigation";
import { getAuthProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function getStudentDashboardCounts(userId: string) {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (studentError) {
    console.error("Failed to load current student record:", studentError);
    return { aspirationsCount: 0, violationsCount: 0 };
  }

  if (!student) {
    return { aspirationsCount: 0, violationsCount: 0 };
  }

  const [aspirationsResult, violationsResult] = await Promise.all([
    supabase
      .from("aspirations")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id),
    supabase
      .from("violation_records")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id),
  ]);

  if (aspirationsResult.error) {
    console.error("Failed to load student aspirations:", aspirationsResult.error);
  }

  if (violationsResult.error) {
    console.error(
      "Failed to load student violation records:",
      violationsResult.error,
    );
  }

  return {
    aspirationsCount: aspirationsResult.count ?? 0,
    violationsCount: violationsResult.count ?? 0,
  };
}

export default async function StudentDashboardPage() {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const displayName = profile.fullName?.trim() || profile.email || "Siswa";
  const { aspirationsCount, violationsCount } = await getStudentDashboardCounts(
    profile.id,
  );

  return (
    <section className="dashboard-student-page">
      <span className="section-kicker">Area siswa</span>
      <h1>Halo, {displayName}</h1>

      <div className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Aspirasi Saya</span>
          <strong className="dashboard-stat-value">{aspirationsCount}</strong>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Poin Saya</span>
          <strong className="dashboard-stat-value dashboard-stat-placeholder">
            Belum tersedia
          </strong>
          <small className="dashboard-stat-note">
            Perhitungan current points akan diselesaikan di FASE 12.
          </small>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Pelanggaran</span>
          <strong className="dashboard-stat-value">{violationsCount}</strong>
        </article>
      </div>
    </section>
  );
}
