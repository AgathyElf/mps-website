import "server-only";

import { createClient } from "@/lib/supabase/server";

export type StudentViolationStatus = "pending" | "confirmed" | "dismissed";

export type StudentViolationTypeSummary = {
  id: string;
  name: string;
  description: string | null;
  points: number;
  is_active: boolean;
};

export type StudentViolation = {
  id: string;
  student_id: string;
  violation_type_id: string;
  occurred_at: string;
  points_awarded: number;
  details: string | null;
  status: StudentViolationStatus;
  created_at: string;
  violation_type: StudentViolationTypeSummary | null;
};

export type StudentPointReset = {
  id: string;
  student_id: string;
  points_removed: number;
  reason: string;
  reset_at: string;
  created_at: string;
};

export async function getCurrentStudentId(profileId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function getStudentCurrentPoints(profileId: string): Promise<number> {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return 100;
  }

  const supabase = await createClient();

  const [
    { data: violations, error: violationsError },
    { data: resets, error: resetsError },
  ] =
    await Promise.all([
      supabase
        .from("violation_records")
        .select("points_awarded")
        .eq("student_id", studentId)
        .eq("status", "confirmed"),
      supabase
        .from("point_resets")
        .select("points_removed")
        .eq("student_id", studentId),
    ]);

  if (violationsError) {
    throw violationsError;
  }

  if (resetsError) {
    throw resetsError;
  }

  const confirmedPenalty = (violations ?? []).reduce(
    (sum, record) => sum + Number(record.points_awarded ?? 0),
    0,
  );
  const resetPoints = (resets ?? []).reduce(
    (sum, record) => sum + Number(record.points_removed ?? 0),
    0,
  );

  return 100 - confirmedPenalty + resetPoints;
}

export async function getStudentViolations(profileId: string): Promise<StudentViolation[]> {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_records")
    .select(
      "id, student_id, violation_type_id, occurred_at, points_awarded, details, status, created_at",
    )
    .eq("student_id", studentId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Array<{
    id: string;
    student_id: string;
    violation_type_id: string;
    occurred_at: string;
    points_awarded: number;
    details: string | null;
    status: StudentViolationStatus;
    created_at: string;
  }>;

  const typeIds = Array.from(
    new Set(rows.map((record) => record.violation_type_id).filter(Boolean)),
  );

  const typesById = new Map<string, StudentViolationTypeSummary>();

  if (typeIds.length > 0) {
    const { data: types, error: typeError } = await supabase
      .from("violation_types")
      .select("id, name, description, points, is_active")
      .in("id", typeIds);

    if (typeError) {
      throw typeError;
    }

    (types ?? []).forEach((typeRecord) => {
      typesById.set(typeRecord.id, typeRecord as StudentViolationTypeSummary);
    });
  }

  return rows.map((record) => ({
    ...record,
    violation_type: typesById.get(record.violation_type_id) ?? null,
  }));
}

export async function getStudentViolationById(
  profileId: string,
  violationId: string,
): Promise<StudentViolation | null> {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("violation_records")
    .select(
      "id, student_id, violation_type_id, occurred_at, points_awarded, details, status, created_at",
    )
    .eq("id", violationId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: typeData, error: typeError } = await supabase
    .from("violation_types")
    .select("id, name, description, points, is_active")
    .eq("id", data.violation_type_id)
    .maybeSingle();

  if (typeError) {
    throw typeError;
  }

  return {
    ...data,
    violation_type: typeData as StudentViolationTypeSummary | null,
  };
}

export async function getStudentPointResets(
  profileId: string,
): Promise<StudentPointReset[]> {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("point_resets")
    .select("id, student_id, points_removed, reason, reset_at, created_at")
    .eq("student_id", studentId)
    .order("reset_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as StudentPointReset[];
}
