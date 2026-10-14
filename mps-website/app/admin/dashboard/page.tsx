import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardAccess } from "@/lib/auth/session";
import {
  createPointReset,
  createViolationRecord,
  createViolationType,
  getAllStudentsForAdmin,
  getAllViolationTypes,
  getRecentViolationRecordsForAdmin,
  updateViolationType,
  updateViolationRecordStatus,
} from "@/lib/admin/violations";

const violationStatuses = ["pending", "confirmed", "dismissed"] as const;
const violationStatusLabels = {
  pending: "Menunggu konfirmasi",
  confirmed: "Dikonfirmasi",
  dismissed: "Dibatalkan",
} as const;

function isViolationStatus(
  status: string,
): status is (typeof violationStatuses)[number] {
  return violationStatuses.some((value) => value === status);
}

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

async function submitViolationType(formData: FormData) {
  "use server";

  await requireDashboardAccess("admin");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pointsValue = Number(formData.get("points") ?? 0);
  const isActive = String(formData.get("is_active") ?? "off") === "on";

  if (!name || !Number.isInteger(pointsValue) || pointsValue < 0) {
    redirect("/admin/dashboard?error=type-validation");
  }

  try {
    await createViolationType({
      name,
      description,
      points: pointsValue,
      isActive,
    });
  } catch (error) {
    console.error("Failed to create violation type:", error);
    redirect("/admin/dashboard?error=type-create");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/pelanggaran");
  redirect("/admin/dashboard");
}

async function updateViolationTypeAction(formData: FormData) {
  "use server";

  await requireDashboardAccess("admin");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pointsValue = Number(formData.get("points") ?? 0);
  const isActive = String(formData.get("is_active") ?? "off") === "on";

  if (!id || !name || !Number.isInteger(pointsValue) || pointsValue < 0) {
    redirect("/admin/dashboard?error=type-validation");
  }

  try {
    await updateViolationType(id, {
      name,
      description,
      points: pointsValue,
      is_active: isActive,
    });
  } catch (error) {
    console.error("Failed to update violation type:", error);
    redirect("/admin/dashboard?error=type-update");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/pelanggaran");
  redirect("/admin/dashboard");
}

async function submitViolationRecord(formData: FormData) {
  "use server";

  await requireDashboardAccess("admin");

  const studentId = String(formData.get("student_id") ?? "");
  const violationTypeId = String(formData.get("violation_type_id") ?? "");
  const occurredAt = String(formData.get("occurred_at") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");

  if (
    !studentId ||
    !violationTypeId ||
    !Number.isFinite(Date.parse(occurredAt)) ||
    !isViolationStatus(status)
  ) {
    redirect("/admin/dashboard?error=record-validation");
  }

  try {
    await createViolationRecord({
      studentId,
      violationTypeId,
      occurredAt,
      details,
      status,
    });
  } catch (error) {
    console.error("Failed to create violation record:", error);
    redirect("/admin/dashboard?error=record-create");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/pelanggaran");
  redirect("/admin/dashboard");
}

async function updateViolationRecordStatusAction(formData: FormData) {
  "use server";

  await requireDashboardAccess("admin");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !id ||
    !isViolationStatus(status)
  ) {
    redirect("/admin/dashboard?error=status-validation");
  }

  try {
    await updateViolationRecordStatus(id, status);
  } catch (error) {
    console.error("Failed to update violation record status:", error);
    redirect("/admin/dashboard?error=status-update");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/pelanggaran");
  redirect("/admin/dashboard");
}

async function submitPointReset(formData: FormData) {
  "use server";

  await requireDashboardAccess("admin");

  const studentId = String(formData.get("student_id") ?? "");
  const pointsRemoved = Number(formData.get("points_removed") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  const resetAt = String(formData.get("reset_at") ?? "");

  if (
    !studentId ||
    !reason ||
    !Number.isInteger(pointsRemoved) ||
    pointsRemoved <= 0 ||
    !Number.isFinite(Date.parse(resetAt))
  ) {
    redirect("/admin/dashboard?error=reset-validation");
  }

  try {
    await createPointReset({
      studentId,
      pointsRemoved,
      reason,
      resetAt,
    });
  } catch (error) {
    console.error("Failed to create point reset:", error);
    redirect("/admin/dashboard?error=reset-create");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/pelanggaran");
  redirect("/admin/dashboard");
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; page?: string }>;
}) {
  const profile = await requireDashboardAccess("admin");
  const params = (await searchParams) ?? {};
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, 1_000_000)
    : 1;
  const [violationTypes, students, violationRecordPage] = await Promise.all([
    getAllViolationTypes(),
    getAllStudentsForAdmin(),
    getRecentViolationRecordsForAdmin(page),
  ]);
  const totalPages = Math.max(1, Math.ceil(violationRecordPage.totalCount / 50));
  const currentPage = Math.min(page, totalPages);
  const violationRecords =
    currentPage === page
      ? violationRecordPage.records
      : (await getRecentViolationRecordsForAdmin(currentPage)).records;
  const errorMessages: Record<string, string> = {
    "type-validation": "Periksa kembali nama dan jumlah poin jenis pelanggaran.",
    "type-create": "Jenis pelanggaran tidak dapat dibuat saat ini.",
    "type-update": "Jenis pelanggaran tidak dapat diperbarui saat ini.",
    "record-validation": "Periksa kembali data pelanggaran yang dimasukkan.",
    "record-create": "Pelanggaran tidak dapat disimpan saat ini.",
    "status-validation": "Status pelanggaran yang dipilih tidak valid.",
    "status-update": "Status pelanggaran tidak dapat diperbarui saat ini.",
    "reset-validation": "Periksa kembali jumlah poin, alasan, dan tanggal reset.",
    "reset-create": "Reset poin tidak dapat disimpan saat ini.",
  };
  const errorMessage = params.error ? errorMessages[params.error] : undefined;

  return (
    <section className="dashboard-student-page">
      <span className="section-kicker">Area administrator</span>
      <h1>Dashboard administrator</h1>
      <p className="dashboard-page-intro">
        {profile.fullName ?? profile.email} · Kelola jenis pelanggaran, pencatatan, dan reset poin siswa.
      </p>
      {errorMessage ? (
        <div className="dashboard-form-alert dashboard-form-alert--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Jenis pelanggaran</span>
          <strong className="dashboard-stat-value">{violationTypes.length}</strong>
        </article>
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Siswa aktif</span>
          <strong className="dashboard-stat-value">{students.length}</strong>
        </article>
      </div>

      <div className="dashboard-section-block">
        <h2>Tambah jenis pelanggaran</h2>
        <form action={submitViolationType} className="dashboard-form">
          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label htmlFor="name">Nama jenis</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div className="dashboard-form-field">
              <label htmlFor="points">Poin</label>
              <input id="points" name="points" type="number" min="0" defaultValue={0} required />
            </div>
          </div>

          <div className="dashboard-form-field">
            <label htmlFor="description">Deskripsi</label>
            <textarea id="description" name="description" rows={4} />
          </div>

          <label className="dashboard-checkbox-row">
            <input type="checkbox" name="is_active" defaultChecked />
            <span>Aktif</span>
          </label>

          <div className="dashboard-form-actions">
            <button className="button button-primary" type="submit">
              Simpan jenis
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-section-block">
        <h2>Jenis pelanggaran</h2>

        {violationTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>Belum ada jenis pelanggaran.</p>
          </div>
        ) : (
          <div className="dashboard-stack-list">
            {violationTypes.map((violationType) => (
              <form key={violationType.id} action={updateViolationTypeAction} className="dashboard-form dashboard-form--card">
                <input type="hidden" name="id" value={violationType.id} />

                <div className="dashboard-form-grid">
                  <div className="dashboard-form-field">
                    <label htmlFor={`name-${violationType.id}`}>Nama</label>
                    <input
                      id={`name-${violationType.id}`}
                      type="text"
                      name="name"
                      defaultValue={violationType.name}
                      required
                    />
                  </div>

                  <div className="dashboard-form-field">
                    <label htmlFor={`points-${violationType.id}`}>Poin</label>
                    <input
                      id={`points-${violationType.id}`}
                      type="number"
                      name="points"
                      min="0"
                      defaultValue={violationType.points}
                      required
                    />
                  </div>
                </div>

                <div className="dashboard-form-field">
                  <label htmlFor={`description-${violationType.id}`}>Deskripsi</label>
                  <textarea
                    id={`description-${violationType.id}`}
                    name="description"
                    rows={2}
                    defaultValue={violationType.description ?? ""}
                  />
                </div>

                <label className="dashboard-checkbox-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={violationType.is_active}
                  />
                  <span>{violationType.is_active ? "Aktif" : "Nonaktif"}</span>
                </label>

                <div className="dashboard-form-actions dashboard-form-actions--compact">
                  <button className="button button-secondary" type="submit">
                    Update
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section-block">
        <h2>Catat pelanggaran baru</h2>
        <form action={submitViolationRecord} className="dashboard-form">
          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label htmlFor="student_id">Siswa</label>
              <select id="student_id" name="student_id" required>
                <option value="">Pilih siswa</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.student_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="dashboard-form-field">
              <label htmlFor="violation_type_id">Jenis pelanggaran</label>
              <select id="violation_type_id" name="violation_type_id" required>
                <option value="">Pilih jenis</option>
                {violationTypes
                  .filter((violationType) => violationType.is_active)
                  .map((violationType) => (
                    <option key={violationType.id} value={violationType.id}>
                      {violationType.name} ({violationType.points} poin)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label htmlFor="occurred_at">Tanggal kejadian</label>
              <input id="occurred_at" name="occurred_at" type="datetime-local" required />
            </div>
            <div className="dashboard-form-field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="pending">
                <option value="pending">Menunggu konfirmasi</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="dismissed">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="dashboard-form-field">
            <label htmlFor="details">Detail</label>
            <textarea id="details" name="details" rows={4} />
          </div>

          <div className="dashboard-form-actions">
            <button className="button button-primary" type="submit">
              Simpan pelanggaran
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-section-block">
        <h2>Riwayat pelanggaran terbaru</h2>

        {violationRecords.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>Belum ada pelanggaran yang tercatat.</p>
          </div>
        ) : (
          <div className="dashboard-stack-list">
            {violationRecords.map((record) => (
              <form
                key={record.id}
                action={updateViolationRecordStatusAction}
                className="dashboard-form dashboard-form--card"
              >
                <div className="dashboard-list-top">
                  <span className="dashboard-list-date">
                    {formatDate(record.occurred_at)}
                  </span>
                  <span>{record.points_awarded} poin</span>
                </div>
                <h3>
                  {record.violation_type?.name ?? "Jenis pelanggaran"} ·{" "}
                  {record.student?.full_name ?? "Siswa"} (
                  {record.student?.student_number ?? "NIS tidak tersedia"})
                </h3>
                <p>{record.details ?? "Tidak ada detail tambahan."}</p>
                <div className="dashboard-form-grid">
                  <div className="dashboard-form-field">
                    <label htmlFor={`record-status-${record.id}`}>
                      Status saat ini: {violationStatusLabels[record.status]}
                    </label>
                    <select
                      id={`record-status-${record.id}`}
                      name="status"
                      defaultValue={record.status}
                    >
                      {violationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {violationStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input type="hidden" name="id" value={record.id} />
                <div className="dashboard-form-actions dashboard-form-actions--compact">
                  <button className="button button-secondary" type="submit">
                    Perbarui status
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
        <div className="dashboard-section-header dashboard-section-header--stacked">
          <p className="dashboard-page-intro">
            Halaman {currentPage} dari {totalPages} · {violationRecordPage.totalCount} pelanggaran
          </p>
          <nav aria-label="Navigasi halaman pelanggaran" className="dashboard-header-inline-actions">
            {currentPage > 1 ? (
              <Link className="button button-secondary" href={`/admin/dashboard?page=${currentPage - 1}`}>
                Sebelumnya
              </Link>
            ) : null}
            {currentPage < totalPages ? (
              <Link className="button button-secondary" href={`/admin/dashboard?page=${currentPage + 1}`}>
                Berikutnya
              </Link>
            ) : null}
          </nav>
        </div>
      </div>

      <div className="dashboard-section-block">
        <h2>Reset poin siswa</h2>
        <form action={submitPointReset} className="dashboard-form">
          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label htmlFor="reset_student_id">Siswa</label>
              <select id="reset_student_id" name="student_id" required>
                <option value="">Pilih siswa</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.student_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="dashboard-form-field">
              <label htmlFor="points_removed">Jumlah poin</label>
              <input id="points_removed" name="points_removed" type="number" min="1" defaultValue={10} required />
            </div>
          </div>

          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label htmlFor="reset_at">Tanggal reset</label>
              <input id="reset_at" name="reset_at" type="datetime-local" required />
            </div>
          </div>

          <div className="dashboard-form-field">
            <label htmlFor="reason">Alasan</label>
            <textarea id="reason" name="reason" rows={3} required />
          </div>

          <div className="dashboard-form-actions">
            <button className="button button-primary" type="submit">
              Simpan reset poin
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
