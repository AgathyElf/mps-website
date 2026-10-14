import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AdminViolationType = {
  id: string;
  name: string;
  description: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminStudent = {
  id: string;
  full_name: string;
  student_number: string;
  class_name: string | null;
};

export type AdminViolationRecord = {
  id: string;
  student_id: string;
  violation_type_id: string;
  occurred_at: string;
  points_awarded: number;
  details: string | null;
  status: "pending" | "confirmed" | "dismissed";
  created_at: string;
  student: Pick<AdminStudent, "full_name" | "student_number"> | null;
  violation_type: Pick<AdminViolationType, "name"> | null;
};

export type AdminViolationRecordPage = {
  records: AdminViolationRecord[];
  totalCount: number;
};

export async function getAllViolationTypes(): Promise<AdminViolationType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_types")
    .select("id, name, description, points, is_active, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminViolationType[];
}

export async function createViolationType(input: {
  name: string;
  description: string;
  points: number;
  isActive: boolean;
}) {
  if (!input.name.trim() || !Number.isInteger(input.points) || input.points < 0) {
    throw new Error("Nama atau jumlah poin jenis pelanggaran tidak valid.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_types")
    .insert([
      {
        name: input.name.trim(),
        description: input.description.trim() || null,
        points: Number(input.points),
        is_active: input.isActive,
      },
    ])
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function updateViolationType(
  id: string,
  input: {
    name?: string;
    description?: string | null;
    points?: number;
    is_active?: boolean;
  },
) {
  if (
    (input.name !== undefined && !input.name.trim()) ||
    (input.points !== undefined &&
      (!Number.isInteger(input.points) || input.points < 0))
  ) {
    throw new Error("Nama atau jumlah poin jenis pelanggaran tidak valid.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_types")
    .update({
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.points !== undefined ? { points: Number(input.points) } : {}),
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function getAllStudentsForAdmin(): Promise<AdminStudent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, student_number, class_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminStudent[];
}

export async function getRecentViolationRecordsForAdmin(
  page: number,
): Promise<AdminViolationRecordPage> {
  const pageSize = 50;
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("violation_records")
    .select(
      "id, student_id, violation_type_id, occurred_at, points_awarded, details, status, created_at",
      { count: "exact" },
    )
    .order("occurred_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const studentIds = Array.from(new Set(rows.map((record) => record.student_id)));
  const violationTypeIds = Array.from(
    new Set(rows.map((record) => record.violation_type_id)),
  );
  const [studentsResult, typesResult] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("students")
          .select("id, full_name, student_number")
          .in("id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    violationTypeIds.length > 0
      ? supabase
          .from("violation_types")
          .select("id, name")
          .in("id", violationTypeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (studentsResult.error) {
    throw studentsResult.error;
  }
  if (typesResult.error) {
    throw typesResult.error;
  }

  const studentsById = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student]),
  );
  const typesById = new Map(
    (typesResult.data ?? []).map((violationType) => [
      violationType.id,
      violationType,
    ]),
  );

  return {
    records: rows.map((record) => ({
      ...record,
      student: studentsById.get(record.student_id) ?? null,
      violation_type: typesById.get(record.violation_type_id) ?? null,
    })) as AdminViolationRecord[],
    totalCount: count ?? 0,
  };
}

export async function createViolationRecord(input: {
  studentId: string;
  violationTypeId: string;
  occurredAt: string;
  details: string;
  status: "pending" | "confirmed" | "dismissed";
}) {
  if (
    !input.studentId ||
    !input.violationTypeId ||
    !Number.isFinite(Date.parse(input.occurredAt)) ||
    !["pending", "confirmed", "dismissed"].includes(input.status)
  ) {
    throw new Error("Data pelanggaran tidak valid.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_create_violation_record", {
    p_student_id: input.studentId,
    p_violation_type_id: input.violationTypeId,
    p_occurred_at: input.occurredAt,
    p_details: input.details.trim() || null,
    p_status: input.status,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function updateViolationRecordStatus(
  id: string,
  status: "pending" | "confirmed" | "dismissed",
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_records")
    .update({ status })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function createPointReset(input: {
  studentId: string;
  pointsRemoved: number;
  reason: string;
  resetAt: string;
}) {
  if (
    !Number.isInteger(input.pointsRemoved) ||
    input.pointsRemoved <= 0 ||
    !input.studentId ||
    !input.reason.trim() ||
    !Number.isFinite(Date.parse(input.resetAt))
  ) {
    throw new Error("Jumlah poin atau tanggal reset tidak valid.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_create_point_reset", {
    p_student_id: input.studentId,
    p_points_removed: input.pointsRemoved,
    p_reason: input.reason.trim(),
    p_reset_at: input.resetAt,
  });

  if (error) {
    throw error;
  }

  return data as string;
}
