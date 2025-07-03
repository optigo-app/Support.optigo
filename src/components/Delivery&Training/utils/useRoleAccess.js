export const useRoleAccess = (user) => {
  const rawRoleId = user?.roleid;
  const roleId = typeof rawRoleId === "boolean"
    ? rawRoleId ? 1 : 0
    : Number(rawRoleId) || 0;

  const rawRole = user?.role;
  const roleName = typeof rawRole === "string"
    ? rawRole.toLowerCase()
    : String(rawRole || "").toLowerCase();

  const isRole = (targetRole, targetId) =>
    roleName === targetRole || roleId === targetId || String(roleId) === String(targetId);

  if (isRole("admin", 1)) {
    return { role: "admin", isClient: false, isAdminDashboard: true };
  }

  if (isRole("employee", 2)) {
    return { role: "employee", isClient: false, isAdminDashboard: true };
  }

  if (isRole("client", 3)) {
    return { role: "client", isClient: true, isAdminDashboard: false };
  }
  return { role: "guest", isClient: false, isAdminDashboard: false };
};
