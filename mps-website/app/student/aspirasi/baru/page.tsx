import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardAccess } from "@/lib/auth/session";
import { createStudentAspiration } from "@/lib/student/aspiration";

async function submitStudentAspiration(formData: FormData) {
  "use server";

  const profile = await requireDashboardAccess("student");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isAnonymous = formData.get("is_anonymous") === "on";

  if (!title || !content || !category) {
    redirect("/student/aspirasi/baru?error=validation");
  }

  try {
    const aspirationId = await createStudentAspiration({
      profileId: profile.id,
      title,
      content,
      category,
      isAnonymous,
    });

    revalidatePath("/student/aspirasi");
    redirect(`/student/aspirasi/${aspirationId}`);
  } catch (error) {
    console.error("Failed to submit aspiration:", error);
    redirect("/student/aspirasi/baru?error=submit");
  }
}

export default async function StudentAspirasiBaruPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireDashboardAccess("student");

  const params = (await searchParams) ?? {};
  const hasValidationError = params.error === "validation";
  const hasSubmitError = params.error === "submit";

  return (
    <section className="dashboard-student-page">
      <span className="section-kicker">Aspirasi</span>
      <h1>Ajukan Aspirasi Baru</h1>

      {hasValidationError ? (
        <div className="dashboard-form-alert">
          Judul, isi aspirasi, dan kategori wajib diisi.
        </div>
      ) : null}

      {hasSubmitError ? (
        <div className="dashboard-form-alert dashboard-form-alert--error">
          Aspirasi tidak dapat dikirim saat ini. Silakan coba lagi.
        </div>
      ) : null}

      <form action={submitStudentAspiration} className="dashboard-form">
        <div className="dashboard-form-field">
          <label htmlFor="title">Judul aspirasi</label>
          <input id="title" name="title" type="text" maxLength={120} required />
        </div>

        <div className="dashboard-form-field">
          <label htmlFor="category">Kategori</label>
          <input
            id="category"
            name="category"
            type="text"
            maxLength={80}
            placeholder="Contoh: kebijakan, fasilitas, program"
            required
          />
        </div>

        <div className="dashboard-form-field">
          <label htmlFor="content">Isi aspirasi</label>
          <textarea
            id="content"
            name="content"
            rows={8}
            maxLength={3000}
            required
          />
        </div>

        <label className="dashboard-checkbox-row">
          <input type="checkbox" name="is_anonymous" />
          <span>Ajukan sebagai anonim</span>
        </label>

        <div className="dashboard-form-actions">
          <button className="button button-primary" type="submit">
            Kirim aspirasi
          </button>
        </div>
      </form>
    </section>
  );
}
