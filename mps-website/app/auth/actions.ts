"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/auth/session";
import { dashboardForRole } from "@/lib/auth/roles";

export type LoginState = {
  error: string | null;
};

export async function signInAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { error: "Masukkan email dan kata sandi." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      error: "Autentikasi belum dikonfigurasi. Hubungi administrator aplikasi.",
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (signInError) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  const profile = await getAuthProfile();
  if (!profile?.role) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }
    return {
      error: "Akun ini belum memiliki akses MPS. Hubungi administrator.",
    };
  }

  redirect(dashboardForRole(profile.role));
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  redirect("/auth/login");
}
