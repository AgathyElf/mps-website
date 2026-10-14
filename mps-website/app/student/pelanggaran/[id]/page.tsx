import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDashboardAccess } from "@/lib/auth/session";
import { getStudentViolationById } from "@/lib/student/violations";

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function StudentViolationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireDashboardAccess("student");
  const { id } = await params;

  let violation;

  try {
    violation = await getStudentViolationById(profile.id, id);
  } catch (error) {
    console.error("Failed to load student violation detail:", error);
    return (
      <section className="dashboard-student-page">
        <span className="section-kicker">Pelanggaran</span>
        <h1>Detail pelanggaran</h1>
        <div className="dashboard-empty-state">
          <p>Detail pelanggaran tidak dapat dimuat saat ini. Coba beberapa saat lagi.</p>
        </div>
      </section>
    );
  }

  if (!violation) {
    notFound();
  }

  return (
    <section className="dashboard-student-page">
      <div className="dashboard-section-header dashboard-section-header--stacked">
        <div>
          <span className="section-kicker">Pelanggaran</span>
          <h1>{violation.violation_type?.name ?? "Detail pelanggaran"}</h1>
        </div>
        <div className="dashboard-header-inline-actions">
          <Link className="button button-secondary" href="/student/pelanggaran">
            Kembali
          </Link>
        </div>
      </div>

      <article className="dashboard-detail-card">
        <div className="dashboard-detail-meta">
          <span className="dashboard-badge dashboard-badge--status">
            {violationStatusLabels[violation.status]}
          </span>
          <span>{violation.points_awarded} poin</span>
          <span>{formatDate(violation.occurred_at)}</span>
        </div>

        <div className="dashboard-detail-copy">
          <p>{violation.details ?? "Tidak ada detail tambahan."}</p>
        </div>
      </article>

      <div className="dashboard-detail-grid">
        <div className="dashboard-detail-box">
          <h2>Informasi</h2>
          <dl>
            <div>
              <dt>Jenis</dt>
              <dd>{violation.violation_type?.name ?? "Tidak tersedia"}</dd>
            </div>
            <div>
              <dt>Poin yang diberikan</dt>
              <dd>{violation.points_awarded}</dd>
            </div>
            <div>
              <dt>Tanggal kejadian</dt>
              <dd>{formatDate(violation.occurred_at)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{violationStatusLabels[violation.status]}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
