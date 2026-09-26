/**
 * rowClassUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised logic for DataGrid row highlighting in the Call Logger table.
 *
 * CSS CLASS PRIORITY (highest → lowest):
 *   1. row--pending          Internal Status === "Pending"           → light red
 *   2. row--delay-3          Call not started, 3+ days overdue       → deep orange
 *   3. row--delay-2          Call not started, 2 days overdue        → medium amber
 *   4. row--delay-1          Call not started, 1 day overdue         → light yellow
 *   5. row--followup-pending At least one pending follow-up          → soft amber
 *
 * To add a new rule:
 *   - Add the class logic inside getCallRowClassName() below.
 *   - Add the corresponding style block inside rowClassSx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Returns true if a date string is a real/valid date (not a 1900 placeholder). */
const isValidDate = (d) => Boolean(d) && !String(d).startsWith("1900-01-01");

/**
 * Returns how many full calendar days ago a date string was.
 * Returns 0 for invalid / unparseable dates.
 */
const getDaysOverdue = (rawDateStr) => {
  if (!rawDateStr) return 0;
  try {
    const created = new Date(rawDateStr);
    if (isNaN(created.getTime())) return 0;
    const diffMs = Date.now() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

/**
 * getCallRowClassName
 * ─────────────────────────────────────────────────────────────────────────────
 * Pass this directly to the DataGrid `getRowClassName` prop:
 *
 *   <DataGrid getRowClassName={getCallRowClassName} ... />
 */
export const getCallRowClassName = (params) => {
  const row = params?.row;
  if (!row) return "";

  // ── 1. Internal Status = "Pending" ──────────────────────────────────────
  if (row.status === "Pending") return "row--pending";

  // ── 2. Call not started + overdue (graduated urgency) ───────────────────
  //    Uses `dateRaw` (the original ISO date string preserved in normalizeRowData)
  if (!row.callStart && row.dateRaw) {
    const days = getDaysOverdue(row.dateRaw);
    if (days >= 3) return "row--delay-3"; // 3+ days → deep orange
    if (days >= 2) return "row--delay-2"; // 2 days  → amber
    if (days >= 1) return "row--delay-1"; // 1 day   → light yellow
  }

  // ── 3. Has at least one pending follow-up ────────────────────────────────
  try {
    const fuList = row.FollowUpList;
    const list = Array.isArray(fuList)
      ? fuList
      : fuList
      ? JSON.parse(fuList)
      : [];

    const hasPendingFollowUp = list.some(
      (fu) =>
        !isValidDate(fu?.CallClosed) ||
        !fu?.CallDuration ||
        fu?.CallDuration === "00:00:00"
    );
    if (hasPendingFollowUp) return "row--followup-pending";
  } catch {
    /* ignore JSON parse errors */
  }

  return "";
};

/**
 * rowClassSx
 * ─────────────────────────────────────────────────────────────────────────────
 * Spread this into the DataGrid `sx` prop alongside your other styles:
 *
 *   <DataGrid sx={{ ...yourOtherStyles, ...rowClassSx }} />
 */
export const rowClassSx = {
  // ── Status: Pending ──────────────────────────────────────────────────────
  "& .row--pending": {
    backgroundColor: "#FEE2E2",  // light red
    "&:hover": {
      backgroundColor: "#FECACA !important",
    },
  },

  // ── Call not started: 1 day overdue ──────────────────────────────────────
  "& .row--delay-1": {
    backgroundColor: "#FEF9C3",  // light yellow
    "&:hover": {
      backgroundColor: "#FEF08A !important",
    },
  },

  // ── Call not started: 2 days overdue ─────────────────────────────────────
  "& .row--delay-2": {
    backgroundColor: "#FEF3C7", // light amber
    "&:hover": {
      backgroundColor: "#FDE68A !important",
    },
  },

  // ── Call not started: 3+ days overdue ────────────────────────────────────
  "& .row--delay-3": {
    backgroundColor: "#FFEDD5",  // light orange
    "&:hover": {
      backgroundColor: "#FED7AA !important",
    },
  },

  // ── Pending follow-up ─────────────────────────────────────────────────────
  "& .row--followup-pending": {
    backgroundColor: "#E0E7FF", // soft indigo/blue for distinct visibility
    "&:hover": {
      backgroundColor: "#C7D2FE !important",
    },
  },
};
