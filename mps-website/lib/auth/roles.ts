export const userRoles = ["student", "admin", "advisor", "super_admin"] as const;

export type UserRole = (typeof userRoles)[number];
export type Dashboard = "student" | "admin" | "advisor";

export function isUserRole(role: string): role is UserRole {
  return userRoles.some((userRole) => userRole === role);
}

export function dashboardForRole(role: UserRole): `/${Dashboard}/dashboard` {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "advisor":
      return "/advisor/dashboard";
    case "admin":
    case "super_admin":
      return "/admin/dashboard";
  }
}

export function canAccessDashboard(
  role: UserRole | null,
  dashboard: Dashboard,
): boolean {
  if (!role) {
    return false;
  }

  if (dashboard === "admin") {
    return role === "admin" || role === "super_admin";
  }

  if (dashboard === "advisor") {
    return role === "advisor" || role === "super_admin";
  }

  return role === "student";
}
