jest.mock("sonner", () => ({ toast: { info: jest.fn() } }));

const load = () => {
  let events;
  let store;
  jest.isolateModules(() => {
    store = require("../../../../rxjs/activeCallSessionStore");
    events = require("../newCallEvents");
  });
  return { events, store };
};

describe("duration edit is blocked while a call is running", () => {
  beforeEach(() => localStorage.clear());

  it("blocks a started call that has not ended", () => {
    const { events } = load();
    expect(events.isLiveCall({ sr: 1, callStart: "2026-11-23 11:52:00", callClosed: "" })).toBe(true);
    expect(events.isLiveCall({ sr: 1, callStart: "2026-11-23 11:52:00", callClosed: "1900-01-01 00:00:00" })).toBe(true);
    expect(events.openDurationModal({ sr: 1, callStart: "2026-11-23 11:52:00" })).toBe(false);
    expect(events.durationModal$.getValue().open).toBe(false);
  });

  it("blocks the call in the shared live session even before callStart arrives", () => {
    const { events, store } = load();
    store.publishActiveCallSession({ sr: 7, startTime: Date.now() - 1000 }, "callchat");
    expect(events.isLiveCall({ sr: 7 })).toBe(true);
  });

  it("allows editing a finished call, including a finished call while a follow-up runs", () => {
    const { events, store } = load();
    const done = { sr: 9, callStart: "2026-11-23 11:00:00", callClosed: "2026-11-23 11:05:00" };
    expect(events.isLiveCall(done)).toBe(false);
    store.publishActiveCallSession({ sr: 9, startTime: Date.now() - 1000, isFollowUp: true, followUpId: 3 }, "callchat");
    expect(events.openDurationModal(done)).toBe(true);
    expect(events.durationModal$.getValue().open).toBe(true);
  });
});
