const load = () => {
  let store;
  let service;
  jest.isolateModules(() => {
    store = require("../../../../rxjs/activeCallSessionStore");
    service = require("../callStreamService").callStreamService;
  });
  return { store, service };
};

const thread = { sr: 55, callBy: "Rina", company: "Optigo Carely", name: "Rina" };

describe("Call Chat <-> Call Log shared live call", () => {
  beforeEach(() => localStorage.clear());

  it("a call started in Call Chat is published for the Call Log page", () => {
    const { store, service } = load();
    service.startCall(thread);
    expect(store.getActiveCallSession()).toMatchObject({ sr: 55, source: "callchat", isPaused: false });
  });

  it("a call started on the Call Log page becomes Call Chat's live call and blocks a second start", () => {
    const { store, service } = load();
    store.publishActiveCallSession(
      { sr: 77, startTime: Date.now() - 65000, callerName: "Amit", company: "ACME" },
      "calllog",
    );
    const live = service.activeCall$.getValue();
    expect(live).toMatchObject({ sr: 77, callerName: "Amit", company: "ACME", isPaused: false });
    expect(live.durationSeconds).toBeGreaterThanOrEqual(64);
    expect(service.startCall(thread)).toBeNull();
    expect(service.activeCall$.getValue().sr).toBe(77);
  });

  it("starting with a call already running on Call Log in the page store at load restores it", () => {
    const first = load();
    first.store.publishActiveCallSession({ sr: 88, startTime: Date.now() - 3000 }, "calllog");
    const second = load();
    expect(second.service.activeCall$.getValue()).toMatchObject({ sr: 88 });
  });

  it("pause and resume done on the Call Log page show up in Call Chat", () => {
    const { store, service } = load();
    const start = Date.now() - 20000;
    store.publishActiveCallSession({ sr: 77, startTime: start }, "calllog");
    store.publishActiveCallSession({ sr: 77, startTime: start, isPaused: true, pausedAt: start + 10000 }, "calllog");
    expect(service.activeCall$.getValue()).toMatchObject({ isPaused: true, durationSeconds: 10 });
    store.publishActiveCallSession({ sr: 77, startTime: start, isPaused: false, pausedDurationMs: 5000 }, "calllog");
    expect(service.activeCall$.getValue()).toMatchObject({ isPaused: false, pausedDurationMs: 5000 });
  });

  it("pause and resume done in Call Chat reach the Call Log page", () => {
    const { store, service } = load();
    service.startCall(thread);
    service.updateActiveCall({ isPaused: true, pausedAt: Date.now() });
    expect(store.getActiveCallSession().isPaused).toBe(true);
    service.updateActiveCall({ isPaused: false, pausedAt: null, pausedDurationMs: 3000 });
    expect(store.getActiveCallSession()).toMatchObject({ isPaused: false, pausedDurationMs: 3000 });
  });

  it("pauseCall and resumeCall freeze and restart the live call and are idempotent", () => {
    const { store, service } = load();
    expect(service.pauseCall()).toBe(false);
    expect(service.resumeCall()).toBe(false);
    service.startCall(thread, { followUpId: 9, isFollowUp: true });
    expect(service.pauseCall()).toBe(true);
    expect(service.pauseCall()).toBe(false);
    expect(service.activeCall$.getValue().isPaused).toBe(true);
    expect(store.getActiveCallSession().isPaused).toBe(true);
    expect(service.resumeCall()).toBe(true);
    expect(service.resumeCall()).toBe(false);
    expect(service.activeCall$.getValue()).toMatchObject({ isPaused: false, pausedAt: null });
    expect(store.getActiveCallSession().isPaused).toBe(false);
  });

  it("per-second timer ticks do not republish the session", () => {
    const { store, service } = load();
    service.startCall(thread);
    const stamp = store.getActiveCallSession().updatedAt;
    service.updateActiveCall({ durationSeconds: 12 });
    expect(store.getActiveCallSession().updatedAt).toBe(stamp);
  });

  it("ending the call on the Call Log page ends it in Call Chat and drops the stale chat session", () => {
    const { store, service } = load();
    service.startCall(thread);
    expect(localStorage.getItem("newcall_active_voip_session")).not.toBeNull();
    store.clearActiveCallSession({ resetCallLogKeys: false });
    expect(service.activeCall$.getValue()).toBeNull();
    expect(localStorage.getItem("newcall_active_voip_session")).toBeNull();
  });

  it("ending the call in Call Chat clears the shared session and the Call Log timer keys", () => {
    const { store, service } = load();
    localStorage.setItem("call_start_timestamp", "123");
    service.startCall(thread);
    service.endCall();
    expect(store.getActiveCallSession()).toBeNull();
    expect(localStorage.getItem("call_start_timestamp")).toBeNull();
  });
});
