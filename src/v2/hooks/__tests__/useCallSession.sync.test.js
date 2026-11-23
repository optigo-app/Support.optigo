import { renderHook, act } from "@testing-library/react";
import { useCallSession } from "../useCallSession";
import {
  clearActiveCallSession,
  getActiveCallSession,
  publishActiveCallSession,
} from "../../rxjs/activeCallSessionStore";

const call = { sr: 501, callBy: "Rina", company: "Optigo Carely" };

const setup = (overrides = {}) => {
  const props = {
    CurrentCall: call,
    setCurrentCall: jest.fn(),
    endCall: jest.fn().mockResolvedValue({ success: true }),
    PauseCall: jest.fn().mockResolvedValue({}),
    ResumeCall: jest.fn().mockResolvedValue({}),
    activeFollowUp: null,
    setActiveFollowUp: jest.fn(),
    pauseFollowUpCall: jest.fn(),
    resumeFollowUpCall: jest.fn(),
    endFollowUpCall: jest.fn(),
    sliders: {},
    showNotification: jest.fn(),
    resolveCallBySr: jest.fn((sr) => (String(sr) === "501" ? call : null)),
    ...overrides,
  };
  const hook = renderHook((p) => useCallSession(p), { initialProps: props });
  return { props, ...hook };
};

describe("useCallSession <-> shared live call", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => clearActiveCallSession());
  });

  it("publishes a call started on the Call Log page", () => {
    const { result } = setup();
    act(() => result.current.handleStartRecording());
    expect(getActiveCallSession()).toMatchObject({ sr: 501, source: "calllog", isPaused: false, callerName: "Rina" });
  });

  it("publishes pause and resume done on the Call Log page", async () => {
    const { result } = setup();
    act(() => result.current.handleStartRecording());
    await act(async () => {
      await result.current.handlePauseRecording();
    });
    expect(getActiveCallSession().isPaused).toBe(true);
    await act(async () => {
      await result.current.handleResumeRecording();
    });
    expect(getActiveCallSession().isPaused).toBe(false);
  });

  it("ending on the Call Log page clears the shared call", async () => {
    const { result, props } = setup();
    act(() => result.current.handleStartRecording());
    await act(async () => {
      await result.current.handleEndCall();
    });
    expect(props.endCall).toHaveBeenCalledWith(501, expect.anything());
    expect(getActiveCallSession()).toBeNull();
  });

  it("a call started on Call Chat starts the timer here and selects that call", () => {
    const { result, props } = setup({ CurrentCall: null });
    act(() => {
      publishActiveCallSession({ sr: 501, startTime: Date.now() - 30000, callerName: "Rina" }, "callchat");
    });
    expect(props.setCurrentCall).toHaveBeenCalledWith(call);
    expect(result.current.callStartTimeRef.current).toBeGreaterThan(0);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.recordingTimeRef.current).toBeGreaterThanOrEqual(29);
  });

  it("pause and resume done on Call Chat freeze and restart the timer here", () => {
    const { result } = setup();
    const start = Date.now() - 20000;
    act(() => {
      publishActiveCallSession({ sr: 501, startTime: start }, "callchat");
    });
    act(() => {
      publishActiveCallSession({ sr: 501, startTime: start, isPaused: true, pausedAt: start + 12000 }, "callchat");
    });
    expect(result.current.isPaused).toBe(true);
    expect(result.current.recordingTimeRef.current).toBe(12);
    act(() => {
      publishActiveCallSession({ sr: 501, startTime: start, isPaused: false, pausedDurationMs: 5000 }, "callchat");
    });
    expect(result.current.isPaused).toBe(false);
  });

  it("ending the call on Call Chat ends it here without calling the end API again", () => {
    const { result, props } = setup();
    act(() => {
      publishActiveCallSession({ sr: 501, startTime: Date.now() - 10000 }, "callchat");
    });
    expect(result.current.callStartTimeRef.current).toBeGreaterThan(0);
    act(() => clearActiveCallSession());
    expect(props.endCall).not.toHaveBeenCalled();
    expect(props.setCurrentCall).toHaveBeenCalledWith(null);
    expect(result.current.callStartTimeRef.current).toBeNull();
    expect(localStorage.getItem("call_start_timestamp")).toBeNull();
  });

  it("mounting with a call already running on Call Chat adopts it", () => {
    publishActiveCallSession({ sr: 501, startTime: Date.now() - 8000, isPaused: true, pausedAt: Date.now() - 2000 }, "callchat");
    const { result } = setup();
    expect(result.current.isPaused).toBe(true);
    expect(result.current.callStartTimeRef.current).toBeGreaterThan(0);
  });
});
