/**
 * Mention utility functions for New Call comment system.
 * Reads employee master data from sessionStorage and provides
 * regex matching and employee resolution for @mentions.
 */

export function getEmployeesList() {
  try {
    const raw = sessionStorage.getItem('masterData');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.employees)) {
        return parsed.employees;
      }
    }
  } catch (err) {
    console.warn('Failed to read employees from sessionStorage masterData:', err);
  }
  return [];
}

export function findEmployeeByName(name, employees = getEmployeesList()) {
  if (!name) return null;
  const clean = name.replace(/^@/, '').trim().toLowerCase();
  if (!clean) return null;

  const empList = Array.isArray(employees) && employees.length > 0 ? employees : getEmployeesList();

  return (
    empList.find((emp) => {
      const u = (emp.user || emp.EmployeeName || emp.name || '').trim().toLowerCase();
      return u === clean;
    }) ||
    empList.find((emp) => {
      const u = (emp.user || emp.EmployeeName || emp.name || '').trim().toLowerCase();
      return clean.length >= 3 && (u.startsWith(clean) || clean.startsWith(u));
    }) ||
    null
  );
}

export function buildMentionRegex(employees = getEmployeesList()) {
  const empList = Array.isArray(employees) && employees.length > 0 ? employees : getEmployeesList();
  const names = empList
    .map((e) => (e.user || e.EmployeeName || e.name || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (names.length > 0) {
    const namesPattern = names.map(escapeRegex).join('|');
    return new RegExp(`(https?:\\/\\/[^\\s]+|@(?:${namesPattern})|@[a-zA-Z0-9_.-]+)`, 'gi');
  }

  return /(https?:\/\/[^\s]+|@[a-zA-Z0-9_.-]+)/gi;
}
