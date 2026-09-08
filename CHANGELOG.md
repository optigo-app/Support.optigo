# Changelog

## 2026-05-07 — CallPop: Flat Horizontal Pill Bar UI (UI-only, no functional change)

### File Changed
- `src/components/CallLogger/New/CallPop.jsx`

### Old Behavior
- Panel was a **tall vertical card**: 440px wide, ~260–300px tall
- Large 52×52 avatar centered at top, separate description box, 50×50 icon buttons with text labels below each

### New Behavior
- **Flat horizontal pill bar**: ~58px tall, `borderRadius: 100px`, `bottom: 20px`
- Avatar (36×36) + Name + Company chip + status dot + timer inline on the **left**
- Compact 34×34 icon buttons with MUI `Tooltip` on the **right**
- Description shown inline in the status row (truncated), no separate box
- Close button at far right, separated by a thin divider

### Reason
User requested compact, low-height popup for better screen real estate and compatibility.

### Reversibility
Restore the old `return (...)` block in `CallRecorderScreen` from git history or the revert snippet in the inline code comment.

---

## 2026-04-20 — FloatingButton: Fluid Drag & Snapping

### File(s) Changed
- `src/components/CallLogger/CallQueue/FloatingButton.jsx`

### Old Behavior
- Used `react-draggable` on a screen-sized container, which caused the entire fixed overlay to move.
- Movement felt "rigid" and lacked any fluid animations or spring effects.
- Popup menu was fixed at a static position (`bottom: 100, right: 20`) regardless of where the button was moved.
- No viewport boundary protection (button could be dragged off-screen).

### New Behavior
- **framer-motion Integration**: Replaced legacy draggable logic with `framer-motion` for hardware-accelerated, fluid movement.
- **Magnetic Snapping**: On release, the button automatically snaps to the nearest screen edge (left or right) using a spring animation (`stiffness: 400, damping: 30`).
- **Dynamic Popup Positioning**: The "Call Queue" menu now follows the button's position. It intelligently aligns its orientation (left-aligned vs right-aligned) based on which edge the button is snapped to.
- **Viewport Constraints**: Implemented `dragConstraints` to ensure the button never gets hidden under the screen edges or navigation bars.
- **Premium UI (MUI)**:
  - Replaced custom divs with MUI `Fab` (Floating Action Button) and `Paper`.
  - Added glassmorphism effects (backdrop filter, subtle borders) to the popup.
  - Added smooth scale transitions on drag and tap.

### Reason for Change
- User requested "fluid movement" and edge-snapping behavior ("if flta in rigth it shodl move to ritgh").
- Improved visual aesthetics to match the "premium" production standard of the app.

### Reversibility
- Restore the `react-draggable` implementation and static positioning from the git history.

---

## 2026-04-15 — Sidebar: Full Left-Rail Navigation (replaces top AppBar)

### Files Changed
- `src/components/_ui/Sidebar/index.js` ← complete rewrite
- `src/components/_ui/HeaderWrapper.jsx`

### Old Behavior
- Navigation was a horizontal `AppBar` at the top of the page.
- Greeting, Call Queue chip, Forwarded Calls chip, `NavigationMenu`, and Logout button all lived inside a `Toolbar`.
- Zustand (`useSidebarStore`) was used to hold `activeItem` and `openGroups` state.

### New Behavior

#### Sidebar (`Sidebar/index.js`)
- **Pure React state** (`useState`) — Zustand store removed entirely.
- **Smooth collapse animation** — outer shell animates `width` only; inner content stays 240 px wide and is clipped via `overflow:hidden`. All icon movement uses `transform: translateX()` exclusively so no layout reflow occurs mid-animation.
- **Avatar = collapse toggle** — clicking the avatar expands or collapses the sidebar. No separate hamburger button when collapsed.
- **Profile card popover** — when the sidebar is collapsed, hovering the avatar shows a premium dark-glass `Popover` (gradient background, glowing avatar, name + greeting) anchored to the right of the avatar.
- **Expanded header** — shows greeting line + username beside the avatar plus a collapse `IconButton`.
- **Bottom rail** — Call Queue (with animated pulse when ≥ 3), Forwarded Calls, and Logout are rendered as `ListItemButton` rows at the bottom of the sidebar. Each shows a badge count and collapses to icon-only with a tooltip.
- **Self-contained** — imports `useAuth`, `useCallLog`, `useGreeting`, `useNavigate`, and `Cookies` directly; no props needed from `HeaderWrapper`.
- **ForwardedCallsPopover** moved inside the sidebar component.

#### HeaderWrapper (`HeaderWrapper.jsx`)
- Old `<AppBar>` block is **commented out** (preserved for revert, not deleted).
- Return now renders a flex-row `Box` (`display:"flex", height:"100vh", overflow:"hidden"`):
  - Left: `<ModernMenu />` (self-contained sidebar)
  - Right: `<Box sx={{ flex:1, overflow:"auto" }}>` wrapping `{children}` (page content)

### Reason for Change
User requested a collapsible left sidebar to replace the top AppBar, with avatar-based profile interaction and all action buttons consolidated into the sidebar.

### Reversibility
- Re-enable the `<AppBar>` block (currently inside `{/* ... */}`) in `HeaderWrapper.jsx`.
- Change the flex-row wrapper back to `<> {children} </>`.
- Restore `useSidebarStore` (Zustand) in `Sidebar/index.js` if external state sharing is needed again.

---

## 2026-04-14 — TicketUI: "Move To Order Request" now submits directly via API

### Files Changed
- `src/components/TicketUi/components/Comment/index.js`
- `src/components/TicketUi/components/Comment/CreateComment.jsx`

### Old Behavior
- Clicking "Move To Order Request" called `router(/orderRequest?TicketId=...&idx=...)` with ticket state, navigating the user away from the Ticket page.
- The user had to fill and submit the Order Request form manually on that separate page.

### New Behavior
- Clicking "Move To Order Request" now directly calls `PointToBeDiscuss.createPointDelivery()` with the ticket data pre-mapped into the correct API payload.
- No navigation away from the Ticket page. User stays on the Ticket page.
- The button shows **"Submitting..."** and is **disabled** during the API call to prevent double-submission.
- **Optimistic UI Update**: On success, instead of doing an expensive API refetch (`setRefresh`), it updates the local context state `tickets` and `selectedTicket` to reflect `OrderId: "PENDING_ORDER"`, immediately hiding the "Move To Order Request" button without any server round-trip delay.
- On success: `showNotification("Order request created successfully!", "success")`.
- On failure: `showNotification("Failed to create order request. Please try again.", "error")`.
- `useNavigate` import removed from `index.js` (no longer needed).

---

## 2026-04-14 — Ticket UI: Optimistic updates for Close/Reopen Ticket

### Files Changed
- `src/context/useTicket.js`

### Old Behavior
- `CloseTicket` successfully called the backend, then immediately fired `setRefresh((prev) => !prev)` to re-download the entire ticket list from the server to reflect the "Closed" or "Open" status.

### New Behavior
- Removed `setRefresh` from `CloseTicket`.
- **Optimistic UI Update**: Uses `setTickets` and `setSelectedTicket` to immediately set the `Status` property to `"Closed"` or `"Open"` based on the action, updating the UI instantly and saving an expensive API request.

### Payload Mapping (from ticket data)
| API Field | Source |
|---|---|
| `ClientCode` | `data.companyname` |
| `CreatedBy` | `user.firstname + user.lastname` |
| `TicketNo` | `data.TicketNo` |
| `TicketDate` | `data.CreatedOn` (formatted to YYYY-MM-DD) |
| `RequestDate` | today's date |
| `Topic` | `data.subject` |
| `Description` | `data.instruction` |
| `CommunicationWith` | `data.username` |
| `TicketId` | `data.TicketId` |
| `Status` | `"Pending"` (hardcoded) |
| `OnDemand` | `"yes"` (hardcoded) |
| `PaymentStatus` | `"Unpaid"` (hardcoded) |

### Reason for Change
User requested order requests be created directly from the Ticket page without navigating to `/orderRequest`.

### Reversibility
Restore `useNavigate` import and replace `HandleMoveToOrder` body with:
```js
const { comments, ...safeData } = data;
const TicketId = btoa(safeData?.TicketNo);
router(`/orderRequest?TicketId=${TicketId}&idx=${btoa("req")}`, { state: safeData });
```

---



## 2026-04-14 — Layout: Top AppBar converted to Fixed Left Sidebar

### Files Changed
- `src/components/_ui/HeaderWrapper.jsx`
- `src/components/_ui/Header/NavigationMenu.jsx`

### Old Behavior
- Header was a horizontal `AppBar` (position: static) at the top of the page.
- `NavigationMenu` rendered buttons horizontally with a left/width CSS pill.
- No collapsed state — always full-width all items visible.

### New Behavior
- **Fixed left sidebar** (position: fixed, full height, z-index 1200).
- **Collapsed (64px):** Shows avatar, toggle icon, nav icons only, chip icons, logout icon. Tooltips on hover show labels.
- **Expanded (230px):** Full avatar + greeting + username, labeled nav items, full chips, labeled logout.
- **Smooth transition:** `width` and `margin-left` both animate at 220ms cubic-bezier — zero layout jump.
- **Persisted state:** Collapsed/expanded preference saved to `localStorage` as `sidebar_collapsed`.
- `NavigationMenu` pill is now **vertical** (tracks `top`/`height` instead of `left`/`width`).
- Pill re-measures on `collapsed` toggle so it always sits precisely behind the active button.
- All existing logic preserved: logout, forwarded calls popover, routing guards, `useCallLog`, `useAuth`.

### Reason for Change
User requested sidebar navigation instead of top header for better screen real estate and UX.

### Reversibility
Revert `HeaderWrapper.jsx` to the previous `AppBar`/`Toolbar` layout and `NavigationMenu.jsx` to the horizontal `left`/`width` pill version.

---

## 2026-04-14 — AssignmentForm: Combined Department + Assigned To into Single Autocomplete

### Files Changed
- `src/components/Delivery&Training/components/Delivery/Form/AssignmentForm.jsx`
- Applies to both **Orders** (`/Orders`) and **Order Request** (`/orderRequest`) — they share the same form component.

### Old Behavior
- Two separate steps: first select "Department" Autocomplete, then "Assigned To" unlocked and filtered.
- User had to make two clicks / two searches to assign someone.

### New Behavior
- **Single grouped Autocomplete** — label: "Assign To (Designation / Person)".
- Typing in the field filters by **person name OR designation name** simultaneously.
- Options are grouped under designation headers (e.g. PD, FILLER) for easy browsing.
- Selecting a person **auto-fills** `department`, `user`, and `userId` — no second step needed.
- Helper text shows `Dept: <designation>` once a person is selected, confirming the auto-resolved department.
- Edit mode restores the single field correctly by matching `userId` or `user` label to the flat options list.
- API payload shape (`Department`, `AssignedTo`, `AssignedToUserId`) is **unchanged** — no backend impact.

### Reason for Change
User requested a simpler, faster assignment flow — one field instead of two.

---



### Files Changed
- `src/components/_ui/Header/NavigationMenu.jsx`

### Old Behavior
- The active highlight pill was rendered using **framer-motion `layoutId`** spring animation.
- On every nav click, the pill `motion.div` was **conditionally unmounted** from the old button and **re-mounted** at the new one.
- framer-motion performed expensive **DOM layout measurements** across un/mount cycles per route change, causing noticeable lag (200–400ms) before the highlight moved.
- Active path was read directly from `useLocation()` — highlight update was delayed until route fully resolved.
- Nav button paths used **lowercase** (`/ticket`, `/orders`, `/training`) which **did not match** `Entry.js` route definitions (`/Ticket`, `/Orders`, `/Training`), causing active-state detection to silently fail for 3 of 5 items.

### New Behavior
- **framer-motion removed** from this component entirely.
- The pill `<Box>` is **always mounted**; its `left` / `width` are driven via a **180ms CSS cubic-bezier transition** — hardware-accelerated, zero DOM thrash.
- Pill position is measured via `getBoundingClientRect()` inside a `requestAnimationFrame` — runs once after layout settles.
- Active state is set **optimistically on click** via the existing `useNavStore` (Zustand), so the highlight jumps to the clicked item **instantly** — no waiting for the router to commit.
- `useEffect` syncs the store from `useLocation` to handle browser back/forward correctly.
- All paths corrected to match `Entry.js` exactly: `/Ticket`, `/Orders`, `/Training`, `/orderRequest`.

### Reason for Change
User reported heavy lag every time a header nav item (Call Log, Ticket, Training, Orders, Order Request) was clicked. Root cause: framer-motion `layoutId` spring animation performing synchronous layout measurements on each route change.

### Reversibility
Old behavior: re-introduce `motion.div layoutId="active-pill"` with `{active && (...)}` conditional rendering and remove `useNavStore` / `useRef` pill positioning logic.

---



### Added: Clear all call state on logout

**File(s) changed:** `src/components/_ui/HeaderWrapper.jsx`

**Old behavior:**
- `handleLogout` only removed the auth cookie (`skey`) and cleared `sessionStorage`.
- All 8 call-related `localStorage` keys were left intact after logout.
- On next login, the app would restore the previous session's state (stuck timer, disabled Add button, locked GridHeader) even though the user had no active call.

**New behavior:**
- Before removing the cookie, `handleLogout` now explicitly clears all 8 call localStorage keys:
  - `call_recording_time`
  - `current_call_data`
  - `call_is_paused`
  - `call_paused_duration`
  - `call_pause_start_time`
  - `call_sliders_state`
  - `concurrent_call_data`
  - `call_start_timestamp`
- After re-login, the app always starts with a clean state — no stuck timers, no disabled buttons.
- This gives users a guaranteed recovery path: if the UI is stuck, **log out and log back in**.

## 2026-04-14 (Stuck Call Bugfixes)

### Fixed: Add/Export buttons permanently disabled after browser crash

**File(s) changed:** `src/components/CallLogger/GridHeader.jsx`

**Old behavior:**
- `disabled={callStatusValue?.duration > 0}` — duration is loaded from `localStorage` on every page mount.
- If the browser crashed mid-call, `call_recording_time` remained in localStorage.
- On next load, if no active call was restored (e.g., cleared by another tab/admin), `duration > 0` but `currentCallId = null`. Both Add and Export buttons were permanently disabled with no way to recover except clearing localStorage in DevTools.

**New behavior:**
- `disabled={!!callStatusValue?.currentCallId}` — buttons are disabled only when a real active call exists.
- Stale `recordingTime` from a previous crash no longer affects button state.

---

### Fixed: Follow-up end call API failure left UI permanently locked

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

**Old behavior:**
- If `endFollowUpCall` API call failed (network error, server error), the handler returned early WITHOUT clearing the timer or state.
- Result: timer kept running, `isRunning = true`, GridHeader had `pointerEvents: none`. The user could not click anything. The only potential recovery was retrying the End Call button — but if the API kept failing, the user was stuck permanently.

**New behavior:**
- API failures now show a `"warning"` toast instead of blocking the UI.
- Execution falls through to the timer/state cleanup regardless of API success.
- The call is ended locally even if the server didn't confirm — user is informed via notification to verify on the server side.

## 2026-04-14 (Bugfix)

### Fixed: "Follow Up Date" filter not working (showing all records)

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

**Root cause:**
- The backend API doesn't understand `filterTargetField: "followUpDate"` — it silently ignored the value and returned all records without filtering.
- The `memoizedFilteredCalls` memo also didn't depend on `filterState`, so it never re-filtered when the filter changed.

**Fix applied:**
- In the filter `useEffect`, when `filterTargetField === "followUpDate"`, we now pass `filter: ""` to the API (skipping the unknown field), while still passing the date range for broad pre-filtering.
- In `memoizedFilteredCalls`, added a client-side pass: when `filterTargetField === "followUpDate"` and a date range is set, we parse each call's `FollowUpList` JSON and keep only calls that have at least one follow-up whose `CallStart` date falls within the selected range.
- Added `filterState` to the `useMemo` dependency array so it re-runs on filter state changes.

**Reason for change:**
- Follow-up date is stored inside the `FollowUpList` JSON column, not as a top-level API-filterable field. Client-side filtering is the correct approach.



### Added: "Follow Up Date" filter in Date Filter dropdown

**File(s) changed:** `src/components/CallLogger/DatePicker.jsx`

**Old behavior:**
- "Filter By" dropdown had only: Date, Call Start, Call Closed, None.

**New behavior:**
- Added "Follow Up Date" as a new filter target option in the "Filter By" dropdown.
- When selected, the backend API will receive `filterTargetField: "followUpDate"` to filter call logs by their follow-up scheduled date.

**Reason for change:**
- User requested date filtering based on follow-up date, not just the main call date.

---

### Fixed: GridHeader filter row overflow

**File(s) changed:** `src/components/CallLogger/GridHeader.jsx`

**Old behavior:**
- The header row would overflow horizontally when many filters were active (Company, Date Range, Status all together), causing elements to extend outside the viewport or clip behind other elements.
- There was also a typo in `bgcolor`: `"rbga(0,0,0,0.04)"` (invalid CSS value).

**New behavior:**
- Outer `Box` now has `flexWrap: "wrap"` and `gap: 1`, allowing the left (Add/Search/Toggle) group and right (filters) group to wrap to a new line on narrow viewports.
- The left group has `flexShrink: 0` to prevent compression.
- The right group also has `flexWrap: "wrap"` to allow individual filter items to wrap if needed.
- Fixed `bgcolor` typo from `"rbga"` to `"rgba"`.

**Reason for change:**
- UI overflow bug causing filters to clip or extend beyond the screen boundary.

---

### Added: "By Follow Up" analytics view mode

**File(s) changed:** `src/components/CallLogger/DurationMeter/index.jsx`

**Old behavior:**
- Analytics panel only had three view modes: By User, By Client, By Call Type.
- No analytics were available for follow-up call activity.

**New behavior:**
- Added a 4th mode: **"By Follow Up"** (purple bars).
- When selected, the panel iterates through each call's `FollowUpList` JSON, extracting individual follow-up call durations and grouping them by the person who handled the follow-up (`ReceivedBy` field inside the follow-up object).
- Shows total follow-up call count and duration per user in the analytics bar chart.

**Reason for change:**
- User requested follow-up call analytics grouped by user who handled the follow-up.

## 2026-04-13

### Added: "Pending Follow-Up" Filter View Mode

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

**Old behavior:**
- Clicking the "Pending Follow Up Calls" button in the toggle group would change the `viewMode` but would not actually filter the data, showing the same list as "Team View".

**New behavior:**
- The `viewMode === "followUp-Pending"` is now explicitly handled in the filtering logic.
- When active, the grid only displays calls that have at least one pending follow-up (where `CallClosed` is not a valid date and `CallDuration` is missing or "00:00:00").

**Reason for change:**
- User requested that the "followup pending" button should filter for calls with pending follow-up data.

### Standardized: Follow-Up Tooltip UI to match Call Info Tooltip

**File(s) changed:** `src/components/CallLogger/ColumnConfig.jsx`

**Old behavior:**
- Follow-up tooltip had a custom dashboard-like UI with a blue header and timeline markers.

**New behavior:**
- The Follow-Up column tooltip has been redesigned to align perfectly with the "Call Info" (Duration) column tooltip style for consistency.
- Uses the same typography and color palette.
- Follow-up items are listed as simple pairs with status and description notes.
- Consistent orange header `↻ Follow-ups (N)` matches the breakdown section in Call Info.

**Reason for change:**
- User requested UI consistency across related column tooltips.

## 2026-04-13 (UI Redesign)
- Improved typography and spacing for production-grade precision.

**Reason for change:**
- User requested a more modern, production-grade UI.

2: 
3: ## 2026-04-04
4: 

### Added: Follow-Up Right-Click Context Menu (Edit / Status / Forward)

**File(s) changed:** `src/components/CallLogger/FollowUpPanel.jsx`, `src/apis/CallLogApiController.js`, `src/context/UseCallLog.js`, `src/components/CallLogger/CallLogger.jsx`

**Old behavior:**
- Follow-up call list items only supported left-click to select and a start button. There was no way to edit description, change internal status, or forward/transfer a follow-up call from the panel.
- No `EDITFLLOWUPCALL` API existed in the controller.

**New behavior:**
- Right-clicking any follow-up item opens a context menu with 3 actions:
  1. **Edit Description** — opens dialog with multiline text field
  2. **Change Status** — opens dialog with Autocomplete dropdown using `STATUS_LIST` (internal status master)
  3. **Forward / Transfer** — opens dialog with Autocomplete dropdown using `forwardOption` (grouped by designation, shows avatar)
- All 3 actions call the new `editFollowUpCall` API (`EDITFLLOWUPCALL` mode) and refresh the call data on success.
- The UI properly parses exact follow-up JSON fields (`InternalStatus`, `ForwardedEmp`). Status is shown as a primary chip. Forwarded employee is displayed visually as an arrow pointing to a chip `[→] (Avatar) Name`, which shows a Tooltip with a larger avatar and full name on hover.
- **Fix:** Fixed a bug where updating only one field (like Status) would overwrite existing forwarded info or descriptions with blanks by ensuring all existing parameters are passed in the API payload.
- `showNotification` prop added to FollowUpPanel for toast feedback.

**Reason for change:**
- Users need to manage follow-up calls (change status, transfer, edit notes) directly from the follow-up panel without navigating to the main grid.


5: ### Added: Follow-up Aggregation and History Tree View
6: 
7: **File(s) changed:** `src/components/CallLogger/durationModal.jsx`, `src/components/CallLogger/DurationMeter/CallDetailModal.jsx`
8: 
9: **Old behavior:**
10: - Call Info tooltip only showed main call details (Start, End, Duration).
11: - User Call History "Total Talk Time" only counted the main call duration.
12: - User Call History timeline only showed main call entries, ignoring follow-ups.
13: 
14: **New behavior:**
15: - **Aggregated Tooltip**: The Call Info tooltip now shows Call Start, Call End, and Main Call Duration. If follow-ups exist, a separated follow-up section displays each follow-up with its `#Id`, handler name, and individual duration. A green "Total Duration" row sums everything.
16: - **Cell Indicator**: Duration text in the cell now shows a `+N` orange badge when follow-ups exist, with a tooltip displaying the aggregated total.
17: - **Aggregated History**: "Total Talk Time" in history now includes all completed follow-up durations. A follow-up count badge appears next to the main call count.
18: - **Tree View History**: Follow-up calls are rendered as nested items under the parent call with orange nodes and dashed connecting lines.
19: 
20: **Reason for change:**
21: - Provide users with a complete picture of time spent with a client including all follow-up calls.

### Fixed: Call Start button not updating after starting a call

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

**Old behavior:**
- After starting a call (both normal and follow-up), the "Start" button would remain visible instead of switching to Pause/Hang-up controls. This was caused by the `CurrentCall` sync effect overwriting fresh API data (with `callStart` set) with stale `callLogMap` data (without `callStart`).

**New behavior:**
- The sync effect now guards against overwriting a `CurrentCall` that already has `callStart` with stale data that doesn't. The UI correctly transitions to active-call mode immediately after `startCall` returns.

**Reason for change:**
- Prevent the UI from regressing to the pre-call state due to stale data race conditions during the call log refresh cycle.

22: ### Fixed: Circular structure error in Follow-up Call
23: 
24: **File(s) changed:** `src/components/CallLogger/CallRecorderScreen.jsx`
25: 
26: **Old behavior:**
27: - Clicking the "Start Follow-Up" button passed the React mouse event object as the first argument to `onStartFollowUp`.
28: - This event object was stored in state and then `JSON.stringify` was called on it to save to `localStorage`, causing a "Converting circular structure to JSON" error.
29: 
30: **New behavior:**
31: - The `onClick` handler is now wrapped in an arrow function `() => onStartFollowUp()`, ensuring no arguments (like the event object) are passed into the handler unless explicitly intended.
32: 
33: **Reason for change:**
34: - Prevent application crash due to circular references in the event object during JSON serialization.
35: 

## 2026-03-17

### Fixed: TimelineChartModal Scroll Wheel Bug

**File(s) changed:** `src/components/CallLogger/DurationMeter/TimelineChartModal.jsx`

**Old behavior:**
- Mouse wheel scrolling on the timeline modal did not work when the modal was initially opened.
- Scrolling only started working after changing the month (triggering a state update).

**New behavior:**
- Mouse wheel scrolling works immediately upon opening the modal.
- `useRef` was replaced with a `useState` callback ref (`setScrollEl`) so that the component re-renders and attaches the wheel event listener exactly when MUI Dialog mounts the scroll container.

**Reason for change:**
- The `useEffect` that attached the wheel listener ran before MUI Dialog mounted its children, leaving the `scrollRef.current` as `null` initially.


## 2026-02-18

### Fixed: Call Timer Start/Pause/Resume/End (Critical)

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

**Old behavior:**

- Pause/Resume showed **wrong duration** (e.g., 1min active + 2min pause = displayed 3min after resume)
- Screen would **freeze/become disabled** after ending a call, requiring page refresh
- Pause data was **lost on page refresh** (pause start time was never saved)
- Timer **stopped** when the user switched to another tab (browser throttled setInterval)
- Rapid pause/resume clicks could create **duplicate timer intervals**

**New behavior:**

- Timer uses **ref-based timing** — all timing values are stored in refs that are always current, eliminating stale closure bugs
- `calculateElapsedTime()` has **zero React dependencies** — reads only from refs and timestamps
- Timer works perfectly in **background tabs** — calculates from timestamps, not counter increments
- **Type consistency** enforced — `pauseStartTimeRef` is always a number (timestamp), never a Date object
- `handleEndCall` clears **all refs, state, and localStorage** atomically, preventing frozen UI
- `beforeunload` handler correctly saves pause start time using number check instead of `instanceof Date`
- Pause/Resume guards use **refs** (`isPausedRef.current`) to prevent double-pause/resume even if state hasn't updated

**Reason for change:**
Support team reported calls ending unexpectedly, screen freezing (disabled state), and incorrect duration calculations. Root cause was React's async state updates causing stale closures in `setInterval` callbacks.

### Hardened: Additional Timer Edge Cases (Round 2)

**File(s) changed:** `src/components/CallLogger/CallLogger.jsx`

- **Stuck call cleanup**: Now clears ALL refs and ALL localStorage keys (was only clearing 2 of 7)
- **Timer resumption effect**: Only starts timer if not already running (`!timerRef.current` guard); explicitly stops timer when paused; kills orphaned timers when no call is active
- **handleRecordModeClose**: Only clears call if no active timer running (prevents premature call termination); removed duplicate `setCurrentCall(null)` call
- **onStartCall**: Wrapped in try-catch to prevent unhandled promise rejection from freezing UI
- **Overall**: All flows (start, pause, resume, end, close, refresh) now have defensive guards
