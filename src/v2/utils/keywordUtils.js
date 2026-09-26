/**
 * Utility functions for handling ticket keywords and mapping between employee userids and user names.
 * Supports stringified JSON arrays of objects (e.g. [{"EmployeeId": 201, "EmployeeName": "mitali admin"}]),
 * double-escaped JSON strings, stringified JSON arrays of user IDs (e.g. "[12, 14]"), JavaScript arrays, and slash/comma separated strings.
 */

export const getEmployeeList = () => {
  try {
    const masterData = JSON.parse(sessionStorage.getItem("masterData") || "{}");
    return masterData?.employees || [];
  } catch (err) {
    console.warn("Error reading masterData from session:", err);
    return [];
  }
};

/**
 * Safely parses raw keywords input into an array of primitives or objects.
 */
export const parseRawKeywords = (keywordsInput) => {
  if (!keywordsInput) return [];
  if (Array.isArray(keywordsInput)) return keywordsInput;
  if (typeof keywordsInput === "string") {
    let trimmed = keywordsInput.trim();
    if (!trimmed) return [];

    // Handle double-escaped JSON string like "\"[{...}]\""
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      try {
        const unescaped = JSON.parse(trimmed);
        if (typeof unescaped === "string") {
          trimmed = unescaped.trim();
        } else if (Array.isArray(unescaped)) {
          return unescaped;
        } else if (typeof unescaped === "object" && unescaped !== null) {
          return [unescaped];
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === "object" && parsed !== null) return [parsed];
      } catch (e) {
        // Ignore parse error and fallback to string splitting
      }
    }

    if (trimmed.includes("/")) {
      return trimmed.split("/").map((s) => s.trim()).filter(Boolean);
    }
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

/**
 * Extracts an array of user IDs or raw values from keywords input.
 */
export const parseKeywordUserIds = (keywordsInput) => {
  const items = parseRawKeywords(keywordsInput);
  if (!items.length) return [];

  return items.map((item) => {
    if (typeof item === "object" && item !== null) {
      const id = item.EmployeeId ?? item.userid ?? item.id ?? item.user_id;
      if (id !== undefined && id !== null) return id;
      const name = item.EmployeeName || item.user || item.name || item.username;
      if (name) return name;
    }
    return item;
  });
};

/**
 * Converts keywords input into employee display names (EmployeeName or user field).
 * If an object has EmployeeName/user, uses it directly.
 * Otherwise looks up the employee in masterData by ID.
 */
export const getDisplayNamesFromKeywords = (keywordsInput, employees = getEmployeeList()) => {
  const items = parseRawKeywords(keywordsInput);
  if (!items.length) return [];

  const empList = employees && employees.length > 0 ? employees : getEmployeeList();

  return items.map((item) => {
    // If item is an object like { EmployeeId: 201, EmployeeName: "mitali admin" }
    if (typeof item === "object" && item !== null) {
      const name = item.EmployeeName || item.user || item.name || item.username;
      if (name && String(name).trim()) return String(name).trim();

      const id = item.EmployeeId ?? item.userid ?? item.id ?? item.user_id;
      if (id !== undefined && id !== null) {
        const empById = empList.find(
          (e) => String(e?.userid) === String(id) || Number(e?.userid) === Number(id)
        );
        if (empById && empById.user) return empById.user;
        return String(id);
      }
    }

    // Primitive (ID or Name string/number)
    const idOrName = item;
    const empById = empList.find(
      (e) => String(e?.userid) === String(idOrName) || Number(e?.userid) === Number(idOrName)
    );
    if (empById && empById.user) {
      return empById.user;
    }

    const empByName = empList.find(
      (e) => String(e?.user)?.toLowerCase() === String(idOrName)?.toLowerCase()
    );
    if (empByName && empByName.user) {
      return empByName.user;
    }

    return String(idOrName);
  });
};

/**
 * Converts an array of display names (user names) to array of numeric/string userids.
 * Also checks rawKeywordsInput if it contained objects with EmployeeName & EmployeeId mappings.
 */
export const getUserIdsFromDisplayNames = (
  namesArray,
  employees = getEmployeeList(),
  rawKeywordsInput = null
) => {
  if (!Array.isArray(namesArray)) return [];

  const empList = employees && employees.length > 0 ? employees : getEmployeeList();

  // Extract name -> ID map from rawKeywordsInput if it contained objects
  const rawMap = new Map();
  if (rawKeywordsInput) {
    const rawItems = parseRawKeywords(rawKeywordsInput);
    rawItems.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        const name = item.EmployeeName || item.user || item.name || item.username;
        const id = item.EmployeeId ?? item.userid ?? item.id ?? item.user_id;
        if (name && id !== undefined && id !== null) {
          rawMap.set(String(name).toLowerCase(), id);
        }
      }
    });
  }

  return namesArray.map((nameOrId) => {
    const lowerName = String(nameOrId).toLowerCase();

    // Check map from raw keywords input
    if (rawMap.has(lowerName)) {
      const mappedId = rawMap.get(lowerName);
      const num = Number(mappedId);
      return isNaN(num) ? mappedId : num;
    }

    // Try finding by employee user name in masterData
    const empByName = empList.find(
      (e) => String(e?.user)?.toLowerCase() === lowerName
    );
    if (empByName && empByName.userid !== undefined && empByName.userid !== null) {
      const num = Number(empByName.userid);
      return isNaN(num) ? empByName.userid : num;
    }

    // Try finding by userid
    const empById = empList.find(
      (e) => String(e?.userid) === String(nameOrId) || Number(e?.userid) === Number(nameOrId)
    );
    if (empById && empById.userid !== undefined && empById.userid !== null) {
      const num = Number(empById.userid);
      return isNaN(num) ? empById.userid : num;
    }

    const numVal = Number(nameOrId);
    return !isNaN(numVal) ? numVal : nameOrId;
  });
};

/**
 * Format tags (display names) into stringified JSON array of userids for API payload:
 * e.g. ["mitali admin", "Mack patel"] -> "[201,315]"
 */
export const formatKeywordsPayload = (
  tagsArray,
  employees = getEmployeeList(),
  rawKeywordsInput = null
) => {
  const userIds = getUserIdsFromDisplayNames(tagsArray, employees, rawKeywordsInput);
  return JSON.stringify(userIds);
};

/**
 * Extracts a list of unique person names mentioned in a single ticket.
 * Checks Keywords/tags (mapped to employee display names), CreatedBy, LastUpdatedBy, username,
 * comments author names, and any @mention in comments/instructions/subject.
 */
export const extractPersonsFromTicket = (ticket, employees = getEmployeeList()) => {
  if (!ticket) return [];
  const empList = employees && employees.length > 0 ? employees : getEmployeeList();
  const persons = new Set();

  const addName = (name) => {
    if (!name || typeof name !== "string") return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) return;
    persons.add(trimmed);
  };

  // 1. Keywords / tags
  const rawKeywords = ticket?.Keywords || ticket?.keywords || ticket?.tags;
  if (rawKeywords) {
    const displayNames = getDisplayNamesFromKeywords(rawKeywords, empList);
    displayNames.forEach(addName);
  }

  // 2. Comments (@mentions in message)
  if (ticket?.comments || ticket?.Comments) {
    let parsedComments = [];
    try {
      if (Array.isArray(ticket.comments)) {
        parsedComments = ticket.comments;
      } else if (typeof ticket.comments === "string" && ticket.comments.trim()) {
        parsedComments = JSON.parse(ticket.comments);
      }
    } catch (e) {}

    if (Array.isArray(parsedComments)) {
      parsedComments.forEach((c) => {
        if (c?.message && typeof c.message === "string") {
          const matches = c.message.match(/@([a-zA-Z0-9_.\s]+?)(?=[\s,;:!?\n]|$)/g);
          if (matches) {
            matches.forEach((m) => {
              const clean = m.replace(/^@/, "").trim();
              if (clean) addName(clean);
            });
          }
        }
      });
    }
  }

  // 4. Instructions and Subject @mentions
  [ticket?.instruction, ticket?.subject, ticket?.MainSubject].forEach((text) => {
    if (typeof text === "string" && text.includes("@")) {
      const matches = text.match(/@([a-zA-Z0-9_.\s]+?)(?=[\s,;:!?\n]|$)/g);
      if (matches) {
        matches.forEach((m) => {
          const clean = m.replace(/^@/, "").trim();
          if (clean) addName(clean);
        });
      }
    }
  });

  return Array.from(persons);
};

/**
 * Gathers all unique person mentions across all tickets and calculates their occurrence count.
 * Returns an array of objects sorted by ticket count descending:
 * e.g. [{ name: "admin admin", count: 14 }, { name: "Joseph Archer", count: 8 }]
 */
export const extractTicketMentions = (tickets = [], employees = getEmployeeList()) => {
  if (!Array.isArray(tickets) || tickets.length === 0) return [];
  const empList = employees && employees.length > 0 ? employees : getEmployeeList();

  const countsMap = new Map();

  tickets.forEach((ticket) => {
    const persons = extractPersonsFromTicket(ticket, empList);
    persons.forEach((name) => {
      const lower = name.toLowerCase();
      if (!countsMap.has(lower)) {
        countsMap.set(lower, { name, count: 0 });
      }
      const entry = countsMap.get(lower);
      entry.count += 1;
      if (name !== entry.name && name.length >= entry.name.length) {
        entry.name = name;
      }
    });
  });

  return Array.from(countsMap.values())
    .filter((item) => item.count > 0 && item.name.length > 1)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/**
 * Gathers all authors who created comments with mentions, or created comments / tickets.
 * Used for "Mentions by who" filter.
 * Returns an array of objects sorted by ticket count descending:
 * e.g. [{ name: "Joseph Archer", count: 6 }]
 */
export const extractTicketMentionAuthors = (tickets = [], employees = getEmployeeList()) => {
  if (!Array.isArray(tickets) || tickets.length === 0) return [];
  const empList = employees && employees.length > 0 ? employees : getEmployeeList();

  const countsMap = new Map();

  tickets.forEach((ticket) => {
    const authors = new Set();

    const addAuthor = (name) => {
      if (!name || typeof name !== "string") return;
      const trimmed = name.trim();
      if (!trimmed || trimmed.length < 2) return;

      // Look up display name if possible
      const empByName = empList.find(
        (e) => String(e?.user)?.toLowerCase() === trimmed.toLowerCase() || String(e?.userid) === trimmed
      );
      const displayName = empByName?.user || trimmed;
      authors.add(displayName);
    };

    // 1. Comments authors
    let parsedComments = [];
    try {
      if (Array.isArray(ticket?.comments)) {
        parsedComments = ticket.comments;
      } else if (typeof ticket?.comments === "string" && ticket.comments.trim()) {
        parsedComments = JSON.parse(ticket.comments);
      }
    } catch (e) {}

    if (Array.isArray(parsedComments)) {
      parsedComments.forEach((c) => {
        if (c?.Name) {
          addAuthor(c.Name);
        }
      });
    }

    // 2. CreatedBy who added @mentions or tags
    const hasMentionsInTicket =
      (ticket?.instruction && ticket.instruction.includes("@")) ||
      (ticket?.subject && ticket.subject.includes("@")) ||
      (ticket?.Keywords && ticket.Keywords.length > 0);

    if (hasMentionsInTicket) {
      addAuthor(ticket?.CreatedBy || ticket?.createdBy || ticket?.created_by);
      addAuthor(ticket?.LastUpdatedBy || ticket?.LastUpdatedByName);
    }

    authors.forEach((name) => {
      const lower = name.toLowerCase();
      if (!countsMap.has(lower)) {
        countsMap.set(lower, { name, count: 0 });
      }
      const entry = countsMap.get(lower);
      entry.count += 1;
      if (name !== entry.name && name.length >= entry.name.length) {
        entry.name = name;
      }
    });
  });

  return Array.from(countsMap.values())
    .filter((item) => item.count > 0 && item.name.length > 1)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};


