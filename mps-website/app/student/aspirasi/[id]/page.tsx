import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDashboardAccess } from "@/lib/auth/session";
import {
  aspirationStatusLabels,
  getAspirationUpdates,
  getStudentAspirationById,
} from "@/lib/student/aspiration";

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

export default async function StudentAspirasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireDashboardAccess("student");
  const { id } = await params;

  let aspiration;
  let updates = [];

  try {
    aspiration = await getStudentAspirationById(profile.id, id);
    if (!aspiration) {
      notFound();
    }

    updates = await getAspirationUpdates(aspiration.id);
  } catch {
    return (
      <section className="dashboard-student-page">
        <span className="section-kicker">Aspirasi</span>
        <h1>Detail aspirasi</h1>
        <div className="dashboard-empty-state">
          <p>Detail aspirasi tidak dapat dimuat saat ini. Coba beberapa saat lagi.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-student-page">
      <div className="dashboard-section-header dashboard-section-header--stacked">
        <div>
          <span className="section-kicker">Aspirasi</span>
          <h1>{aspiration.title}</h1>
        </div>
        <div className="dashboard-header-inline-actions">
          <Link className="button button-secondary" href="/student/aspirasi">
            Kembali
          </Link>
        </div>
      </div>

      <article className="dashboard-detail-card">
        <div className="dashboard-detail-meta">
          <span className="dashboard-badge dashboard-badge--status">
            {aspirationStatusLabels[aspiration.status]}
          </span>
          <span>{aspiration.category}</span>
          <span>{aspiration.is_anonymous ? "Anonim" : "Nama ditampilkan"}</span>
          <span>{formatDate(aspiration.created_at)}</span>
        </div>

        <div className="dashboard-detail-copy">
          <p>{aspiration.content}</p>
        </div>
      </article>

      <div className="dashboard-timeline">
        <h2>Timeline</h2>

        {updates.length === 0 ? (
          <div className="dashboard-empty-state dashboard-empty-state--compact">
            <p>Belum ada update untuk aspirasi ini.</p>
          </div>
        ) : (
          <div className="dashboard-timeline-list">
            {updates.map((update) => (
              <div key={update.id} className="dashboard-timeline-item">
                <div className="dashboard-timeline-dot" aria-hidden="true" />
                <div className="dashboard-timeline-content">
                  <div className="dashboard-timeline-head">
                    <strong>
                      {update.status
                        ? aspirationStatusLabels[update.status]
                        : "Pembaruan"}
                    </strong>
                    <span>{formatDate(update.created_at)}</span>
                  </div>
                  <p>{update.content ?? "Tidak ada catatan tambahan."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
