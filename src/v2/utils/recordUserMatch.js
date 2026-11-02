const normalizeIdentity = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");

const addIdentity = (identities, value) => {
  if (value == null || typeof value === "object") return;
  const normalized = normalizeIdentity(value);
  if (normalized) identities.add(normalized);
};

const readAliases = (record) => {
  if (!record || typeof record !== "object") return [];
  return Object.entries(record)
    .filter(([key]) =>
      /^(id|userid|user_id|employeeid|employee_id|user|username|email|fullname)$/i.test(key),
    )
    .map(([, value]) => value);
};

const readAssignments = (record) => {
  const raw = record?.AssignmentsJson ?? record?.assignments ?? record?.Assignments;
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Match a record's owner fields against the signed-in user's names and IDs. */
export const matchesCurrentUser = (record, user, ownerFields = []) => {
  const currentIdentities = new Set(readAliases(user).map(normalizeIdentity).filter(Boolean));
  const firstName = user?.firstname ?? user?.firstName;
  const lastName = user?.lastname ?? user?.lastName;
  addIdentity(currentIdentities, [firstName, lastName].filter(Boolean).join(" "));
  if (!currentIdentities.size || !record) return false;

  const recordIdentities = new Set();
  ownerFields.forEach((field) => addIdentity(recordIdentities, record?.[field]));
  readAssignments(record).forEach((assignment) => {
    addIdentity(recordIdentities, assignment?.AssignedTo);
    addIdentity(recordIdentities, assignment?.AssignedToUserId);
    addIdentity(recordIdentities, assignment?.user);
    addIdentity(recordIdentities, assignment?.userId);
  });

  return [...recordIdentities].some((identity) => currentIdentities.has(identity));
};

