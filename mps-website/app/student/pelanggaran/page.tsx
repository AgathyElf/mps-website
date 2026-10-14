import Link from "next/link";
import { requireDashboardAccess } from "@/lib/auth/session";
import {
  getStudentCurrentPoints,
  getStudentPointResets,
  getStudentViolations,
} from "@/lib/student/violations";

const violationStatusLabels = {
  pending: "Menunggu konfirmasi",
  confirmed: "Dikonfirmasi",
  dismissed: "Dibatalkan",
} as const;

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function StudentViolationPage() {
  const profile = await requireDashboardAccess("student");

  let violations = [];
  let pointResets = [];
  let currentPoints = 100;

  try {
    [violations, pointResets, currentPoints] = await Promise.all([
      getStudentViolations(profile.id),
      getStudentPointResets(profile.id),
      getStudentCurrentPoints(profile.id),
    ]);
  } catch (error) {
    console.error("Failed to load student violation dashboard:", error);
    return (
      <section className="dashboard-student-page">
        <span className="section-kicker">Pelanggaran</span>
        <h1>Riwayat pelanggaran saya</h1>
        <div className="dashboard-empty-state">
          <p>Data pelanggaran tidak dapat dimuat saat ini. Coba beberapa saat lagi.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-student-page">
      <div className="dashboard-section-header">
        <div>
          <span className="section-kicker">Pelanggaran</span>
          <h1>Riwayat pelanggaran saya</h1>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Poin Saya</span>
          <strong className="dashboard-stat-value">{currentPoints} Poin</strong>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Jml. pelanggaran</span>
          <strong className="dashboard-stat-value">{violations.length}</strong>
        </article>
      </div>

      <div className="dashboard-section-block">
        <h2>Riwayat pelanggaran</h2>

        {violations.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>Belum ada riwayat pelanggaran.</p>
          </div>
        ) : (
          <div className="dashboard-list-grid">
            {violations.map((violation) => (
              <Link
                key={violation.id}
                href={`/student/pelanggaran/${violation.id}`}
                className="dashboard-list-card"
              >
                <div className="dashboard-list-top">
                  <span className="dashboard-badge dashboard-badge--status">
                    {violationStatusLabels[violation.status]}
                  </span>
                  <span className="dashboard-list-date">
                    {formatDate(violation.occurred_at)}
                  </span>
                </div>

                <h2>{violation.violation_type?.name ?? "Jenis pelanggaran"}</h2>
                <p>{violation.details ?? "Tidak ada detail tambahan."}</p>

                <div className="dashboard-list-meta">
                  <span>{violation.points_awarded} poin</span>
                  <span>{violation.violation_type?.description ?? "Detail jenis"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section-block">
        <h2>Riwayat reset poin</h2>

        {pointResets.length === 0 ? (
          <div className="dashboard-empty-state dashboard-empty-state--compact">
            <p>Belum ada riwayat reset poin.</p>
          </div>
        ) : (
          <div className="dashboard-list-grid dashboard-list-grid--compact">
            {pointResets.map((reset) => (
              <div key={reset.id} className="dashboard-list-card dashboard-list-card--plain">
                <div className="dashboard-list-top">
                  <span className="dashboard-badge dashboard-badge--success">
                    +{reset.points_removed} poin
                  </span>
                  <span className="dashboard-list-date">
                    {formatDate(reset.reset_at)}
                  </span>
                </div>

                <h2>Reset poin</h2>
                <p>{reset.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
