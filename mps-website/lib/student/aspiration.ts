import "server-only";

import { getAuthProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type StudentAspirationStatus =
  | "submitted"
  | "in_review"
  | "responded"
  | "closed";

export type StudentAspiration = {
  id: string;
  student_id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  status: StudentAspirationStatus;
  assigned_to_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentAspirationUpdate = {
  id: string;
  aspiration_id: string;
  author_profile_id: string | null;
  status: StudentAspirationStatus | null;
  content: string | null;
  created_at: string;
};

export const aspirationStatusLabels: Record<StudentAspirationStatus, string> = {
  submitted: "Dikirim",
  in_review: "Sedang ditinjau",
  responded: "Sudah dibalas",
  closed: "Ditutup",
};

export async function getCurrentStudentId(profileId: string) {
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

export async function getStudentAspirations(profileId: string) {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return [] as StudentAspiration[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aspirations")
    .select(
      "id, student_id, title, content, category, is_anonymous, status, assigned_to_profile_id, created_at, updated_at",
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as StudentAspiration[];
}

export async function getStudentAspirationById(
  profileId: string,
  aspirationId: string,
) {
  const studentId = await getCurrentStudentId(profileId);

  if (!studentId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aspirations")
    .select(
      "id, student_id, title, content, category, is_anonymous, status, assigned_to_profile_id, created_at, updated_at",
    )
    .eq("id", aspirationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.student_id !== studentId) {
    return null;
  }

  return data as StudentAspiration;
}

export async function getAspirationUpdates(aspirationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aspiration_updates")
    .select("id, aspiration_id, author_profile_id, status, content, created_at")
    .eq("aspiration_id", aspirationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as StudentAspirationUpdate[];
}

export async function createStudentAspiration(input: {
  profileId: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
}) {
  const studentId = await getCurrentStudentId(input.profileId);

  if (!studentId) {
    throw new Error("Student profile tidak ditemukan.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aspirations")
    .insert([
      {
        student_id: studentId,
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category.trim(),
        is_anonymous: input.isAnonymous,
        status: "submitted",
        assigned_to_profile_id: null,
      },
    ])
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function getStudentAspirationAccessProfile() {
  const profile = await getAuthProfile();

  if (!profile || profile.role !== "student") {
    return null;
  }

  return profile;
}
