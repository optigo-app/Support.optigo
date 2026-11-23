const load = () => {
  let mod;
  jest.isolateModules(() => {
    mod = require("../activeCallSessionStore");
  });
  return mod;
};

const base = (over = {}) => ({
  sr: 101,
  followUpId: null,
  isFollowUp: false,
  startTime: Date.now() - 5000,
  pausedDurationMs: 0,
  pausedAt: null,
  isPaused: false,
  ...over,
});

describe("activeCallSessionStore", () => {
  beforeEach(() => localStorage.clear());

  it("publishes a live call and ignores repeats with the same sync fields", () => {
    const store = load();
    const session = base();
    expect(store.publishActiveCallSession(session, "calllog")).toBe(true);
    expect(store.getActiveCallSession()).toMatchObject({ sr: 101, source: "calllog" });
    expect(store.publishActiveCallSession({ ...session, callerName: "x" }, "callchat")).toBe(false);
    expect(store.getActiveCallSession().source).toBe("calllog");
  });

  it("treats sub-second pause differences as the same session (no ping-pong)", () => {
    const store = load();
    const session = base({ pausedDurationMs: 12500 });
    store.publishActiveCallSession(session, "callchat");
    expect(store.publishActiveCallSession({ ...session, pausedDurationMs: 12000 }, "calllog")).toBe(false);
  });

  it("publishes pause and resume changes", () => {
    const store = load();
    const session = base();
    store.publishActiveCallSession(session, "calllog");
    expect(store.publishActiveCallSession({ ...session, isPaused: true, pausedAt: Date.now() }, "callchat")).toBe(true);
    expect(store.getActiveCallSession()).toMatchObject({ isPaused: true, source: "callchat" });
    expect(store.publishActiveCallSession({ ...session, isPaused: false, pausedDurationMs: 4000 }, "callchat")).toBe(true);
    expect(store.getActiveCallSession().isPaused).toBe(false);
  });

  it("rejects invalid or day-old sessions", () => {
    const store = load();
    expect(store.publishActiveCallSession(null, "calllog")).toBe(false);
    expect(store.publishActiveCallSession(base({ sr: null }), "calllog")).toBe(false);
    expect(store.publishActiveCallSession(base({ startTime: Date.now() - 90000000 }), "calllog")).toBe(false);
    expect(store.getActiveCallSession()).toBeNull();
  });

  it("clear removes the session and the call log timer keys so no ghost call is restored", () => {
    const store = load();
    localStorage.setItem("call_start_timestamp", "123");
    localStorage.setItem("current_call_data", "{}");
    store.publishActiveCallSession(base(), "calllog");
    store.clearActiveCallSession();
    expect(store.getActiveCallSession()).toBeNull();
    expect(localStorage.getItem(store.ACTIVE_CALL_SESSION_KEY)).toBeNull();
    expect(localStorage.getItem("call_start_timestamp")).toBeNull();
    expect(localStorage.getItem("current_call_data")).toBeNull();
  });

  it("clear keeps the parent call when a follow-up ends, and keeps keys when told to", () => {
    const store = load();
    localStorage.setItem("current_call_data", "{\"sr\":101}");
    store.publishActiveCallSession(base({ isFollowUp: true, followUpId: 7 }), "calllog");
    store.clearActiveCallSession();
    expect(localStorage.getItem("current_call_data")).not.toBeNull();

    localStorage.setItem("call_start_timestamp", "123");
    store.publishActiveCallSession(base(), "calllog");
    store.clearActiveCallSession({ resetCallLogKeys: false });
    expect(localStorage.getItem("call_start_timestamp")).toBe("123");
  });

  it("follows changes made in another tab through the storage event", () => {
    const store = load();
    const seen = [];
    store.activeCallSession$.subscribe((s) => seen.push(s?.sr ?? null));
    const incoming = { ...base({ sr: 202 }), source: "callchat" };
    localStorage.setItem(store.ACTIVE_CALL_SESSION_KEY, JSON.stringify(incoming));
    window.dispatchEvent(new StorageEvent("storage", { key: store.ACTIVE_CALL_SESSION_KEY }));
    expect(store.getActiveCallSession().sr).toBe(202);
    localStorage.removeItem(store.ACTIVE_CALL_SESSION_KEY);
    window.dispatchEvent(new StorageEvent("storage", { key: store.ACTIVE_CALL_SESSION_KEY }));
    expect(store.getActiveCallSession()).toBeNull();
    expect(seen).toEqual([null, 202, null]);
  });
});
