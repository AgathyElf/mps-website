import Link from "next/link";
import { requireDashboardAccess } from "@/lib/auth/session";
import {
  aspirationStatusLabels,
  getStudentAspirations,
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
  }).format(date);
}

export default async function StudentAspirasiPage() {
  const profile = await requireDashboardAccess("student");

  let aspirations = [];

  try {
    aspirations = await getStudentAspirations(profile.id);
  } catch {
    return (
      <section className="dashboard-student-page">
        <span className="section-kicker">Aspirasi</span>
        <h1>Aspirasi Saya</h1>
        <div className="dashboard-empty-state">
          <p>Data aspirasi tidak dapat dimuat saat ini. Coba beberapa saat lagi.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-student-page">
      <div className="dashboard-section-header">
        <div>
          <span className="section-kicker">Aspirasi</span>
          <h1>Aspirasi Saya</h1>
        </div>
        <Link className="button button-primary" href="/student/aspirasi/baru">
          Ajukan aspirasi
        </Link>
      </div>

      {aspirations.length === 0 ? (
        <div className="dashboard-empty-state">
          <p>Belum ada aspirasi yang kamu ajukan.</p>
          <Link className="button button-primary" href="/student/aspirasi/baru">
            Buat aspirasi baru
          </Link>
        </div>
      ) : (
        <div className="dashboard-list-grid">
          {aspirations.map((aspiration) => (
            <Link
              key={aspiration.id}
              href={`/student/aspirasi/${aspiration.id}`}
              className="dashboard-list-card"
            >
              <div className="dashboard-list-top">
                <span className="dashboard-badge dashboard-badge--status">
                  {aspirationStatusLabels[aspiration.status]}
                </span>
                <span className="dashboard-list-date">
                  {formatDate(aspiration.created_at)}
                </span>
              </div>

              <h2>{aspiration.title}</h2>
              <p>{aspiration.content}</p>

              <div className="dashboard-list-meta">
                <span>{aspiration.category}</span>
                <span>{aspiration.is_anonymous ? "Anonim" : "Nama ditampilkan"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
