import { NextResponse, type NextRequest } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import { dashboardForRole } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  const profile = await getAuthProfile();

  if (!profile) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!profile.role) {
    return NextResponse.redirect(new URL("/auth/access-denied", request.url));
  }

  return NextResponse.redirect(
    new URL(dashboardForRole(profile.role), request.url),
  );
}
