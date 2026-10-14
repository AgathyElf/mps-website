import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getStudentCurrentPoints } from "@/lib/student/violations";

async function getStudentDashboardCounts(userId: string) {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (studentError) {
    console.error("Failed to load current student record:", studentError);
    return {
      aspirationsCount: null,
      violationsCount: null,
      currentPoints: null,
    };
  }

  if (!student) {
    return { aspirationsCount: 0, violationsCount: 0, currentPoints: 100 };
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
    console.error("Failed to load student aspiration count:", aspirationsResult.error);
  }

  if (violationsResult.error) {
    console.error(
      "Failed to load student violation count:",
      violationsResult.error,
    );
  }

  let currentPoints: number | null = null;
  try {
    currentPoints = await getStudentCurrentPoints(userId);
  } catch (error) {
    console.error("Failed to load current student points:", error);
  }

  return {
    aspirationsCount: aspirationsResult.error
      ? null
      : aspirationsResult.count ?? 0,
    violationsCount: violationsResult.error
      ? null
      : violationsResult.count ?? 0,
    currentPoints,
  };
}

export default async function StudentDashboardPage() {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const displayName = profile.fullName?.trim() || profile.email || "Siswa";
  const { aspirationsCount, violationsCount, currentPoints } =
    await getStudentDashboardCounts(profile.id);

  return (
    <section className="dashboard-student-page">
      <span className="section-kicker">Area siswa</span>
      <h1>Halo, {displayName}</h1>

      <div className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Aspirasi Saya</span>
          <strong className="dashboard-stat-value">
            {aspirationsCount === null ? "Tidak tersedia" : aspirationsCount}
          </strong>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Poin Saya</span>
          <strong className="dashboard-stat-value">
            {currentPoints === null ? "Tidak tersedia" : `${currentPoints} Poin`}
          </strong>
          <small className="dashboard-stat-note">
            <Link href="/student/pelanggaran" className="inline-link">
              Lihat riwayat pelanggaran
            </Link>
          </small>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Pelanggaran</span>
          <strong className="dashboard-stat-value">
            {violationsCount === null ? "Tidak tersedia" : violationsCount}
          </strong>
        </article>
      </div>
    </section>
  );
}
